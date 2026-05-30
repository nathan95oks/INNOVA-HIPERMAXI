"""
document_parser.py — Extrae estructura jerárquica de SOPs .docx

Preserva: títulos, pasos numerados, listas, imágenes embebidas.
Produce un ParsedDocument con secciones semánticas listas para chunking.

Decisiones de diseño:
- Usa python-docx (no docx2txt/textract) porque es la única librería
  que expone los estilos de párrafo sin dependencias externas pesadas.
- Detecta pasos lógicos tanto por estilo formal (Heading 1/2/3) como
  por patrones regex (numeración, viñetas), porque los .docx de Hipermaxi
  pueden no tener estilos formales consistentes.
- Extrae imágenes embebidas con hash MD5 para deduplicación automática.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from docx import Document
import hashlib
import re


# ──────────────────────────────────────────────
# Data Models
# ──────────────────────────────────────────────

@dataclass
class ParsedSection:
    """Representa una sección lógica del SOP (ej: 'Etapa 1', 'Paso 3')."""

    heading: str  # Título de la sección
    level: int  # Profundidad jerárquica (1=H1, 2=H2, 3=H3)
    content: list[str] = field(default_factory=list)  # Párrafos de texto
    images: list[str] = field(default_factory=list)  # Rutas a imágenes extraídas
    parent_heading: str | None = None  # Sección padre (para contexto)


@dataclass
class ParsedDocument:
    """Documento SOP completo parseado."""

    sop_code: str  # Ej: "SOP-SR-01"
    title: str  # Título del documento
    source_file: str  # Nombre del archivo original
    sections: list[ParsedSection] = field(default_factory=list)


# ──────────────────────────────────────────────
# Constants
# ──────────────────────────────────────────────

# Mapeo de estilos Word → niveles jerárquicos
HEADING_STYLES: dict[str, int] = {
    "Heading 1": 1,
    "Heading 2": 2,
    "Heading 3": 3,
    "Title": 0,
    "Subtitle": 1,
    # Estilos en español (algunos .docx los tienen localizados)
    "Título 1": 1,
    "Título 2": 2,
    "Título 3": 3,
    "Título": 0,
}

# Patrones que indican un nuevo paso lógico dentro del texto
STEP_PATTERNS: list[re.Pattern] = [
    re.compile(r"^(Paso|Step|Etapa|Fase)\s+\d+", re.IGNORECASE),
    re.compile(r"^\d+\.\s+"),  # "1. ", "2. "
    re.compile(r"^[a-z]\)\s+"),  # "a) ", "b) "
]

# Mapeo manual basado en los nombres conocidos de los SOPs de Hipermaxi
_KNOWN_SOP_MAP: dict[str, str] = {
    "CREDENCIALES": "SOP-SR-01",
    "ACTIVACION": "SOP-SR-02",
    "ACTIVACIÓ": "SOP-SR-02",
    "REENVIO": "SOP-SR-03",
    "REENVÍ": "SOP-SR-03",
    "PRODUCTO": "SOP-04",
    "FACTURA": "SOP-05",
    "AVD": "SOP-06",
    "DESPACHO": "SOP-06",
}


# ──────────────────────────────────────────────
# Internal helpers
# ──────────────────────────────────────────────

def _detect_sop_code(filename: str, first_heading: str) -> str:
    """Infiere el sop_code del nombre de archivo o primer heading."""
    # Intentar extraer del nombre de archivo con regex
    for pattern in (r"(SOP[-_]SR[-_]\d+)", r"(SOP[-_]\d+)"):
        match = re.search(pattern, filename, re.IGNORECASE)
        if match:
            return match.group(1).upper().replace("_", "-")

    # Fallback: mapeo manual basado en keywords del nombre o heading
    combined = (filename + " " + first_heading).upper()
    for key, code in _KNOWN_SOP_MAP.items():
        if key in combined:
            return code

    return f"SOP-UNKNOWN-{hashlib.md5(filename.encode()).hexdigest()[:6]}"


def _extract_images(doc: Document, output_dir: Path) -> dict[str, str]:
    """
    Extrae imágenes embebidas del documento y las guarda en disco.

    Returns:
        Diccionario {rId: ruta_archivo} para vincular imágenes a párrafos.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    image_map: dict[str, str] = {}

    for rel in doc.part.rels.values():
        if "image" in rel.reltype:
            try:
                image_data = rel.target_part.blob
                ext = rel.target_part.content_type.split("/")[-1]
                if ext == "jpeg":
                    ext = "jpg"
                img_hash = hashlib.md5(image_data).hexdigest()[:8]
                img_path = output_dir / f"img_{img_hash}.{ext}"
                img_path.write_bytes(image_data)
                image_map[rel.rId] = str(img_path)
            except Exception:
                # Imagen corrupta o tipo no soportado — omitir
                continue

    return image_map


def _paragraph_has_image(paragraph) -> list[str]:
    """Detecta si un párrafo contiene imágenes inline, retorna sus rIds."""
    image_rids: list[str] = []
    for run in paragraph.runs:
        xml = run._element.xml
        if "blip" in xml:
            matches = re.findall(r'r:embed="(rId\d+)"', xml)
            image_rids.extend(matches)
    return image_rids


def _is_bold_heading(paragraph) -> bool:
    """
    Heurística: detecta headings informales (texto en negrita sin estilo
    formal de Heading). Común en documentos Word creados sin plantilla.
    """
    if not paragraph.text.strip():
        return False

    # Si todos los runs son bold y el texto es corto, probablemente es heading
    runs_with_text = [r for r in paragraph.runs if r.text.strip()]
    if not runs_with_text:
        return False

    all_bold = all(r.bold for r in runs_with_text)
    text_length = len(paragraph.text.strip())

    # Heading informal: bold + corto (< 120 chars) + no termina en punto
    return all_bold and text_length < 120 and not paragraph.text.strip().endswith(".")


# ──────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────

def parse_docx(
    filepath: str | Path,
    images_dir: str | Path = "knowledge/images",
) -> ParsedDocument:
    """
    Parsea un archivo .docx preservando estructura jerárquica.

    Estrategia de detección de secciones (en orden de prioridad):
    1. Estilos formales (Heading 1/2/3)
    2. Texto en negrita como heading informal
    3. Patrones de paso (``Paso N``, ``1.``, ``a)``)

    Args:
        filepath: Ruta al archivo .docx
        images_dir: Directorio base donde guardar imágenes extraídas

    Returns:
        ParsedDocument con secciones estructuradas y metadata
    """
    filepath = Path(filepath)
    doc = Document(str(filepath))
    img_output_dir = Path(images_dir) / filepath.stem

    # Extraer todas las imágenes del documento
    image_map = _extract_images(doc, img_output_dir)

    sections: list[ParsedSection] = []
    current_section: ParsedSection | None = None
    heading_stack: list[str] = []  # Para tracking del padre jerárquico
    first_heading = ""

    for para in doc.paragraphs:
        text = para.text.strip()
        if not text and not _paragraph_has_image(para):
            continue

        style_name = para.style.name if para.style else "Normal"

        # ── Detección de nivel jerárquico ──
        level: int | None = HEADING_STYLES.get(style_name)

        # Fallback 1: Negrita informal como heading
        if level is None and _is_bold_heading(para):
            level = 2  # Tratar como H2

        # Fallback 2: Patrón de paso lógico
        if level is None and text:
            for pattern in STEP_PATTERNS:
                if pattern.match(text):
                    level = 3  # Tratar pasos como H3
                    break

        # ── Procesar según tipo ──
        if level is not None and level > 0:
            # Es un heading → nueva sección
            if current_section:
                sections.append(current_section)

            # Actualizar stack de headings para tracking de padres
            while heading_stack and len(heading_stack) >= level:
                heading_stack.pop()
            parent = heading_stack[-1] if heading_stack else None
            heading_stack.append(text)

            if not first_heading:
                first_heading = text

            current_section = ParsedSection(
                heading=text,
                level=level,
                parent_heading=parent,
            )
        elif current_section:
            # Agregar contenido a la sección actual
            if text:
                current_section.content.append(text)

            # Vincular imágenes encontradas en este párrafo
            for rid in _paragraph_has_image(para):
                if rid in image_map:
                    current_section.images.append(image_map[rid])
        else:
            # Texto antes del primer heading → crear sección raíz
            if not first_heading and text:
                first_heading = text
            current_section = ParsedSection(
                heading=first_heading or filepath.stem,
                level=1,
                content=[text] if text else [],
            )

    # No olvidar la última sección
    if current_section:
        sections.append(current_section)

    sop_code = _detect_sop_code(filepath.name, first_heading)

    return ParsedDocument(
        sop_code=sop_code,
        title=first_heading or filepath.stem,
        source_file=filepath.name,
        sections=sections,
    )

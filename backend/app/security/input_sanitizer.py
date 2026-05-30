"""
input_sanitizer.py — Filtra y normaliza input del usuario ANTES de que
llegue al LLM. Primera línea de defensa contra prompt injection.

Estrategia:
- Normalización unicode (previene homoglyph attacks)
- Truncamiento a MAX_INPUT_LENGTH
- Detección de patrones de inyección conocidos
- Eliminación de delimitadores XML que podrían confundir el parser del prompt
"""
from __future__ import annotations

import re
import unicodedata


# ──────────────────────────────────────────────
# Patrones de prompt injection / jailbreak
# ──────────────────────────────────────────────

INJECTION_PATTERNS: list[re.Pattern] = [
    # Intentos de override del system prompt
    re.compile(
        r"(ignore|forget|disregard)\s+(all\s+)?(previous|above|prior)\s+"
        r"(instructions?|rules?|prompts?)",
        re.I,
    ),
    re.compile(r"(you\s+are\s+now|act\s+as|pretend\s+to\s+be|roleplay\s+as)", re.I),
    re.compile(r"(system\s*prompt|system\s*instruction|system\s*message)", re.I),
    # Intentos de extracción del prompt
    re.compile(
        r"(repeat|show|print|display|reveal|output)\s+(your|the|system)\s+"
        r"(instructions?|prompt|rules?)",
        re.I,
    ),
    re.compile(
        r"(what\s+are\s+your|tell\s+me\s+your)\s+"
        r"(instructions?|rules?|guidelines?|constraints?)",
        re.I,
    ),
    # Intentos de escapar el contexto con delimitadores propios del prompt
    re.compile(
        r"</?(system|assistant|user|contexto_sop|base_de_conocimiento|mensaje_proveedor)",
        re.I,
    ),
    # Intentos de forzar aprobación de procesos
    re.compile(
        r"(aprueba|approve|autoriza|bypass|skip)\s+(el|la|the|this)?\s*"
        r"(proceso|validaci[oó]n|verificaci[oó]n|step)",
        re.I,
    ),
    # Inyección de código / comandos del sistema
    re.compile(r"(exec|eval|import|require|subprocess|os\.system)\s*\(", re.I),
    # Intentos de DAN / jailbreak en español
    re.compile(
        r"(ignora|olvida|descarta)\s+(todas?\s+)?(las?\s+)?"
        r"(instrucciones?|reglas?|restricciones?)",
        re.I,
    ),
]

# Homoglyphs cirílicos que parecen caracteres latinos
_HOMOGLYPH_MAP: dict[str, str] = {
    "\u0410": "A", "\u0412": "B", "\u0421": "C", "\u0415": "E",
    "\u041d": "H", "\u041a": "K", "\u041c": "M", "\u041e": "O",
    "\u0420": "P", "\u0422": "T", "\u0425": "X",
    "\u0430": "a", "\u0435": "e", "\u043e": "o", "\u0440": "p",
    "\u0441": "c", "\u0443": "y", "\u0445": "x",
}

# Caracteres de control invisibles (zero-width, etc.)
_INVISIBLE_CHARS_RE = re.compile(
    r"[\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff]"
)

# Delimitadores XML del sistema de prompts
_XML_TAG_RE = re.compile(r"</?[a-zA-Z_][a-zA-Z0-9_]*[^>]*>")


class InputSanitizer:
    """
    Sanitiza y valida input del usuario antes de procesarlo.

    NO bloquea los mensajes sospechosos — los marca y deja pasar.
    La defensa real es el System Instruction blindado (Capa 2).
    Esta capa solo normaliza y registra anomalías.
    """

    MAX_INPUT_LENGTH = 2000  # Caracteres máximos

    def sanitize(self, raw_input: str) -> tuple[str, list[str]]:
        """
        Sanitiza el input del usuario.

        Returns:
            (texto_limpio, lista_de_alertas)
            Si lista_de_alertas tiene items, el input fue modificado o es sospechoso.
        """
        alerts: list[str] = []
        text = raw_input

        # 1. Normalizar unicode (prevenir homoglyph attacks)
        text = self._normalize_unicode(text)

        # 2. Truncar si excede el largo máximo
        if len(text) > self.MAX_INPUT_LENGTH:
            text = text[: self.MAX_INPUT_LENGTH]
            alerts.append("INPUT_TRUNCATED")

        # 3. Detectar patrones de inyección (ANTES de eliminar tags XML)
        for pattern in INJECTION_PATTERNS:
            if pattern.search(text):
                alerts.append(f"INJECTION_PATTERN_DETECTED:{pattern.pattern[:60]}")

        # 4. Eliminar tags XML que podrían confundir el parser del prompt
        text = _XML_TAG_RE.sub("", text)

        if alerts:
            alerts.append("INJECTION_FLAGGED_FOR_MONITORING")

        return text.strip(), alerts

    def _normalize_unicode(self, text: str) -> str:
        """Normaliza caracteres unicode y reemplaza homoglyphs conocidos."""
        # Normalización NFKC: descompone y recompone en forma canónica
        text = unicodedata.normalize("NFKC", text)

        # Reemplazar homoglyphs cirílicos conocidos
        for glyph, replacement in _HOMOGLYPH_MAP.items():
            text = text.replace(glyph, replacement)

        # Eliminar caracteres de control invisibles
        text = _INVISIBLE_CHARS_RE.sub("", text)

        return text

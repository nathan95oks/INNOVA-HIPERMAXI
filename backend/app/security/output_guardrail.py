"""
output_guardrail.py — Valida y filtra la respuesta de Gemini ANTES
de enviarla al frontend. Última línea de defensa.

Validaciones:
1. Campos requeridos presentes
2. sop_referencia en la lista de SOPs conocidos
3. accion_ui.tipo en la lista de acciones válidas
4. Sin leaks del system prompt en el mensaje
5. Confianza en rango [0.0, 1.0]
6. Sanitización XSS básica del mensaje
"""
from __future__ import annotations

import re


# ──────────────────────────────────────────────
# Constantes de validación
# ──────────────────────────────────────────────

VALID_SOP_CODES: frozenset[str] = frozenset({
    "SOP-SR-01", "SOP-SR-02", "SOP-SR-03",
    "SOP-04", "SOP-05", "SOP-06", "N/A",
})

VALID_UI_ACTIONS: frozenset[str] = frozenset({
    "highlight", "show_image", "show_alert", "navigate", "none",
})

REQUIRED_FIELDS: frozenset[str] = frozenset({
    "mensaje", "accion_ui", "sop_referencia",
    "requiere_escalamiento", "confianza",
})

# Patrones que NO deberían aparecer en la respuesta al usuario
# (leaks del system prompt o estructura interna)
_LEAK_PATTERNS: list[re.Pattern] = [
    re.compile(r"system\s*(instruction|prompt)", re.I),
    re.compile(r"<base_de_conocimiento>", re.I),
    re.compile(r"BOUNDARIES?\s+ABSOLUTOS?", re.I),
    re.compile(r"response_schema", re.I),
    re.compile(r"chunk_id|sop_code|section_path", re.I),
    re.compile(r"INJECTION_PATTERN|INPUT_TRUNCATED", re.I),
]

# Tags HTML permitidos en el mensaje (solo formato básico)
_ALLOWED_HTML_TAGS_RE = re.compile(
    r"<(?!/?(?:b|i|strong|em)\b)[^>]+>",
    re.I,
)


class OutputGuardrail:
    """
    Valida la respuesta del LLM antes de entregarla al frontend.

    Uso:
        guardrail = OutputGuardrail()
        validated, is_valid = guardrail.validate(raw_response_dict)
        # validated es siempre seguro de enviar al frontend
    """

    def validate(self, response: dict) -> tuple[dict, bool]:
        """
        Valida y sanitiza la respuesta del LLM.

        Returns:
            (respuesta_validada, es_valida)
            `es_valida` es False si se necesitó una respuesta de fallback.
            La respuesta retornada siempre es segura para el frontend.
        """
        # 1. Verificar campos requeridos
        if not REQUIRED_FIELDS.issubset(response.keys()):
            missing = REQUIRED_FIELDS - response.keys()
            return self._fallback_response(f"Respuesta incompleta: {missing}"), False

        # 2. Validar sop_referencia
        if response.get("sop_referencia") not in VALID_SOP_CODES:
            response["sop_referencia"] = "N/A"
            current_conf = float(response.get("confianza", 0))
            response["confianza"] = max(0.0, current_conf - 0.3)

        # 3. Validar accion_ui
        ui_action = response.get("accion_ui")
        if not isinstance(ui_action, dict) or ui_action.get("tipo") not in VALID_UI_ACTIONS:
            response["accion_ui"] = {"tipo": "none"}

        # 4. Verificar leaks del system prompt en el mensaje
        mensaje = response.get("mensaje", "")
        for pattern in _LEAK_PATTERNS:
            if pattern.search(mensaje):
                return self._fallback_response(
                    "¿En qué proceso del portal puedo ayudarte?"
                ), False

        # 5. Normalizar confianza al rango [0.0, 1.0]
        try:
            confianza = float(response.get("confianza", 0))
            response["confianza"] = round(max(0.0, min(1.0, confianza)), 4)
        except (TypeError, ValueError):
            response["confianza"] = 0.0

        # 6. Sanitizar el mensaje (prevenir XSS si se renderiza en HTML)
        sanitized = self._sanitize_html(mensaje)
        # 6b. Eliminar códigos SOP internos que no debe ver el proveedor
        sanitized = self._remove_sop_codes(sanitized)
        # 6c. Eliminar emojis (tono profesional/serio)
        response["mensaje"] = self._remove_emojis(sanitized)

        # 7. Asegurar que requiere_escalamiento es bool
        response["requiere_escalamiento"] = bool(
            response.get("requiere_escalamiento", False)
        )

        return response, True

    def _fallback_response(self, _reason: str = "") -> dict:
        """Respuesta segura cuando la validación falla."""
        return {
            "mensaje": (
                "Lo siento, no pude procesar tu consulta correctamente. "
                "¿Puedo ayudarte con algún proceso del portal de Hipermaxi?"
            ),
            "accion_ui": {"tipo": "none"},
            "sop_referencia": "N/A",
            "requiere_escalamiento": False,
            "confianza": 0.0,
        }

    def _sanitize_html(self, text: str) -> str:
        """Elimina tags HTML potencialmente peligrosos (permite b, i, strong, em)."""
        return _ALLOWED_HTML_TAGS_RE.sub("", text)

    def _remove_sop_codes(self, text: str) -> str:
        """Elimina códigos SOP internos del texto visible al proveedor."""
        # Elimina "el SOP-SR-03", "según el SOP-04", "(SOP-SR-01)", etc.
        cleaned = re.sub(
            r'\b(?:el|los|la|las|un|según|de|del|en|al)\s+\(?\bSOP-(?:SR-)?\d+\b\)?',
            '',
            text,
            flags=re.I,
        )
        # Elimina cualquier código SOP restante sin artículo
        cleaned = re.sub(r'\(?\bSOP-(?:SR-)?\d+\b\)?[,.]?', '', cleaned, flags=re.I)
        # Limpia puntuación y espacios sueltos
        cleaned = re.sub(r'\s*,\s*,', ',', cleaned)
        cleaned = re.sub(r',\s*\.', '.', cleaned)
        cleaned = re.sub(r'\(\s*\)', '', cleaned)
        cleaned = re.sub(r'\s{2,}', ' ', cleaned)
        return cleaned.strip()

    def _remove_emojis(self, text: str) -> str:
        """Elimina emojis para mantener un tono profesional."""
        emoji_pattern = re.compile(
            "[\U0001F000-\U0001FFFF"
            "\U00002600-\U000027BF"
            "\U00002300-\U000023FF"
            "\U00002B00-\U00002BFF"
            "\U0001F900-\U0001F9FF"
            "\U0001FA00-\U0001FA6F"
            "\U0001FA70-\U0001FAFF"
            "\u2705\u26A0\uFE0F\u2714\u2716"
            "]+",
            flags=re.UNICODE,
        )
        cleaned = emoji_pattern.sub('', text)
        return re.sub(r'\s{2,}', ' ', cleaned).strip()

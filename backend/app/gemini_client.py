"""
gemini_client.py — Cliente para Gemini API con JSON structured output.

Integra el contexto RAG en el prompt y valida el schema de salida.
Usa gemini-2.5-flash con temperature baja (0.2) para consistencia
operativa en respuestas de guía de procedimientos.

El schema de respuesta incluye:
- mensaje: Texto para el proveedor
- accion_ui: Instrucción para el frontend (highlight, show_image, etc.)
- sop_referencia: Código del SOP fuente
- requiere_escalamiento: Si necesita intervención humana
- confianza: Score de confianza 0.0 - 1.0
"""
from __future__ import annotations

import json

import google.generativeai as genai

from .rag.context_assembler import AssembledContext


# ──────────────────────────────────────────────
# Response Schema para Gemini
# ──────────────────────────────────────────────

RESPONSE_SCHEMA = {
    "type": "object",
    "properties": {
        "mensaje": {
            "type": "string",
            "description": "Respuesta al proveedor en lenguaje natural",
        },
        "accion_ui": {
            "type": "object",
            "description": "Instrucción para el frontend (opcional)",
            "properties": {
                "tipo": {
                    "type": "string",
                    "enum": [
                        "highlight",
                        "show_image",
                        "show_alert",
                        "navigate",
                        "none",
                    ],
                },
                "selector": {"type": "string"},
                "datos": {"type": "object"},
            },
            "required": ["tipo"],
        },
        "sop_referencia": {
            "type": "string",
            "description": "Código del SOP usado como fuente",
        },
        "requiere_escalamiento": {
            "type": "boolean",
            "description": "True si el caso necesita intervención humana",
        },
        "confianza": {
            "type": "number",
            "description": "0.0-1.0 confianza en la respuesta",
        },
    },
    "required": [
        "mensaje",
        "accion_ui",
        "sop_referencia",
        "requiere_escalamiento",
        "confianza",
    ],
}


class CopilotGeminiClient:
    """
    Cliente del copiloto que integra RAG + Gemini.

    Construye prompts enriquecidos con contexto recuperado y
    gestiona la conversación con historial limitado.
    """

    def __init__(self, api_key: str, system_instruction: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            system_instruction=system_instruction,
            generation_config=genai.GenerationConfig(
                response_mime_type="application/json",
                response_schema=RESPONSE_SCHEMA,
                temperature=0.2,  # Baja para consistencia operativa
                top_p=0.8,
                max_output_tokens=1024,
            ),
        )

    def generate_response(
        self,
        user_message: str,
        context: AssembledContext,
        conversation_history: list[dict] | None = None,
    ) -> dict:
        """
        Genera respuesta del copiloto con contexto RAG.

        Args:
            user_message: Mensaje del proveedor
            context: Contexto ensamblado del retriever
            conversation_history: Historial de la conversación
                                  (cada dict tiene 'role' y 'content')

        Returns:
            Dict con la respuesta JSON parseada
        """
        # Construir el prompt con contexto inyectado
        rag_prompt = self._build_prompt(user_message, context)

        # Construir historial de chat (últimos 6 turnos = 3 pares)
        history: list[dict] = []
        if conversation_history:
            for turn in conversation_history[-6:]:
                history.append({
                    "role": turn["role"],
                    "parts": [turn["content"]],
                })

        # Crear chat con historial y enviar
        chat = self.model.start_chat(history=history)
        response = chat.send_message(rag_prompt)

        # Parsear JSON (Gemini con response_mime_type lo garantiza)
        return json.loads(response.text)

    def _build_prompt(
        self,
        user_message: str,
        context: AssembledContext,
    ) -> str:
        """
        Construye el prompt final con separadores claros.

        Estructura:
        1. Base de conocimiento (contexto RAG con delimitadores XML)
        2. Metadata de la recuperación
        3. Mensaje del proveedor (delimitado)
        """
        sop_list = ", ".join(sorted(context.sop_codes_used)) or "N/A"

        parts = [
            "<base_de_conocimiento>",
            context.formatted_text,
            "</base_de_conocimiento>",
            "",
            f"SOPs consultados: {sop_list}",
            f"Chunks recuperados: {len(context.sources)}",
            "",
            "<mensaje_proveedor>",
            user_message,
            "</mensaje_proveedor>",
        ]

        return "\n".join(parts)

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

from google import genai
from google.genai import types

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
        self._client = genai.Client(api_key=api_key)
        self._model_name = "gemini-2.5-flash"
        self._system_instruction = system_instruction
        self._gen_config = types.GenerateContentConfig(
            system_instruction=system_instruction,
            response_mime_type="application/json",
            response_schema=RESPONSE_SCHEMA,
            temperature=0.2,  # Baja para consistencia operativa
            top_p=0.8,
            max_output_tokens=4096,
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
        history: list[types.Content] = []
        if conversation_history:
            for turn in conversation_history[-6:]:
                role = turn["role"] if turn["role"] in ("user", "model") else "user"
                history.append(
                    types.Content(
                        role=role,
                        parts=[types.Part(text=turn["content"])],
                    )
                )

        # Crear chat con historial y enviar
        chat = self._client.chats.create(
            model=self._model_name,
            config=self._gen_config,
            history=history,
        )
        response = chat.send_message(rag_prompt)

        # Parsear JSON (Gemini con response_mime_type lo garantiza)
        text = response.text or ""
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Respuesta truncada — intentar recuperar el campo mensaje si existe
            import re
            match = re.search(r'"mensaje"\s*:\s*"((?:[^"\\]|\\.)*)"', text)
            mensaje = match.group(1) if match else "Error al procesar la respuesta. Por favor intenta de nuevo."
            return {
                "mensaje": mensaje,
                "accion_ui": {"tipo": "none"},
                "sop_referencia": "N/A",
                "requiere_escalamiento": False,
                "confianza": 0.5,
            }

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

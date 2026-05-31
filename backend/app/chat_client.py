"""
chat_client.py — Cliente del chatbot usando Groq (Llama 3.3 70B).

Free tier generoso (~14k req/día) y endpoint OpenAI-compatible.
Usa JSON mode para forzar respuesta estructurada; el system instruction
incluye el schema explícito para que el modelo lo respete.
"""
from __future__ import annotations

import json
import re

from groq import Groq

from .rag.context_assembler import AssembledContext


_JSON_SCHEMA_HINT = """
## FORMATO DE SALIDA OBLIGATORIO
Responde SIEMPRE con UN solo objeto JSON, sin texto antes ni despues,
sin markdown ni backticks. Schema exacto:
{
  "mensaje": "<respuesta al proveedor en espanol>",
  "accion_ui": {"tipo": "highlight|show_image|show_alert|navigate|none"},
  "sop_referencia": "<codigo del SOP usado, ej: SOP-SR-02, o N/A>",
  "requiere_escalamiento": true|false,
  "confianza": <numero entre 0.0 y 1.0>
}
""".strip()


_FALLBACK_RESPONSE = {
    "mensaje": "Error al procesar la respuesta. Por favor intenta de nuevo.",
    "accion_ui": {"tipo": "none"},
    "sop_referencia": "N/A",
    "requiere_escalamiento": False,
    "confianza": 0.5,
}


class GroqChatClient:
    """Chat client del copiloto. Integra contexto RAG y devuelve JSON estructurado."""

    def __init__(
        self,
        api_key: str,
        system_instruction: str,
        model_name: str = "llama-3.1-8b-instant",
    ):
        self._client = Groq(api_key=api_key)
        self._model_name = model_name
        self._system_instruction = system_instruction + "\n\n" + _JSON_SCHEMA_HINT

    def generate_response(
        self,
        user_message: str,
        context: AssembledContext,
        conversation_history: list[dict] | None = None,
    ) -> dict:
        rag_prompt = self._build_prompt(user_message, context)

        messages: list[dict] = [
            {"role": "system", "content": self._system_instruction}
        ]
        if conversation_history:
            for turn in conversation_history[-6:]:
                role = "assistant" if turn.get("role") == "model" else "user"
                messages.append({"role": role, "content": turn["content"]})
        messages.append({"role": "user", "content": rag_prompt})

        response = self._client.chat.completions.create(
            model=self._model_name,
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
            top_p=0.8,
            max_tokens=800,
        )
        text = (response.choices[0].message.content or "").strip()

        try:
            return json.loads(text)
        except json.JSONDecodeError:
            match = re.search(r'"mensaje"\s*:\s*"((?:[^"\\]|\\.)*)"', text)
            if match:
                return {**_FALLBACK_RESPONSE, "mensaje": match.group(1)}
            return dict(_FALLBACK_RESPONSE)

    def _build_prompt(
        self,
        user_message: str,
        context: AssembledContext,
    ) -> str:
        sop_list = ", ".join(sorted(context.sop_codes_used)) or "N/A"
        return "\n".join([
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
        ])

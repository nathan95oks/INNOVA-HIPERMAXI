"""
query_rewriter.py — Reformula la consulta del usuario en variantes
orientadas al vocabulario de los SOPs antes de hacer el retrieval.

Problema que resuelve:
  El proveedor pregunta "no me llega el usuario para entrar al sistema"
  pero el SOP dice "reenvío de credenciales de acceso al portal".
  La distancia semántica es alta → retrieval falla.

Solución:
  Usar un modelo Gemini ligero (flash-lite) para generar 2-3 variantes
  de la consulta con vocabulario técnico de los SOPs.
  Luego se busca con TODAS las variantes y se fusionan los resultados.

Latencia añadida: ~300-600ms (modelo ligero, prompt corto).
"""
from __future__ import annotations

import json
import logging
import re

from google import genai
from google.genai import types

logger = logging.getLogger(__name__)

# Contexto de SOPs conocidos para guiar el rewriting
_SOP_CONTEXT = """
SOPs disponibles en la base de conocimiento:
- SOP-SR-01: Credenciales de acceso al portal (usuario, contraseña, primer ingreso, proveedor nuevo)
- SOP-SR-02: Activación de código proveedor / código catálogo
- SOP-SR-03: Reenvío de credenciales de acceso (recuperar credenciales, olvidé contraseña)
- SOP-04: Cargar producto al portal web (registrar producto, subir producto, guardar producto)
- SOP-05: Cargar factura / asistencia con facturas (botón factura no aparece, error al facturar, OC)
- SOP-06: AVD - Aviso de Despacho (confirmar despacho, aviso de despacho, entrega)
""".strip()

_REWRITE_PROMPT = """Eres un asistente que busca en procedimientos operativos (SOPs) del Portal de Proveedores de Hipermaxi.

{sop_context}

Dado el mensaje de un proveedor, genera exactamente 3 consultas de búsqueda con vocabulario técnico del SOP más relevante.
Las consultas deben variar en formulación pero apuntar al mismo tema.
Responde SOLO con JSON válido: {{"queries": ["query1", "query2", "query3"]}}

Mensaje del proveedor: {user_message}"""


class QueryRewriter:
    """
    Reformula consultas de usuario en variantes con vocabulario de SOPs.
    Usa gemini-2.0-flash-lite para minimizar latencia.
    """

    def __init__(self, api_key: str):
        self._client = genai.Client(api_key=api_key)
        self._model = "gemini-2.5-flash"

    def rewrite(self, user_message: str) -> list[str]:
        """
        Genera variantes de la consulta optimizadas para el retrieval.

        Returns:
            Lista con la consulta original + 2-3 variantes reformuladas.
            En caso de error, retorna solo la consulta original (safe fallback).
        """
        try:
            prompt = _REWRITE_PROMPT.format(
                sop_context=_SOP_CONTEXT,
                user_message=user_message,
            )
            response = self._client.models.generate_content(
                model=self._model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.3,
                    max_output_tokens=512,
                    thinking_config=types.ThinkingConfig(thinking_budget=0),
                ),
            )
            raw = (response.text or "").strip()
            # Extraer el array JSON con regex (tolerante a markdown y texto extra)
            m = re.search(r'\[([^\]]+)\]', raw, re.DOTALL)
            if not m:
                return [user_message]
            variants = json.loads("[" + m.group(1) + "]")

            # Siempre incluir la consulta original primero
            all_queries: list[str] = [user_message]
            for q in variants:
                if isinstance(q, str) and q.strip() and q.strip() != user_message:
                    all_queries.append(q.strip())

            logger.debug("Query rewriting: %s → %s", user_message, all_queries[1:])
            return all_queries[:4]  # Máx 4 consultas para no exceder cuota

        except Exception as exc:
            logger.warning("Query rewriting falló, usando consulta original: %s", exc)
            return [user_message]

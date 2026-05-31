FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para python-docx y Pillow
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar e instalar dependencias Python primero (aprovecha cache de Docker)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código fuente
COPY app/ ./app/
COPY scripts/ ./scripts/

# Crear directorios para datos persistentes
RUN mkdir -p knowledge/raw knowledge/images knowledge/vector_store

# Variables de entorno con defaults seguros
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    VECTOR_STORE_DIR=knowledge/vector_store \
    RAG_SCORE_THRESHOLD=0.65 \
    RAG_TOP_K=5 \
    DEV_MODE=false \
    CORS_ORIGINS=*

# El vector store y las imágenes se montan como volúmenes externos
VOLUME ["/app/knowledge/vector_store", "/app/knowledge/images"]

EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

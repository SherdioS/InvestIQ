FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY src/services/ingestion/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY src/services/ingestion/ ./ingestion/
COPY src/packages/database/ ./packages/database/
COPY src/packages/llm/ ./packages/llm/
COPY src/packages/rag/ ./packages/rag/
COPY src/packages/vectorstore/ ./packages/vectorstore/

RUN pip install --no-cache-dir \
    ./packages/database \
    ./packages/llm \
    ./packages/vectorstore \
    ./packages/rag

EXPOSE 8000

CMD ["uvicorn", "ingestion.app:app", "--host", "0.0.0.0", "--port", "8000"]

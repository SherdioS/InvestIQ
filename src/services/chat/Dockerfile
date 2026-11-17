FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY src/services/chat/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

COPY src/packages/llm/ ./packages/llm/
COPY src/packages/vectorstore/ ./packages/vectorstore/
COPY src/services/chat/ ./chat/

RUN pip install --no-cache-dir \
    ./packages/llm \
    ./packages/vectorstore

EXPOSE 8000

CMD ["uvicorn", "chat.app:app", "--host", "0.0.0.0", "--port", "8000"]

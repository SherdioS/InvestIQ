from fastapi import FastAPI
from uvicorn import run
# from dotenv import load_dotenv

from .ingestion_router import router as ingestion_router

# load_dotenv()

app = FastAPI(title="InvestIQ Ingestion API", version="1.0.0")

app.include_router(ingestion_router, prefix="/api", tags=["Ingestion"])

if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8000)

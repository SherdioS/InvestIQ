from fastapi import FastAPI
from uvicorn import run
# from dotenv import load_dotenv

from .chat import router as chat_router

# load_dotenv()

app = FastAPI(title="InvestIQ Chat API", version="1.0.0")

app.include_router(chat_router, prefix="/api", tags=["Chat"])

if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8000)

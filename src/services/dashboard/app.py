from fastapi import FastAPI
from uvicorn import run
# from dotenv import load_dotenv

from .dashboard import router as dashboard_router

# load_dotenv()

app = FastAPI(title="InvestIQ Dashboard API", version="1.0.0")

app.include_router(dashboard_router, prefix="/api", tags=["Dashboard"])

if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8000)

import shutil
from fastapi import APIRouter, File, UploadFile
from fastapi.responses import JSONResponse
from pathlib import Path
import os
from dotenv import load_dotenv
from langchain_openai import AzureOpenAIEmbeddings

from .ingest_documents import ingest_document
from database.metrics import get_metrics
from database.postgres_sql import create_database
from database.create_table import create_tables
from vectorstore.create_index import create_index
from vectorstore.azure_ai_search import AzureAISearchVectorStore

load_dotenv()
router = APIRouter()


@router.get("/health")
def health_check():
    return {"status": "Ingestion API healthy"}


@router.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    upload_dir = Path("data/raw_pdfs")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / file.filename

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

        # Initialize embeddings and vector store
        embeddings = AzureOpenAIEmbeddings(
            model=os.getenv("AZURE_OPENAI_EMBEDDING_DEPLOYMENT"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY"),
            api_version=os.getenv("AZURE_OPENAI_API_VERSION"),
        )

        vector_store = AzureAISearchVectorStore(
            endpoint=os.getenv("AZURE_SEARCH_ENDPOINT"),
            api_key=os.getenv("AZURE_SEARCH_API_KEY"),
            index_name=os.getenv("AZURE_SEARCH_INDEX_NAME"),
        )

        ingest_document(
            pdf_path=str(file_path), embeddings=embeddings, vector_store=vector_store
        )

    return {"message": "Document uploaded successfully", "file_name": file.filename}


@router.get("/metrics")
def metrics():
    """
    Return KPI metrics.
    """
    return JSONResponse(content=get_metrics())


@router.get("/startup")
def startup_event():
    """
    Initialize database and vector index on app startup.
    """
    try:
        create_database()
        create_tables()
        create_index(
            endpoint=os.getenv("AZURE_SEARCH_ENDPOINT"),
            api_key=os.getenv("AZURE_SEARCH_API_KEY"),
            index_name=os.getenv("AZURE_SEARCH_INDEX_NAME"),
        )
        return {"status": "database and vector index initialized"}
    except Exception as e:
        print(f"Warning: Could not create vector index: {e}")
        return {"status": "database and vector index could not be initialized"}

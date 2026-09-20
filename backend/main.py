from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from backend.api.endpoints import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("memory_simulator")

app = FastAPI(
    title="Memory Management Simulator API",
    description="Backend API for college OS project: Paging vs Segmentation Simulator and Comparison Engine",
    version="1.0.0"
)

# Enable CORS for local React/Vite development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for easy local student demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount simulation API router
app.include_router(api_router)

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global error on {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=400,
        content={
            "status": "error",
            "message": str(exc),
            "data": {}
        }
    )

@app.get("/")
def root():
    return {
        "project": "Memory Management Simulator: Paging vs Segmentation",
        "description": "Operating Systems Course Project - Address Translation & Performance Comparison",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)

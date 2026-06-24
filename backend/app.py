import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from routes import concierge, memory, beauty_profile, recommendations
from services.concierge_service import ConciergeService
from services.recommendation_service import RecommendationService
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("aura_backend")

app = FastAPI(
    title="Aura AI Future Backend",
    description="Scalable, AI-first Python FastAPI service orchestrating intent detection, memory context, and premium recommendations.",
    version="1.0.0"
)

# CORS Middleware Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(concierge.router)
app.include_router(memory.router)
app.include_router(beauty_profile.router)
app.include_router(recommendations.router)

# --- ADDITIONAL COMPATIBILITY ENDPOINTS ---

class JourneyRequest(BaseModel):
    userGoal: str
    userProfile: Optional[Dict[str, Any]] = None
    userMemory: Optional[Dict[str, Any]] = None

@app.post("/api/journey/generate", tags=["Journey"])
async def generate_journey(request: JourneyRequest):
    if not request.userGoal:
        raise HTTPException(status_code=400, detail="User goal is required.")
    
    try:
        user_name = request.userProfile.get("name", "Guest") if request.userProfile else "Guest"
        
        # Build memory context if available
        memory_context = ""
        if request.userMemory:
            from services.memory_service import MemoryService
            from models.user import UserMemory
            try:
                # Attempt to parse into UserMemory if dictionary is supplied
                mem_obj = UserMemory(**request.userMemory)
                memory_context = MemoryService.build_user_memory_context(mem_obj)
            except Exception:
                pass
                
        journey = await ConciergeService.generate_journey_plan(
            user_goal=request.userGoal,
            user_name=user_name,
            memory_context=memory_context
        )
        
        # Initialize step statuses to 'Pending'
        if journey and "steps" in journey and isinstance(journey["steps"], list):
            for idx, step in enumerate(journey["steps"]):
                step["stepNumber"] = step.get("stepNumber", idx + 1)
                step["title"] = step.get("title", f"Step {idx + 1}")
                step["description"] = step.get("description", "")
                step["timeline"] = step.get("timeline", f"Phase {idx + 1}")
                step["recommendedService"] = step.get("recommendedService", "Advanced Hydra Facial")
                step["status"] = "Pending"
        
        return journey
    except Exception as e:
        logger.error(f"Error generating journey plan: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to generate journey plan: {str(e)}")


class CompareRequest(BaseModel):
    query: str
    salons: List[Dict[str, Any]]
    memoryContext: Optional[str] = None

@app.post("/api/compare", tags=["Comparison"])
async def compare_salons_endpoint(request: CompareRequest):
    if not request.query:
        raise HTTPException(status_code=400, detail="Query is required.")
    if not request.salons:
        raise HTTPException(status_code=400, detail="Salons list is required for comparison.")
        
    try:
        comparison = await ConciergeService.compare_salons(
            query=request.query,
            target_salons=request.salons,
            memory_context=request.memoryContext
        )
        return comparison
    except Exception as e:
        logger.error(f"Error in salon comparison endpoint: {e}")
        raise HTTPException(status_code=500, detail=f"Comparison failed: {str(e)}")


@app.get("/", tags=["Health Check"])
async def root():
    return {
        "status": "online",
        "service": "Aura AI Future Python Backend",
        "engine": "FastAPI"
    }

from fastapi import APIRouter, HTTPException, Depends
import logging
from models.user import UserMemory
from models.profile import BeautyProfile
from models.recommendation import RecommendationResult
from services.concierge_service import ConciergeService
from services.recommendation_service import RecommendationService
from services.memory_service import MemoryService
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime
from ai.orchestrator.orchestrator import AIOrchestrator
from security.firebase_auth import get_current_user, VerifiedUser

router = APIRouter(prefix="/api/concierge", tags=["Concierge"])
logger = logging.getLogger("concierge_route")

class ChatRequest(BaseModel):
    message: str
    userProfile: Optional[Dict[str, Any]] = None
    bookings: Optional[List[Dict[str, Any]]] = None
    userMemory: Optional[UserMemory] = None
    beautyProfile: Optional[BeautyProfile] = None
    chatHistory: Optional[List[Dict[str, Any]]] = None

class ChatResponse(BaseModel):
    intent: str
    recommendations: List[RecommendationResult]
    comparison: Optional[Dict[str, Any]] = None
    response: str
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
async def chat_handler(
    request: ChatRequest,
    verified_user: Optional[VerifiedUser] = Depends(get_current_user)
):
    if not request.message or not isinstance(request.message, str):
        raise HTTPException(status_code=400, detail="User message query is required.")

    # Establish identity context
    if verified_user:
        user_id = verified_user.uid
    else:
        user_id = request.userMemory.userId if request.userMemory else "guest_user"
        if user_id != "guest_user" and not user_id.startswith("anonymous_"):
            user_id = f"anonymous_{user_id}"

    try:
        user_mem_data = request.userMemory.model_dump() if request.userMemory else None
        bp_data = request.beautyProfile.model_dump() if request.beautyProfile else None

        # Run agentic orchestrator workflow
        state = await AIOrchestrator.run(
            message=request.message,
            user_id=user_id,
            session_id="default_session",
            user_profile=request.userProfile,
            bookings=request.bookings,
            user_memory=user_mem_data,
            beauty_profile=bp_data,
            chat_history=request.chatHistory
        )

        timestamp = datetime.now().strftime("%I:%M %p").lstrip("0")
        response_text = state.final_response or ""
        
        # Append beauty plan visual guide if available
        if state.journey_plan:
            steps_text = "\n\n**Your Custom Beauty Timeline:**\n"
            for step in state.journey_plan.get("steps", []):
                steps_text += f"\n* **{step.get('timeline')}**: {step.get('title')} ({step.get('recommendedService')}) - *{step.get('description')}*"
            
            disclaimer = state.journey_plan.get('medicalDisclaimer')
            if disclaimer:
                steps_text += f"\n\n*Note: {disclaimer}*"
                
            response_text += steps_text

        return ChatResponse(
            intent=state.intent or "general_query",
            recommendations=state.recommendations,
            comparison=state.comparison,
            response=response_text,
            timestamp=timestamp
        )
    except Exception as e:
        import traceback
        logger.error(f"Error in chat_handler: {e}\n{traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

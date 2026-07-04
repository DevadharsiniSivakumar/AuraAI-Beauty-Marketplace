import logging
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from ai.orchestrator.orchestrator import AIOrchestrator
from models.recommendation import RecommendationResult
from security.firebase_auth import get_current_user, VerifiedUser
from utils.firebase import should_use_mock, get_firestore_client

router = APIRouter(prefix="/api/ai", tags=["Agentic AI"])
logger = logging.getLogger("ai_router")

class AgentRequest(BaseModel):
    message: str
    sessionId: str = "default_session"
    userId: str = "guest_user"
    userProfile: Optional[Dict[str, Any]] = None
    bookings: Optional[List[Dict[str, Any]]] = None
    userMemory: Optional[Dict[str, Any]] = None
    beautyProfile: Optional[Dict[str, Any]] = None

class AgentResponse(BaseModel):
    requestId: str
    intent: str
    agentsUsed: List[str]
    response: str
    recommendations: List[RecommendationResult]
    comparison: Optional[Dict[str, Any]] = None
    journeyPlan: Optional[Dict[str, Any]] = None
    bookingDraft: Optional[Dict[str, Any]] = None
    errors: List[str]
    metadata: Dict[str, Any]

@router.post("/agent", response_model=AgentResponse)
async def agent_endpoint(
    request: AgentRequest,
    verified_user: Optional[VerifiedUser] = Depends(get_current_user)
):
    if not request.message or not isinstance(request.message, str):
        raise HTTPException(status_code=400, detail="User message query is required.")

    # 1. Establish secure user identity context
    if verified_user:
        # Cryptographically verified Firebase UID overrides any client request body userId
        user_id = verified_user.uid
        is_authenticated = True
        identity_source = "verified_firebase_token"
    else:
        # Unauthenticated users are assigned a session-isolated ephemeral ID
        user_id = f"anonymous_{request.sessionId}"
        is_authenticated = False
        identity_source = "anonymous_session"

    try:
        # Run agentic orchestrator workflow
        state = await AIOrchestrator.run(
            message=request.message,
            user_id=user_id,
            session_id=request.sessionId,
            user_profile=request.userProfile,
            bookings=request.bookings,
            user_memory=request.userMemory,
            beauty_profile=request.beautyProfile
        )

        # 2. Compile execution trace metadata safely
        try:
            db_client = get_firestore_client()
            db_available = db_client is not None
            mock_active = should_use_mock()
        except Exception:
            db_available = False
            mock_active = True

        memory_source = (
            "firestore" if (db_available and not mock_active and is_authenticated)
            else ("ephemeral" if not is_authenticated else "unavailable")
        )
        salon_source = "mock_fallback" if mock_active else "firestore"
        review_source = "mock_fallback" if mock_active else "firestore"

        state.metadata["authenticated"] = is_authenticated
        state.metadata["identitySource"] = identity_source
        state.metadata["memorySource"] = memory_source
        state.metadata["salonDataSource"] = salon_source
        state.metadata["reviewDataSource"] = review_source

        return AgentResponse(
            requestId=state.request_id,
            intent=state.intent or "general_query",
            agentsUsed=state.selected_agents,
            response=state.final_response or "",
            recommendations=state.recommendations,
            comparison=state.comparison,
            journeyPlan=state.journey_plan,
            bookingDraft=state.booking_draft,
            errors=state.errors,
            metadata=state.metadata
        )
    except Exception as e:
        logger.error(f"Error executing agentic orchestrator: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to execute agent workflow: {str(e)}")

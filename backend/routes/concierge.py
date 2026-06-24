from fastapi import APIRouter, HTTPException
from models.user import UserMemory
from models.profile import BeautyProfile
from models.recommendation import RecommendationResult
from services.concierge_service import ConciergeService
from services.recommendation_service import RecommendationService
from services.memory_service import MemoryService
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

router = APIRouter(prefix="/api/concierge", tags=["Concierge"])

class ChatRequest(BaseModel):
    message: str
    userProfile: Optional[Dict[str, Any]] = None
    bookings: Optional[List[Dict[str, Any]]] = None
    userMemory: Optional[UserMemory] = None
    beautyProfile: Optional[BeautyProfile] = None

class ChatResponse(BaseModel):
    intent: str
    recommendations: List[RecommendationResult]
    comparison: Optional[Dict[str, Any]] = None
    response: str
    timestamp: str

@router.post("/chat", response_model=ChatResponse)
async def chat_handler(request: ChatRequest):
    if not request.message or not isinstance(request.message, str):
        raise HTTPException(status_code=400, detail="User message query is required.")

    try:
        client_profile = request.userProfile or {"name": "Guest"}
        client_bookings = request.bookings or []

        # 1. Construct memory context
        memory_context = ""
        if request.userMemory:
            memory_context = MemoryService.build_user_memory_context(request.userMemory)
        
        if request.beautyProfile:
            bp = request.beautyProfile
            recs_hair = ", ".join(bp.recommendedHairstyles) if bp.recommendedHairstyles else ""
            recs_treat = ", ".join(bp.recommendedTreatments) if bp.recommendedTreatments else ""
            recs_makeup = ", ".join(bp.recommendedMakeupStyles) if bp.recommendedMakeupStyles else ""
            
            memory_context += (
                f"\n\nClient Beauty Profile (Selfie Analysis):\n"
                f"* Face Shape: {bp.faceShape}\n"
                f"* Hair Type: {bp.hairType}\n"
                f"* Hair Density: {bp.hairDensity or 'High'}\n"
                f"* Skin Tone: {bp.skinTone}\n"
                f"* Skin Undertone: {bp.undertone or 'Warm'}\n"
                f"* Hair Length: {bp.hairLength or 'Medium'}\n"
                f"* Beauty Summary: {bp.beautySummary or ''}\n"
                f"* Recommended Hairstyles: {recs_hair}\n"
                f"* Recommended Treatments: {recs_treat}\n"
                f"* Recommended Makeup Look: {recs_makeup}"
            )
        elif client_profile.get("faceShape") or client_profile.get("hairType") or client_profile.get("skinTone"):
            memory_context += (
                f"\n\nClient Beauty Profile:\n"
                f"* Face Shape: {client_profile.get('faceShape', 'Not analyzed')}\n"
                f"* Hair Type: {client_profile.get('hairType', 'Not analyzed')}\n"
                f"* Skin Tone: {client_profile.get('skinTone', 'Not analyzed')}"
            )

        # 2. Intent Detection
        parsed_query = ConciergeService.detect_intent(request.message)
        intent = parsed_query.get("intent", "general_query")

        # 3. Search & Rank recommendations (Only if explicit recommendation query is requested)
        lower_query = request.message.lower()
        explicit_triggers = ["salon", "outlet", "place", "where", "book", "find", "near", 
                             "rate", "cost", "price", "fee", "comparison", "versus", "compare", " vs "]
        is_explicit = any(trigger in lower_query for trigger in explicit_triggers)
        
        is_rec_requested = (
            intent in ["service_search", "salon_search", "salon_comparison", "booking_help"]
            and is_explicit
        )

        recommendations = []
        if is_rec_requested:
            recommendations = await RecommendationService.search_and_rank(
                parsed_query=parsed_query,
                user_profile=client_profile,
                user_bookings=client_bookings
            )

        # 4. Check if comparison is requested
        is_comparison = (
            intent == "salon_comparison"
            or any(x in lower_query for x in ["compare", "versus", " vs "])
        )

        comparison = None
        if is_comparison:
            all_salons = await RecommendationService.get_salons_and_services()
            target_salons = all_salons

            queried_ids = parsed_query.get("queriedSalons", [])
            if len(queried_ids) > 0:
                target_salons = [s for s in all_salons if s.get("id") in queried_ids]
            elif recommendations:
                rec_ids = [r.salonId or r.id for r in recommendations]
                target_salons = [s for s in all_salons if s.get("id") in rec_ids]

            if len(target_salons) < 2:
                target_salons = all_salons[:2]

            comparison = await ConciergeService.compare_salons(
                query=request.message,
                target_salons=target_salons,
                memory_context=memory_context
            )

        # 5. Generate narrative response
        narrative = await ConciergeService.explain_recommendations(
            user_name=client_profile.get("name", "Guest"),
            user_query=request.message,
            intent=intent,
            recommendations=recommendations,
            memory_context=memory_context
        )

        # 6. Format time
        timestamp = datetime.now().strftime("%I:%M %p").lstrip("0")

        return ChatResponse(
            intent=intent,
            recommendations=recommendations,
            comparison=comparison,
            response=narrative,
            timestamp=timestamp
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process chat: {str(e)}")

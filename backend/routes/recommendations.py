from fastapi import APIRouter, HTTPException
from typing import List
from models.recommendation import RecommendationResult, RecommendationRequest
from services.recommendation_service import RecommendationService
from services.concierge_service import ConciergeService

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.post("/generate", response_model=List[RecommendationResult])
async def generate_recommendations(request: RecommendationRequest):
    try:
        # Detect intent to structure parameters
        parsed_query = ConciergeService.detect_intent(request.userQuery)
        
        # Search and rank matching options
        recommendations = await RecommendationService.search_and_rank(
            parsed_query=parsed_query,
            user_profile=request.userProfile,
            user_bookings=request.userBookings
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

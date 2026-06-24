from fastapi import APIRouter, HTTPException
from models.profile import BeautyProfile, SelfieAnalysisRequest
from services.beauty_profile_service import BeautyProfileService

router = APIRouter(prefix="/api/beauty", tags=["Beauty Profile"])

@router.post("/analyze", response_model=BeautyProfile)
async def analyze_selfie(request: SelfieAnalysisRequest):
    if not request.image:
        raise HTTPException(status_code=400, detail="Image data is required.")
    
    try:
        profile = await BeautyProfileService.analyze_selfie(request.image)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Selfie analysis failed: {str(e)}")

@router.get("/profile/{userId}", response_model=BeautyProfile)
async def get_profile(userId: str):
    # Returns a default premium profile (e.g. simulated fallback) for the user.
    # In production, this would retrieve the saved analysis from a database.
    try:
        # Simply return the first curated profile
        profile = BeautyProfileService.get_fallback_profile(0)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve profile: {str(e)}")

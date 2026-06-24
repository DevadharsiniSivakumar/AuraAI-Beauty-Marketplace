from pydantic import BaseModel
from typing import List, Optional

class SelfieAnalysisRequest(BaseModel):
    image: str  # Base64 encoded image data

class BeautyProfile(BaseModel):
    faceShape: str
    hairType: str
    hairDensity: str
    skinTone: str
    undertone: str
    hairLength: Optional[str] = "Medium"
    beautySummary: str
    recommendedHairstyles: List[str]
    recommendedTreatments: List[str]
    recommendedMakeupStyles: List[str]
    error: Optional[str] = None

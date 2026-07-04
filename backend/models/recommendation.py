from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RecommendationResult(BaseModel):
    type: str  # 'salon' or 'service'
    id: str
    name: str
    price: Optional[float] = None
    salonId: Optional[str] = None
    details: str
    matchScore: int
    reasons: List[str]
    tradeoffs: Optional[List[str]] = Field(default_factory=list)
    memoryIndicator: Optional[str] = None
    dataSource: Optional[str] = "firestore"

class RecommendationRequest(BaseModel):
    userQuery: str
    userProfile: Dict[str, Any]
    userBookings: List[Dict[str, Any]] = Field(default_factory=list)

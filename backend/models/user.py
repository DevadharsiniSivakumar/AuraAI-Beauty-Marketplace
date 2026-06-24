from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class BookingHistoryItem(BaseModel):
    bookingId: str
    serviceName: str
    salonName: str
    date: str
    price: float
    status: str

class ReviewHistoryItem(BaseModel):
    reviewId: str
    serviceName: str
    salonName: str
    rating: int
    comment: str

class CategoryScore(BaseModel):
    category: str
    score: int

class UserMemory(BaseModel):
    userId: str
    preferredServices: List[str] = Field(default_factory=list)
    preferredLocations: List[str] = Field(default_factory=list)
    preferredCategories: List[CategoryScore] = Field(default_factory=list)
    averageBudget: float = 0.0
    favoriteSalons: List[str] = Field(default_factory=list)
    likedServices: List[str] = Field(default_factory=list)
    dislikedServices: List[str] = Field(default_factory=list)
    bookingHistory: List[BookingHistoryItem] = Field(default_factory=list)
    reviewHistory: List[ReviewHistoryItem] = Field(default_factory=list)
    lastUpdated: str

class MemoryUpdateRequest(BaseModel):
    userId: str
    bookings: List[Dict[str, Any]]
    reviews: List[Dict[str, Any]]
    salons: List[Dict[str, Any]]

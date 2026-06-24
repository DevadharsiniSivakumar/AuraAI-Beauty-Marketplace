from fastapi import APIRouter, HTTPException
from models.user import UserMemory, MemoryUpdateRequest
from services.memory_service import MemoryService
from utils.mock_data import MOCK_USER, MOCK_SALONS
from datetime import datetime

router = APIRouter(prefix="/api/memory", tags=["Memory"])

@router.post("/update", response_model=UserMemory)
async def update_memory(request: MemoryUpdateRequest):
    try:
        memory = MemoryService.recalculate_user_memory(
            bookings=request.bookings,
            reviews=request.reviews,
            salons=request.salons,
            user_id=request.userId
        )
        return memory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update user memory: {str(e)}")

@router.get("/{userId}", response_model=UserMemory)
async def get_memory(userId: str):
    # Simulated fetch or calculation. In production, this reads from database.
    # For now, if matching MOCK_USER name, we simulate it based on default bookings.
    try:
        # Generate some mock bookings and reviews to calculate memory for Rhe Sen
        mock_bookings = [
            {"id": "b-1", "salonId": "bodycraft-indiranagar", "salonName": "Bodycraft Salon & Spa", "serviceName": "Advanced Hydra Facial", "price": 4500, "date": "2026-05-28", "status": "Completed"},
            {"id": "b-2", "salonId": "mirror-within-lavelle", "salonName": "Mirror & Within", "serviceName": "Kérastase Fusio-Dose Ritual", "price": 4200, "date": "2026-06-06", "status": "Completed"}
        ]
        mock_reviews = [
            {"id": "r-1", "salonId": "bodycraft-indiranagar", "rating": 5, "comment": "Amazing Hydra facial!", "salonName": "Bodycraft Salon & Spa"},
            {"id": "r-2", "salonId": "mirror-within-lavelle", "rating": 5, "comment": "Love the luxury hair care ritual.", "salonName": "Mirror & Within"}
        ]
        
        memory = MemoryService.recalculate_user_memory(
            bookings=mock_bookings,
            reviews=mock_reviews,
            salons=MOCK_SALONS,
            user_id=userId
        )
        return memory
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user memory: {str(e)}")

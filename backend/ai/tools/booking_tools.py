import os
import logging
from typing import List, Dict, Any, Optional
from ai.tools.tool_registry import tool_registry
from ai.tools.salon_tools import get_salon_by_id
from utils.firebase import get_firestore_client, should_use_mock

logger = logging.getLogger("aura_backend")

@tool_registry.register(
    name="get_user_booking_history",
    description="Retrieve all previous booking records for a given user ID."
)
async def get_user_booking_history(user_id: str) -> List[Dict[str, Any]]:
    if should_use_mock():
        logger.info("get_user_booking_history: using mock fallback.")
        return [
            {"id": "b-1", "salonId": "bodycraft-indiranagar", "salonName": "Bodycraft Salon & Spa", "serviceName": "Advanced Hydra Facial", "price": 4500, "date": "2026-05-28", "status": "Completed"},
            {"id": "b-2", "salonId": "mirror-within-lavelle", "salonName": "Mirror & Within", "serviceName": "Kérastase Fusio-Dose Ritual", "price": 4200, "date": "2026-06-06", "status": "Completed"}
        ]

    db = get_firestore_client()
    try:
        bookings_ref = db.collection("bookings")
        docs = bookings_ref.where("userId", "==", user_id).get()
        bookings = []
        for doc in docs:
            bdata = doc.to_dict()
            bdata["id"] = doc.id
            bookings.append(bdata)

        # Fallback to userEmail match for compatibility
        if not bookings:
            docs_email = bookings_ref.where("userEmail", "==", user_id).get()
            for doc in docs_email:
                bdata = doc.to_dict()
                bdata["id"] = doc.id
                # Deduplicate just in case
                if not any(b["id"] == bdata["id"] for b in bookings):
                    bookings.append(bdata)

        return bookings
    except Exception as e:
        logger.error(f"Error querying bookings collection in Firestore: {e}")
        if os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "true":
            return [
                {"id": "b-1", "salonId": "bodycraft-indiranagar", "salonName": "Bodycraft Salon & Spa", "serviceName": "Advanced Hydra Facial", "price": 4500, "date": "2026-05-28", "status": "Completed"},
                {"id": "b-2", "salonId": "mirror-within-lavelle", "salonName": "Mirror & Within", "serviceName": "Kérastase Fusio-Dose Ritual", "price": 4200, "date": "2026-06-06", "status": "Completed"}
            ]
        raise

@tool_registry.register(
    name="create_booking_draft",
    description="Prepare a validated booking draft. DOES NOT execute booking, requires confirmation."
)
async def create_booking_draft(user_id: str, salon_id: str, service_id: str, date: str, time: str) -> Dict[str, Any]:
    salon = await get_salon_by_id(salon_id)
    if not salon:
        raise ValueError(f"Salon with ID '{salon_id}' not found.")
    
    service = next((s for s in salon.get("services", []) if s.get("id") == service_id or s.get("name") == service_id), None)
    if not service:
        service = next((s for s in salon.get("services", []) if s.get("name").lower() == service_id.lower()), None)
        
    if not service:
        raise ValueError(f"Service '{service_id}' not found in salon '{salon.get('name')}' services.")
    
    return {
        "userId": user_id,
        "salonId": salon_id,
        "salonName": salon.get("name"),
        "serviceId": service.get("id"),
        "serviceName": service.get("name"),
        "price": service.get("price"),
        "date": date,
        "time": time,
        "status": "Draft",
        "requiresConfirmation": True
    }

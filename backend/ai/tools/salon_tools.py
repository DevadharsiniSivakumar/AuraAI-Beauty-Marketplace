import os
import logging
from typing import List, Dict, Any, Optional
from ai.tools.tool_registry import tool_registry
from services.recommendation_service import RecommendationService
from utils.firebase import get_firestore_client, should_use_mock

logger = logging.getLogger("aura_backend")

@tool_registry.register(
    name="search_salons",
    description="Search and rank salons/services based on matching score calculation."
)
async def search_salons(parsed_query: Dict[str, Any], user_profile: Dict[str, Any], user_bookings: Optional[List[Dict[str, Any]]] = None) -> List[Any]:
    return await RecommendationService.search_and_rank(
        parsed_query=parsed_query,
        user_profile=user_profile,
        user_bookings=user_bookings or []
    )

@tool_registry.register(
    name="get_salon_by_id",
    description="Retrieve full details for a specific salon by its ID."
)
async def get_salon_by_id(salon_id: str) -> Optional[Dict[str, Any]]:
    if should_use_mock():
        salons = await RecommendationService.get_salons_and_services()
        return next((s for s in salons if s.get("id") == salon_id), None)

    db = get_firestore_client()
    try:
        doc_ref = db.collection("salons").document(salon_id)
        doc = doc_ref.get()
        if doc.exists:
            sdata = doc.to_dict()
            sdata["id"] = doc.id
            sdata["services"] = []

            # Retrieve services for this specific salon
            services_ref = db.collection("services").where("salonId", "==", salon_id)
            services_docs = services_ref.get()
            for s_doc in services_docs:
                serv_data = s_doc.to_dict()
                serv_data["id"] = s_doc.id
                sdata["services"].append(serv_data)

            return sdata
        return None
    except Exception as e:
        logger.error(f"Error querying salon document {salon_id} in Firestore: {e}")
        if os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "true":
            salons = await RecommendationService.get_salons_and_services()
            return next((s for s in salons if s.get("id") == salon_id), None)
        raise

@tool_registry.register(
    name="get_salon_services",
    description="List all treatments and services offered by a specific salon."
)
async def get_salon_services(salon_id: str) -> List[Dict[str, Any]]:
    salon = await get_salon_by_id(salon_id)
    if salon:
        return salon.get("services", [])
    return []

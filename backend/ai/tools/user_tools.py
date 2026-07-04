import os
import logging
from typing import Dict, Any, Optional
from ai.tools.tool_registry import tool_registry
from utils.mock_data import MOCK_USER
from utils.firebase import get_firestore_client, should_use_mock

logger = logging.getLogger("aura_backend")

@tool_registry.register(
    name="get_user_profile",
    description="Retrieve the physical and preference profile of a user."
)
async def get_user_profile(user_id: str) -> Dict[str, Any]:
    # Check if we should fall back to mock data
    if should_use_mock():
        logger.info("get_user_profile: using mock fallback.")
        return MOCK_USER

    db = get_firestore_client()
    try:
        doc_ref = db.collection("users").document(user_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            # Map Firestore fields to expected profile structure, falling back to mock defaults
            profile = {
                "name": data.get("name") or MOCK_USER.get("name", "Aura User"),
                "email": data.get("email") or MOCK_USER.get("email", ""),
                "phone": data.get("phone") or MOCK_USER.get("phone", ""),
                "location": data.get("location") or MOCK_USER.get("location", "Indiranagar"),
                "faceShape": data.get("faceShape") or MOCK_USER.get("faceShape", "Oval"),
                "hairType": data.get("hairType") or MOCK_USER.get("hairType", "Wavy"),
                "skinTone": data.get("skinTone") or MOCK_USER.get("skinTone", "Warm Honey"),
                "preferredBudget": data.get("preferredBudget") or MOCK_USER.get("preferredBudget", "₹₹ - ₹₹₹"),
                "favoriteSalons": data.get("favoriteSalons") or MOCK_USER.get("favoriteSalons", [])
            }
            return profile
        else:
            logger.warning(f"User profile document users/{user_id} not found. Returning defaults.")
            # Grounded fallbacks: return defaults based on mock data to not break execution
            return MOCK_USER
    except Exception as e:
        logger.error(f"Error querying users collection in Firestore: {e}")
        if os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "true":
            return MOCK_USER
        raise

@tool_registry.register(
    name="save_user_preference",
    description="Save explicit user styling and category preference updates."
)
async def save_user_preference(user_id: str, key: str, value: Any) -> Dict[str, Any]:
    if should_use_mock():
        logger.info("save_user_preference: using mock fallback.")
        MOCK_USER[key] = value
        return MOCK_USER

    db = get_firestore_client()
    try:
        doc_ref = db.collection("users").document(user_id)
        doc_ref.set({key: value}, merge=True)
        return await get_user_profile(user_id)
    except Exception as e:
        logger.error(f"Error updating user preferences in Firestore: {e}")
        if os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "true":
            MOCK_USER[key] = value
            return MOCK_USER
        raise

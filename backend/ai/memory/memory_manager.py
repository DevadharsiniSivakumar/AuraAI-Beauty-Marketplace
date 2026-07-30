import os
import logging
from datetime import datetime
from typing import Dict, Any, Optional, List
from services.memory_service import MemoryService
from models.user import UserMemory
from utils.mock_data import MOCK_SALONS
from utils.firebase import get_firestore_client, should_use_mock

logger = logging.getLogger("memory_manager")

class MemoryManager:
    @staticmethod
    async def load_user_memory(user_id: str, client_memory_data: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Loads the combined explicit preference, beauty context, interaction context,
        and booking context of a user, resolving from Firestore for authenticated sessions.
        """
        user_mem_obj = None
        loaded_from_firestore = False
        db_bookings = []
        db_journeys = []
        db_beauty_profile = None

        # Load from Firestore if authenticated user and Firestore is active
        if not should_use_mock() and user_id and not user_id.startswith("anonymous_"):
            db = get_firestore_client()
            try:
                doc_ref = db.collection("users").document(user_id)
                doc = doc_ref.get()
                if doc.exists:
                    data = doc.to_dict()
                    ai_mem_data = data.get("aiMemory")
                    if ai_mem_data:
                        try:
                            # Filter out interaction context subfield for compatibility
                            cleaned_mem = ai_mem_data.copy()
                            cleaned_mem.pop("interaction_context", None)
                            user_mem_obj = UserMemory(**cleaned_mem)
                            loaded_from_firestore = True
                            logger.info(f"Loaded persistent AI memory from Firestore for user: {user_id}")
                        except Exception as parse_err:
                            logger.warning(f"Error parsing persistent AI memory: {parse_err}. Will recalculate.")
                    
                    db_beauty_profile = data.get("beautyProfile")
                
                # Fetch bookings
                try:
                    bookings_ref = db.collection("users").document(user_id).collection("bookings")
                    bookings_docs = bookings_ref.get()
                    for b_doc in bookings_docs:
                        b_data = b_doc.to_dict()
                        b_data["id"] = b_doc.id
                        db_bookings.append(b_data)
                except Exception as e:
                    logger.warning(f"Failed to fetch bookings from db: {e}")

                # Fetch journeys
                try:
                    journeys_ref = db.collection("users").document(user_id).collection("journeys")
                    journeys_docs = journeys_ref.get()
                    for j_doc in journeys_docs:
                        j_data = j_doc.to_dict()
                        j_data["id"] = j_doc.id
                        db_journeys.append(j_data)
                except Exception as e:
                    logger.warning(f"Failed to fetch journeys from db: {e}")

            except Exception as db_err:
                logger.error(f"Failed to query Firestore user memory: {db_err}")
                if os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "false":
                    raise

        # Recalculate or fall back to client-supplied data if not resolved from DB
        if not user_mem_obj:
            if client_memory_data:
                try:
                    user_mem_obj = UserMemory(**client_memory_data)
                except Exception:
                    user_mem_obj = None

        # Build default/recalculated context if still unresolved
        if not user_mem_obj:
            # Query user bookings history from tool layer to ground memory dynamically
            from ai.tools.tool_registry import tool_registry
            from ai.state import SharedWorkflowState
            
            dummy_state = SharedWorkflowState(
                request_id="memory_init", user_id=user_id, session_id="mem_init", message=""
            )
            
            try:
                bookings = await tool_registry.invoke("get_user_booking_history", dummy_state, user_id=user_id)
            except Exception:
                bookings = []

            # Recalculate based on real bookings list
            user_mem_obj = MemoryService.recalculate_user_memory(
                bookings=bookings,
                reviews=[],
                salons=MOCK_SALONS,
                user_id=user_id
            )

            # Persist the newly compiled memory structure to Firestore for subsequent lookups
            if not should_use_mock() and user_id and not user_id.startswith("anonymous_"):
                db = get_firestore_client()
                try:
                    doc_ref = db.collection("users").document(user_id)
                    doc_ref.set({"aiMemory": user_mem_obj.model_dump()}, merge=True)
                    logger.info(f"Saved initial recalculated AI memory to Firestore for user: {user_id}")
                except Exception as save_err:
                    logger.error(f"Error saving initial AI memory to Firestore: {save_err}")

        # Build context string
        context_str = MemoryService.build_user_memory_context(user_mem_obj)

        # Pull interaction context if available from Firestore payload
        interaction_context = {
            "shortlists": [],
            "recent_queries": []
        }
        if loaded_from_firestore and ai_mem_data and "interaction_context" in ai_mem_data:
            interaction_context = ai_mem_data["interaction_context"]

        # Compile full memory structure
        return {
            "userId": user_id,
            "raw_memory": user_mem_obj.model_dump(),
            "context_summary": context_str,
            "explicit_preferences": {
                "preferredBudget": f"Around ₹{user_mem_obj.averageBudget}" if user_mem_obj.averageBudget > 0 else "₹₹ - ₹₹₹",
                "favoriteServices": user_mem_obj.preferredServices,
                "preferredLocations": user_mem_obj.preferredLocations,
                "favoriteSalons": user_mem_obj.favoriteSalons
            },
            "beauty_context": {
                "likedServices": user_mem_obj.likedServices,
                "dislikedServices": user_mem_obj.dislikedServices
            },
            "booking_context": {
                "bookingHistoryCount": len(user_mem_obj.bookingHistory),
                "lastBookingDate": user_mem_obj.bookingHistory[0].date if user_mem_obj.bookingHistory else None
            },
            "interaction_context": interaction_context,
            "real_bookings": db_bookings,
            "real_journeys": db_journeys,
            "real_beauty_profile": db_beauty_profile
        }

    @staticmethod
    async def update_user_memory(user_id: str, new_interaction: Dict[str, Any], current_memory: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates the shortlists, recent queries, and context, persisting modifications to Firestore.
        """
        memory = current_memory.copy()
        
        # Track recent query or search intent
        query = new_interaction.get("query")
        if query:
            recent = memory.setdefault("interaction_context", {}).setdefault("recent_queries", [])
            recent.append(query)
            # Cap at 5 queries
            memory["interaction_context"]["recent_queries"] = recent[-5:]
            
        # Track shortlists if recommendations are present
        recommendations = new_interaction.get("recommendations", [])
        if recommendations:
            shortlists = memory.setdefault("interaction_context", {}).setdefault("shortlists", [])
            for r in recommendations:
                if r.get("id") not in [s.get("id") for s in shortlists]:
                    shortlists.append({"id": r.get("id"), "name": r.get("name"), "type": r.get("type")})
            memory["interaction_context"]["shortlists"] = shortlists[-5:]

        # Persist memory map in Firestore users/{uid}
        if not should_use_mock() and user_id and not user_id.startswith("anonymous_"):
            db = get_firestore_client()
            try:
                raw_mem = memory.get("raw_memory")
                if raw_mem:
                    raw_mem["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
                    
                    # Package up full memory payload
                    ai_mem_payload = raw_mem.copy()
                    ai_mem_payload["interaction_context"] = memory.get("interaction_context", {})
                    
                    doc_ref = db.collection("users").document(user_id)
                    doc_ref.set({"aiMemory": ai_mem_payload}, merge=True)
                    logger.info(f"Successfully persisted AI memory for user {user_id} in Firestore.")
            except Exception as e:
                logger.error(f"Error persisting user memory in Firestore: {e}")
                if os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "false":
                    raise
            
        return memory

    @staticmethod
    async def update_explicit_preferences(user_id: str, new_preferences: Dict[str, Any], current_memory: Dict[str, Any]) -> Dict[str, Any]:
        """
        Updates the explicit preferences and beauty context extracted by the Memory Agent,
        and persists them to Firestore.
        """
        memory = current_memory.copy()
        raw_mem = memory.get("raw_memory", {})

        # Merge extracted explicit preferences
        if "budget" in new_preferences:
            budget_val = new_preferences["budget"]
            if isinstance(budget_val, (int, float)):
                raw_mem["averageBudget"] = budget_val
                memory.setdefault("explicit_preferences", {})["preferredBudget"] = f"Around ₹{budget_val}"

        if "preferredLocations" in new_preferences:
            locs = new_preferences["preferredLocations"]
            if isinstance(locs, list):
                raw_mem["preferredLocations"] = list(set(raw_mem.get("preferredLocations", []) + locs))
                memory.setdefault("explicit_preferences", {})["preferredLocations"] = raw_mem["preferredLocations"]

        if "allergies" in new_preferences:
            allergies = new_preferences["allergies"]
            if isinstance(allergies, list):
                # We can store allergies in raw_memory explicitly
                raw_mem["allergies"] = list(set(raw_mem.get("allergies", []) + allergies))
                
        if "hairType" in new_preferences:
            raw_mem["hairType"] = new_preferences["hairType"]
            
        if "dislikedServices" in new_preferences:
            disliked = new_preferences["dislikedServices"]
            if isinstance(disliked, list):
                raw_mem["dislikedServices"] = list(set(raw_mem.get("dislikedServices", []) + disliked))
                memory.setdefault("beauty_context", {})["dislikedServices"] = raw_mem["dislikedServices"]

        memory["raw_memory"] = raw_mem

        # Update context summary string to reflect new data
        try:
            from models.user import UserMemory
            # Filter out interaction context before rebuilding
            cleaned_mem = raw_mem.copy()
            cleaned_mem.pop("interaction_context", None)
            
            # ensure valid parsing
            user_mem_obj = UserMemory(**cleaned_mem)
            context_str = MemoryService.build_user_memory_context(user_mem_obj)
            memory["context_summary"] = context_str
        except Exception as e:
            logger.warning(f"Could not rebuild context summary after memory extraction: {e}")

        # Persist memory map in Firestore users/{uid}
        if not should_use_mock() and user_id and not user_id.startswith("anonymous_"):
            db = get_firestore_client()
            try:
                raw_mem["lastUpdated"] = datetime.utcnow().isoformat() + "Z"
                
                # Package up full memory payload
                ai_mem_payload = raw_mem.copy()
                ai_mem_payload["interaction_context"] = memory.get("interaction_context", {})
                
                doc_ref = db.collection("users").document(user_id)
                doc_ref.set({"aiMemory": ai_mem_payload}, merge=True)
                logger.info(f"Successfully persisted EXPLICIT AI memory for user {user_id} in Firestore.")
            except Exception as e:
                logger.error(f"Error persisting explicit user memory in Firestore: {e}")
                if os.getenv("ALLOW_MOCK_AI_DATA_FALLBACK", "false").lower() == "false":
                    raise
            
        return memory

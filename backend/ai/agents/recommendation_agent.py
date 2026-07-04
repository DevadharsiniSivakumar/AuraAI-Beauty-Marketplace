import logging
from typing import Dict, Any, List
from ai.agents.base_agent import BaseAgent
from ai.state import SharedWorkflowState
from ai.tools.tool_registry import tool_registry

logger = logging.getLogger("recommendation_agent")

class RecommendationAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Salon Recommendation Agent",
            description="Recommends and ranks suitable salons/services based on transparent score components and determines trade-offs."
        )

    async def run(self, state: SharedWorkflowState) -> SharedWorkflowState:
        state.selected_agents.append("recommendation")
        
        # Load user context needed for search
        user_profile = state.memory.get("raw_memory", {}).get("userProfile") or {}
        if not user_profile:
            # Fallback to fetching via user tools
            try:
                user_profile = await tool_registry.invoke("get_user_profile", state, user_id=state.user_id)
            except Exception:
                user_profile = {"name": "Guest", "location": "Indiranagar, Bangalore", "preferredBudget": "₹₹ - ₹₹₹"}

        user_bookings = state.memory.get("raw_memory", {}).get("bookingHistory") or []

        # Run search tool
        parsed_query = {
            "intent": state.intent,
            "locality": state.entities.get("location"),
            "maxPrice": state.entities.get("budget"),
            "isLuxury": state.entities.get("isLuxury", False),
            "offersHomeService": state.entities.get("offersHomeService", False),
            "serviceKeywords": state.entities.get("serviceKeywords", []),
            "queriedSalons": state.entities.get("queriedSalons", [])
        }

        try:
            raw_recs = await tool_registry.invoke(
                "search_salons", 
                state, 
                parsed_query=parsed_query, 
                user_profile=user_profile, 
                user_bookings=user_bookings
            )
        except Exception as e:
            logger.error(f"Error executing search_salons tool: {e}")
            state.errors.append(f"Recommendation search failed: {str(e)}")
            return state

        recommendations = []
        for rec in raw_recs:
            rec_dict = rec.model_dump() if hasattr(rec, "model_dump") else rec
            
            # Perform transparent score calculation and trade-off analysis
            salon_id = rec_dict.get("salonId") or rec_dict.get("id")
            salon_details = await tool_registry.invoke("get_salon_by_id", state, salon_id=salon_id)
            
            reasons = rec_dict.get("reasons", [])
            tradeoffs = []
            
            # Identify tradeoffs
            if salon_details:
                # 1. Budget tradeoff
                if state.entities.get("budget") and rec_dict.get("price"):
                    if float(rec_dict["price"]) > float(state.entities["budget"]):
                        tradeoffs.append("Exceeds target budget limit")
                
                # 2. Location tradeoff
                req_loc = state.entities.get("location")
                if req_loc and salon_details.get("locality", "").lower() != req_loc.lower():
                    tradeoffs.append(f"Not located in target locality '{req_loc}' (found in {salon_details.get('locality')})")
                
                # 3. Availability tradeoff
                if salon_details.get("rating", 0) >= 4.8:
                    tradeoffs.append("High demand; booking in advance is highly recommended")
                if not salon_details.get("offersHomeService") and state.entities.get("offersHomeService"):
                    tradeoffs.append("Does not support doorstep home services")
            
            # Map into final formatted recommendation
            recommendations.append({
                "type": rec_dict.get("type", "salon"),
                "id": rec_dict.get("id"),
                "name": rec_dict.get("name"),
                "price": rec_dict.get("price"),
                "salonId": salon_id,
                "details": rec_dict.get("details"),
                "matchScore": rec_dict.get("matchScore", 85),
                "reasons": reasons,
                "tradeoffs": tradeoffs,
                "memoryIndicator": rec_dict.get("memoryIndicator")
            })

        state.recommendations = recommendations
        state.agent_results["recommendations"] = recommendations
        return state

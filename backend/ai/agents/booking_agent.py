import json
import logging
import re
from typing import Dict, Any, List
from ai.agents.base_agent import BaseAgent
from ai.state import SharedWorkflowState
from ai.tools.tool_registry import tool_registry
from utils.llm_provider import LLMProviderService
from utils.config import settings

logger = logging.getLogger("booking_agent")

class BookingAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Booking Assistance Agent",
            description="Coordinates booking workflows, validates required slot information, drafts bookings, and prompts for confirmation."
        )

    async def run(self, state: SharedWorkflowState) -> SharedWorkflowState:
        state.selected_agents.append("booking")
        
        has_api_key = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
        
        extracted_data = {
            "salonName": None,
            "serviceName": None,
            "date": None,
            "time": None,
            "requiresMoreInfo": True,
            "missingFields": ["salonName", "serviceName", "date", "time"]
        }

        if has_api_key:
            system_prompt = (
                "You are the Booking Assistance Agent for Aura beauty platform.\n"
                "Extract details for drafting a salon booking. You MUST NOT execute the booking; only draft it.\n"
                "Extract:\n"
                "1. Salon Name (e.g. 'Bodycraft', 'Play Salon')\n"
                "2. Service Name (e.g. 'Hydra Facial', 'Balayage')\n"
                "3. Booking Date (e.g. 'Friday', 'July 10')\n"
                "4. Booking Time (e.g. '2 PM', '11:00 AM')\n\n"
                "Output a single valid JSON object with NO markdown code block formats.\n"
                "JSON Schema:\n"
                "{\n"
                "  \"salonName\": string | null,\n"
                "  \"serviceName\": string | null,\n"
                "  \"date\": string | null,\n"
                "  \"time\": string | null,\n"
                "  \"requiresMoreInfo\": boolean,\n"
                "  \"missingFields\": string[]\n"
                "}"
            )
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Message: \"{state.message}\""}
            ]
            
            try:
                raw_response = await LLMProviderService.generate_chat_response(
                    messages, response_format="json_object", max_tokens=600
                )
                cleaned = raw_response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
                extracted_data = json.loads(cleaned)
            except Exception as e:
                logger.error(f"Error in LLM booking parse: {e}. Falling back to rule-based parse.")
                self._fallback_parse(state.message, extracted_data)
        else:
            self._fallback_parse(state.message, extracted_data)

        # Try to resolve salonId and serviceId
        salon_id = None
        service_id = None
        
        # Check entity overrides first if available
        q_salons = state.entities.get("queriedSalons", [])
        if q_salons:
            salon_id = q_salons[0]
        elif extracted_data.get("salonName"):
            # Resolve ID from name
            from services.concierge_service import SALONS
            sal_name = extracted_data["salonName"].lower()
            for s in SALONS:
                if any(p in sal_name for p in s["patterns"]):
                    salon_id = s["id"]
                    break
        
        # If salon is resolved, try to match service
        if salon_id:
            salon_details = await tool_registry.invoke("get_salon_by_id", state, salon_id=salon_id)
            if salon_details:
                extracted_data["salonName"] = salon_details["name"]
                
                # Check serviceKeywords or extracted serviceName
                kw = state.entities.get("serviceKeywords", [])
                srv_name = extracted_data.get("serviceName") or (kw[0] if kw else None)
                if srv_name:
                    srv_name_lower = srv_name.lower()
                    for service in salon_details.get("services", []):
                        if srv_name_lower in service.get("name", "").lower() or service.get("name", "").lower() in srv_name_lower:
                            service_id = service["id"]
                            extracted_data["serviceName"] = service["name"]
                            break

        # Re-evaluate missing fields
        missing = []
        if not salon_id:
            missing.append("salonName")
        if not service_id:
            missing.append("serviceName")
        if not extracted_data.get("date"):
            missing.append("date")
        if not extracted_data.get("time"):
            missing.append("time")

        extracted_data["missingFields"] = missing
        extracted_data["requiresMoreInfo"] = len(missing) > 0

        if not extracted_data["requiresMoreInfo"]:
            # All info present, create the draft
            try:
                draft = await tool_registry.invoke(
                    "create_booking_draft",
                    state,
                    user_id=state.user_id,
                    salon_id=salon_id,
                    service_id=service_id,
                    date=extracted_data["date"],
                    time=extracted_data["time"]
                )
                state.booking_draft = draft
                state.agent_results["booking"] = {
                    "status": "draft_created",
                    "draft": draft,
                    "prompt": f"I have prepared a draft to book **{draft['serviceName']}** at **{draft['salonName']}** on **{draft['date']}** at **{draft['time']}** for **₹{draft['price']}**. Please confirm if you'd like to schedule this booking!"
                }
            except Exception as e:
                logger.error(f"Draft creation failed: {e}")
                state.agent_results["booking"] = {
                    "status": "error",
                    "error": str(e),
                    "prompt": f"Sorry, I encountered an issue preparing the booking: {str(e)}."
                }
        else:
            state.agent_results["booking"] = {
                "status": "info_required",
                "missingFields": missing,
                "prompt": f"I'd love to help you book an appointment! Could you please provide the missing details: {', '.join(missing)}?"
            }

        return state

    def _fallback_parse(self, message: str, data: Dict[str, Any]):
        msg = message.lower()
        
        # Resolve salon name patterns
        from services.concierge_service import SALONS
        for s in SALONS:
            if any(p in msg for p in s["patterns"]):
                data["salonName"] = s["id"]
                break
                
        # Resolve service name patterns
        from services.concierge_service import KEYWORD_MAP
        for kw in KEYWORD_MAP:
            if kw in msg:
                data["serviceName"] = kw
                break
                
        # Simple date regex checks
        date_match = re.search(r"(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d+|\d{1,2}/\d{1,2}|\b(today|tomorrow|friday|saturday|sunday|monday|tuesday|wednesday|thursday)\b", msg)
        if date_match:
            data["date"] = date_match.group(0)
            
        # Simple time regex checks
        time_match = re.search(r"\d{1,2}(:\d{2})?\s*(pm|am|o'clock)?", msg)
        if time_match:
            data["time"] = time_match.group(0)

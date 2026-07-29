import json
import logging
from typing import Dict, Any
from ai.agents.base_agent import BaseAgent
from ai.state import SharedWorkflowState
from services.concierge_service import ConciergeService
from utils.llm_provider import LLMProviderService
from utils.config import settings

logger = logging.getLogger("intent_agent")

class IntentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Intent and Context Agent",
            description="Analyzes user message to detect primary and secondary beauty/salon query intents and extract structured entities."
        )

    async def run(self, state: SharedWorkflowState) -> SharedWorkflowState:
        has_api_key = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
        
        # Rule-based fallback parse
        fallback_data = ConciergeService.detect_intent(state.message)
        
        if not has_api_key:
            logger.info("No API keys. Using rule-based fallback intent classification.")
            self._apply_intent_data(state, fallback_data)
            return state

        # Prompt for LLM structured output
        system_prompt = (
            "You are the Intent and Context Agent for Aura, an AI-powered beauty intelligence system.\n"
            "Analyze the user's message and output a single valid JSON object containing intent classification and entity extraction.\n"
            "Do NOT wrap the response in markdown blocks like ```json.\n\n"
            "Intents must be classified as one of:\n"
            "- salon_recommendation: request for recommending a salon or service\n"
            "- beauty_planning: requesting a prep timeline, wedding prep, event recovery plan\n"
            "- review_analysis: requesting review summaries, ratings check, themes in customer feedback\n"
            "- booking_assistance: help booking a slot, scheduling, pricing confirmation\n"
            "- service_discovery: exploring types of haircuts, facials, or treatment options\n"
            "- salon_comparison: compare two or more salons/services side-by-side\n"
            "- beauty_question: general advice about skin/hair ingredients or routines\n"
            "- general_conversation: greetings, basic questions about Aura, chit chat\n\n"
            "Entities to extract (if present):\n"
            "- service: specific treatment or service requested (e.g. 'bridal makeup', 'hydra facial')\n"
            "- budget: maximum numeric price constraint in rupees (e.g. 8000)\n"
            "- location: neighborhood or locality specified (e.g. 'Indiranagar', 'Koramangala')\n"
            "- date: date or day requested for booking (e.g. 'next Friday')\n"
            "- time: time of day requested (e.g. '2:00 PM')\n"
            "- event: occasion type (e.g. 'wedding', 'party')\n"
            "- skin_type: skin properties mentioned (e.g. 'sensitive', 'dry')\n"
            "- hair_type: hair type or texture (e.g. 'curly', '2C wavy')\n"
            "- preferences: styling/ambiance details (e.g. 'luxury', 'home service')\n"
            "- urgency: timeline/urgency (e.g. '3 weeks', 'urgent')\n"
            "- salon_names: list of specific salon brands mentioned (e.g. ['Bodycraft', 'Play Salon'])\n\n"
            "JSON structure MUST match this exact schema:\n"
            "{\n"
            "  \"primaryIntent\": string,\n"
            "  \"secondaryIntents\": string[],\n"
            "  \"confidence\": number,\n"
            "  \"entities\": {\n"
            "    \"service\": string | null,\n"
            "    \"budget\": number | null,\n"
            "    \"location\": string | null,\n"
            "    \"date\": string | null,\n"
            "    \"time\": string | null,\n"
            "    \"event\": string | null,\n"
            "    \"skin_type\": string | null,\n"
            "    \"hair_type\": string | null,\n"
            "    \"preferences\": string | null,\n"
            "    \"urgency\": string | null,\n"
            "    \"salon_names\": string[]\n"
            "  }\n"
            "}"
        )

        user_prompt = f"User Message: \"{state.message}\""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            raw_response = await LLMProviderService.generate_chat_response(
                messages, response_format="json_object", max_tokens=1000
            )
            cleaned = raw_response.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.replace("```json", "").replace("```", "").strip()
            data = json.loads(cleaned)
            
            # Map LLM entities to match existing fallback fields
            llm_salons = data.get("entities", {}).get("salon_names", [])
            mapped_salons = fallback_data["queriedSalons"].copy()
            if isinstance(llm_salons, list):
                # Simple mapping heuristic
                for s in llm_salons:
                    s_low = s.lower()
                    if "bounce" in s_low and "bounce-salon-koramangala" not in mapped_salons:
                        mapped_salons.append("bounce-salon-koramangala")
                    elif "play" in s_low and "play-salon" not in mapped_salons:
                        mapped_salons.append("play-salon")
                    elif "bodycraft" in s_low and "bodycraft-salon-spa" not in mapped_salons:
                        mapped_salons.append("bodycraft-salon-spa")

            # Force review_analysis intent if the user explicitly asks for reviews
            primary_intent = data.get("primaryIntent", fallback_data["intent"])
            if "review" in state.message.lower() and primary_intent != "review_analysis":
                primary_intent = "review_analysis"

            mapped_data = {
                "intent": primary_intent,
                "secondaryIntents": data.get("secondaryIntents", []),
                "locality": data.get("entities", {}).get("location") or fallback_data["locality"],
                "maxPrice": data.get("entities", {}).get("budget") or fallback_data["maxPrice"],
                "isLuxury": "luxury" in str(data.get("entities", {}).get("preferences", "")).lower() or fallback_data["isLuxury"],
                "offersHomeService": "home" in str(data.get("entities", {}).get("preferences", "")).lower() or fallback_data["offersHomeService"],
                "serviceKeywords": [data.get("entities", {}).get("service")] if data.get("entities", {}).get("service") else fallback_data["serviceKeywords"],
                "queriedSalons": mapped_salons
            }
            
            # Merge extracted entities into state
            state.entities.update(data.get("entities", {}))
            self._apply_intent_data(state, mapped_data)
        except Exception as e:
            logger.error(f"Error in LLM intent classification: {e}. Falling back to rule-based.")
            self._apply_intent_data(state, fallback_data)

        return state

    def _apply_intent_data(self, state: SharedWorkflowState, intent_data: Dict[str, Any]):
        state.intent = intent_data.get("intent", "general_query")
        state.secondary_intents = intent_data.get("secondaryIntents", [])
        
        # Populate entities with standard fields for other agents to consume
        state.entities.setdefault("location", intent_data.get("locality"))
        state.entities.setdefault("budget", intent_data.get("maxPrice"))
        state.entities.setdefault("isLuxury", intent_data.get("isLuxury", False))
        state.entities.setdefault("offersHomeService", intent_data.get("offersHomeService", False))
        state.entities.setdefault("serviceKeywords", intent_data.get("serviceKeywords", []))
        state.entities.setdefault("queriedSalons", intent_data.get("queriedSalons", []))
        
        state.selected_agents.append("intent")

import json
import logging
from typing import Dict, Any
from ai.agents.base_agent import BaseAgent
from ai.state import SharedWorkflowState
from services.concierge_service import ConciergeService
from utils.llm_provider import LLMProviderService
from utils.config import settings

logger = logging.getLogger("journey_agent")

class JourneyAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="Beauty Journey Planning Agent",
            description="Constructs personalized beauty preparation timelines, milestones, and scheduling suggestions with safety disclaimers."
        )

    async def run(self, state: SharedWorkflowState) -> SharedWorkflowState:
        state.selected_agents.append("journey")
        
        goal = state.message
        user_name = state.memory.get("raw_memory", {}).get("userProfile", {}).get("name", "Guest")
        memory_context = state.memory.get("context_summary", "")

        has_api_key = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
        
        if has_api_key:
            system_prompt = (
                "You are the Beauty Journey Planning Agent for Aura, an elite wellness concierge platform.\n"
                "Your task is to create a structured, chronological beauty preparation plan based on the client's goal, timeline, and skin/hair profile.\n"
                "You MUST respond with a single valid JSON object. Do not include markdown code block formats (e.g. ```json).\n\n"
                "Safety & Medical Constraints:\n"
                "- Avoid pretending to provide a medical diagnosis (e.g., treating skin diseases, hair loss infections).\n"
                "- For skin or health-sensitive queries, restrict to cosmetic suggestions and explicitly advise the user to consult a board-certified dermatologist or trichologist in the 'medicalDisclaimer' field.\n\n"
                "JSON Schema:\n"
                "{\n"
                "  \"journeyType\": \"Bridal\" | \"Event Prep\" | \"Vacation Glow-Up\" | \"Hair Recovery\" | \"Skin Recovery\" | \"Maintenance\",\n"
                "  \"durationDays\": number,\n"
                "  \"steps\": [\n"
                "    {\n"
                "      \"stepNumber\": number,\n"
                "      \"title\": string,\n"
                "      \"description\": string,\n"
                "      \"timeline\": string,\n"
                "      \"recommendedService\": string,\n"
                "      \"precautions\": string\n"
                "    }\n"
                "  ],\n"
                "  \"medicalDisclaimer\": string,\n"
                "  \"nextSteps\": string[]\n"
                "}"
            )

            user_prompt = (
                f"Client: {user_name}\n"
                f"Goal: \"{goal}\"\n"
                f"Memory & Profile Context:\n{memory_context}"
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            try:
                raw_response = await LLMProviderService.generate_chat_response(
                    messages, response_format="json_object", max_tokens=1500
                )
                cleaned = raw_response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
                journey_data = json.loads(cleaned)
                state.journey_plan = journey_data
                state.agent_results["journey_plan"] = journey_data
                return state
            except Exception as e:
                logger.error(f"Error in LLM journey planning: {e}. Falling back to rule-based.")

        # Rule-based Fallback
        fallback_journey = ConciergeService.generate_local_journey_fallback(goal)
        
        # Inject precautions & nextSteps to enrich standard fallback
        steps = []
        for step in fallback_journey.get("steps", []):
            steps.append({
                "stepNumber": step.get("stepNumber"),
                "title": step.get("title"),
                "description": step.get("description"),
                "timeline": step.get("timeline"),
                "recommendedService": step.get("recommendedService"),
                "precautions": "Perform a patch test 48 hours prior to treatment to ensure no skin irritation."
            })
            
        disclaimer = "Aura's recommendations are cosmetic. If you have active skin inflammation, severe acne, eczema, or scalp disorders, please consult a clinical dermatologist."
        next_steps = ["Review the matching salons for step 1 services", "Draft a booking schedule in your calendar", "Consult a salon specialist for a custom patch test"]
        
        journey_data = {
            "journeyType": fallback_journey.get("journeyType", "Maintenance"),
            "durationDays": fallback_journey.get("durationDays", 30),
            "steps": steps,
            "medicalDisclaimer": disclaimer,
            "nextSteps": next_steps
        }
        
        state.journey_plan = journey_data
        state.agent_results["journey_plan"] = journey_data
        return state

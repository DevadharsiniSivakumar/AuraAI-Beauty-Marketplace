import time
import uuid
import logging
import json
from typing import Dict, Any, Optional, List
from ai.state import SharedWorkflowState
from ai.registry import agent_registry
from ai.memory.memory_manager import MemoryManager
from ai.tools.tool_registry import tool_registry
from services.concierge_service import ConciergeService
from utils.llm_provider import LLMProviderService
from utils.config import settings

logger = logging.getLogger("orchestrator")

class AIOrchestrator:
    @staticmethod
    async def run(
        message: str,
        user_id: str,
        session_id: str,
        user_profile: Optional[Dict[str, Any]] = None,
        bookings: Optional[List[Dict[str, Any]]] = None,
        user_memory: Optional[Dict[str, Any]] = None,
        beauty_profile: Optional[Dict[str, Any]] = None
    ) -> SharedWorkflowState:
        start_time = time.time()
        request_id = str(uuid.uuid4())
        
        # 1. Initialize shared workflow state
        state = SharedWorkflowState(
            request_id=request_id,
            user_id=user_id,
            session_id=session_id,
            message=message,
            metadata={
                "startTime": start_time,
                "userProfile": user_profile or {},
                "bookings": bookings or [],
                "beautyProfile": beauty_profile or {}
            }
        )

        # 2. Retrieve user memory context
        try:
            state.memory = await MemoryManager.load_user_memory(user_id, user_memory)
            # Mix in beauty profile details to memory context if provided
            if beauty_profile:
                bp_str = (
                    f"\n\nClient Beauty Profile (Selfie Analysis):\n"
                    f"* Face Shape: {beauty_profile.get('faceShape')}\n"
                    f"* Hair Type: {beauty_profile.get('hairType')}\n"
                    f"* Hair Density: {beauty_profile.get('hairDensity', 'High')}\n"
                    f"* Skin Tone: {beauty_profile.get('skinTone')}\n"
                    f"* Skin Undertone: {beauty_profile.get('undertone', 'Warm')}\n"
                    f"* Hair Length: {beauty_profile.get('hairLength', 'Medium')}\n"
                    f"* Beauty Summary: {beauty_profile.get('beautySummary', '')}"
                )
                state.memory["context_summary"] += bp_str
        except Exception as e:
            logger.error(f"Error loading user memory: {e}")
            state.errors.append(f"Memory retrieval failed: {str(e)}")

        # 3. Detect Intent & Context
        try:
            intent_agent = agent_registry.get_agent("intent")
            state = await intent_agent.run(state)
        except Exception as e:
            logger.error(f"Intent Agent failed: {e}")
            state.intent = "general_query"
            state.errors.append(f"Intent Agent failed: {str(e)}")

        # Map legacy rule-based intents to standardized Agent intents
        if state.intent == "booking_help":
            state.intent = "booking_assistance"
        elif state.intent in ["salon_search", "service_search", "style_advice"]:
            state.intent = "salon_recommendation"

        # 3.5 Run Memory Agent to extract any explicit preferences
        try:
            memory_agent = agent_registry.get_agent("memory")
            state = await memory_agent.run(state)
        except Exception as e:
            logger.error(f"Memory Agent failed: {e}")
            state.errors.append(f"Memory Agent failed: {str(e)}")

        # 4. Specialized Agent Routing & Execution
        logger.info(f"Orchestrator routing query. Primary: '{state.intent}', Secondary: {state.secondary_intents}")

        # Gather unique agent keys to run based on primary and secondary intents
        agents_to_run = set()
        all_intents = [state.intent] + state.secondary_intents
        
        # Standardize all intents in the list
        all_intents = [
            "booking_assistance" if i == "booking_help" 
            else "salon_recommendation" if i in ["salon_search", "service_search", "style_advice"] 
            else i 
            for i in all_intents if i
        ]

        if any(i in ["salon_recommendation", "service_discovery", "salon_comparison", "review_analysis", "beauty_planning"] for i in all_intents):
            agents_to_run.add("recommendation")
            
        if any(i in ["beauty_planning"] for i in all_intents):
            agents_to_run.add("journey")
            
        if any(i in ["review_analysis", "salon_comparison"] for i in all_intents):
            agents_to_run.add("review")
            
        if any(i in ["booking_assistance"] for i in all_intents):
            agents_to_run.add("booking")

        try:
            # Execute agents in sequential dependency order
            for agent_key in ["recommendation", "journey", "review", "booking"]:
                if agent_key in agents_to_run:
                    agent = agent_registry.get_agent(agent_key)
                    state = await agent.run(state)

            # Special comparison handling if salon comparison is requested
            if any(i in ["salon_comparison"] for i in all_intents):
                # Retrieve full target salons details for compare tool
                target_salons = []
                for rec_item in state.recommendations:
                    salon_id = rec_item.get("salonId") or rec_item.get("id")
                    salon_data = await tool_registry.invoke("get_salon_by_id", state, salon_id=salon_id)
                    if salon_data and salon_data not in target_salons:
                        target_salons.append(salon_data)
                
                if len(target_salons) >= 2:
                    from ai.tools.tool_registry import tool_registry
                    comparison = await tool_registry.invoke(
                        "compare_salons", 
                        state, 
                        target_salons=target_salons, 
                        query=state.message, 
                        memory_context=state.memory.get("context_summary")
                    )
                    state.comparison = comparison
                else:
                    # Fallback comparison if not enough target salons
                    from services.recommendation_service import RecommendationService
                    all_salons = await RecommendationService.get_salons_and_services()
                    comparison = await tool_registry.invoke(
                        "compare_salons", 
                        state, 
                        target_salons=all_salons[:2], 
                        query=state.message, 
                        memory_context=state.memory.get("context_summary")
                    )
                    state.comparison = comparison
        except Exception as agent_err:
            logger.error(f"Routing workflow agent execution failed: {agent_err}")
            state.errors.append(f"Routing execution failed: {str(agent_err)}")

        # 5. Summarization ("Narrator Phase")
        try:
            await AIOrchestrator._narrate_response(state, user_profile)
        except Exception as narrate_err:
            logger.error(f"Narrator failed: {narrate_err}")
            # Ultimate local narrative fallback
            state.final_response = ConciergeService.generate_local_explanation(
                user_profile.get("name", "Guest") if user_profile else "Guest",
                state.intent,
                state.recommendations,
                state.memory.get("context_summary"),
                state.message
            )

        # 6. Update user memory based on interaction shortlists
        try:
            state.memory = await MemoryManager.update_user_memory(
                user_id=user_id,
                new_interaction={
                    "query": state.message,
                    "recommendations": state.recommendations
                },
                current_memory=state.memory
            )
        except Exception as mem_up_err:
            logger.error(f"Memory update failed: {mem_up_err}")

        # Record trace metadata
        state.metadata["executionDurationMs"] = int((time.time() - start_time) * 1000)
        state.metadata["agentsUsed"] = state.selected_agents
        state.metadata["fallbackUsed"] = not bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
        
        return state

    @staticmethod
    async def _narrate_response(state: SharedWorkflowState, user_profile: Optional[Dict[str, Any]]):
        """
        Combines findings from all executed agents and narrates a final premium
        personalized text response to the client.
        """
        has_api_key = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
        
        if not has_api_key:
            # Fallback
            state.final_response = ConciergeService.generate_local_explanation(
                user_profile.get("name", "Guest") if user_profile else "Guest",
                state.intent,
                state.recommendations,
                state.memory.get("context_summary"),
                state.message
            )
            return

        user_name = user_profile.get("name", "Guest") if user_profile else "Guest"
        
        # Build comprehensive system instructions for narration
        system_prompt = ConciergeService.get_luxury_system_prompt(
            user_name=user_name,
            intent=state.intent,
            memory_context=state.memory.get("context_summary")
        )
        
        # Construct summary of intermediate inputs
        context_data = {
            "query": state.message,
            "detectedIntent": state.intent,
            "recommendations": [
                {
                    "name": r.get("name"),
                    "price": r.get("price"),
                    "reasons": r.get("reasons"),
                    "tradeoffs": r.get("tradeoffs"),
                    "details": r.get("details"),
                    "type": r.get("type")
                }
                for r in state.recommendations
            ],
            "reviewAnalysis": state.agent_results.get("review_analysis"),
            "journeyPlan": state.journey_plan,
            "bookingDraft": state.booking_draft,
            "bookingPrompt": state.agent_results.get("booking", {}).get("prompt") if state.agent_results.get("booking") else None
        }
        
        user_prompt = (
            f"Here is the collected intelligence context from specialized beauty agents:\n"
            f"{json.dumps(context_data, indent=2)}\n\n"
            f"Please synthesize this into a single, cohesive, premium consultation narrative. "
            f"Introduce the recommendations, beauty journey steps, review insights, or booking actions "
            f"pleasingly, matching your luxurious tone. Do not mention technical agent names.\n"
            f"IMPORTANT: When presenting Review Intelligence or Salon comparisons, do NOT use markdown formatting like asterisks (*) or hashes (#). Format it as clean, simple conversational prose."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        raw_narrative = await LLMProviderService.generate_chat_response(messages, max_tokens=1500)
        state.final_response = raw_narrative.strip()

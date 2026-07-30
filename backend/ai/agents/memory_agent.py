import json
import logging
from typing import Dict, Any
from ai.agents.base_agent import BaseAgent
from ai.state import SharedWorkflowState
from ai.memory.memory_manager import MemoryManager
from utils.llm_provider import LLMProviderService

logger = logging.getLogger("memory_agent")

class MemoryAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            name="memory",
            description="Extracts implicit and explicit preferences from user queries and updates persistent memory."
        )

    async def run(self, state: SharedWorkflowState) -> SharedWorkflowState:
        logger.info("Executing Memory Agent")
        
        try:
            # 1. Analyze user message to extract any new persistent memory items
            system_prompt = (
                "You are the Aura AI Memory Extraction Agent.\n"
                "Your job is to read the user's message and determine if they are stating a personal preference, allergy, budget constraint, location, or physical trait (e.g., face shape, hair type) that should be remembered for future interactions.\n"
                "Return ONLY a JSON object with the extracted information. If there are no new preferences to extract, return an empty JSON object {}.\n"
                "Example output:\n"
                '{"budget": 1500, "allergies": ["lavender"], "preferredLocations": ["Indiranagar"], "hairType": "curly", "dislikedServices": ["threading"]}'
            )

            messages = [
                {"role": "system", "content": system_prompt}
            ]

            # Inject chat history for contextual awareness
            for msg in state.chat_history:
                if msg.get("content") != state.message:
                    messages.append({
                        "role": "assistant" if msg.get("role") == "assistant" else "user",
                        "content": msg.get("content")
                    })

            messages.append({"role": "user", "content": state.message})

            response_content = await LLMProviderService.generate_response(messages)
            
            # Parse JSON from response
            try:
                # Find JSON block in case there's markdown formatting
                if "```json" in response_content:
                    json_str = response_content.split("```json")[1].split("```")[0].strip()
                elif "```" in response_content:
                    json_str = response_content.split("```")[1].split("```")[0].strip()
                else:
                    json_str = response_content.strip()
                    
                extracted_data = json.loads(json_str)
            except json.JSONDecodeError:
                logger.warning(f"Memory Agent failed to parse JSON: {response_content}")
                extracted_data = {}

            if not extracted_data:
                logger.info("No new memory items extracted.")
                return state

            logger.info(f"Memory Agent extracted new preferences: {extracted_data}")

            # 2. Update persistent memory using MemoryManager
            if state.user_id and not state.user_id.startswith("anonymous_"):
                # We update the state in-place so downstream agents have the updated context immediately
                updated_memory = await MemoryManager.update_explicit_preferences(state.user_id, extracted_data, state.memory)
                state.memory = updated_memory
                
                # Add to agent activity logs
                if not hasattr(state, 'agent_activity'):
                    state.agent_activity = []
                state.agent_activity.append(
                    f"Memory Agent remembered new details: {list(extracted_data.keys())}"
                )

        except Exception as e:
            logger.error(f"Error in Memory Agent: {e}")
            state.errors.append(f"Memory Agent execution failed: {str(e)}")

        return state

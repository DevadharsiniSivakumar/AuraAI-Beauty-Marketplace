from typing import Dict
from ai.agents.base_agent import BaseAgent
from ai.agents.intent_agent import IntentAgent
from ai.agents.recommendation_agent import RecommendationAgent
from ai.agents.review_agent import ReviewAgent
from ai.agents.journey_agent import JourneyAgent
from ai.agents.booking_agent import BookingAgent
from ai.agents.memory_agent import MemoryAgent

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}
        
        # Proactively register specialized agents
        self.register("intent", IntentAgent())
        self.register("recommendation", RecommendationAgent())
        self.register("review", ReviewAgent())
        self.register("journey", JourneyAgent())
        self.register("booking", BookingAgent())
        self.register("memory", MemoryAgent())

    def register(self, name: str, agent: BaseAgent):
        self._agents[name] = agent

    def get_agent(self, name: str) -> BaseAgent:
        if name not in self._agents:
            raise KeyError(f"Agent '{name}' is not registered.")
        return self._agents[name]

agent_registry = AgentRegistry()

from abc import ABC, abstractmethod
from ai.state import SharedWorkflowState

class BaseAgent(ABC):
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description

    @abstractmethod
    async def run(self, state: SharedWorkflowState) -> SharedWorkflowState:
        """Runs the agent and updates the shared workflow state."""
        pass

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SharedWorkflowState(BaseModel):
    request_id: str
    user_id: str
    session_id: str
    message: str
    intent: Optional[str] = None
    secondary_intents: List[str] = Field(default_factory=list)
    chat_history: List[Dict[str, Any]] = Field(default_factory=list)
    entities: Dict[str, Any] = Field(default_factory=dict)
    memory: Dict[str, Any] = Field(default_factory=dict)
    selected_agents: List[str] = Field(default_factory=list)
    agent_results: Dict[str, Any] = Field(default_factory=dict)
    tool_results: List[Dict[str, Any]] = Field(default_factory=list)
    errors: List[str] = Field(default_factory=list)
    final_response: Optional[str] = None
    recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    comparison: Optional[Dict[str, Any]] = None
    journey_plan: Optional[Dict[str, Any]] = None
    booking_draft: Optional[Dict[str, Any]] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

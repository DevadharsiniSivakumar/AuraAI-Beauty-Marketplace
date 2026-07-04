from typing import List, Dict, Any, Optional
from ai.tools.tool_registry import tool_registry
from ai.tools.salon_tools import get_salon_by_id
from services.concierge_service import ConciergeService

@tool_registry.register(
    name="get_salon_reviews",
    description="Retrieve all customer reviews for a given salon ID."
)
async def get_salon_reviews(salon_id: str) -> List[Dict[str, Any]]:
    salon = await get_salon_by_id(salon_id)
    if salon:
        return salon.get("reviews", [])
    return []

@tool_registry.register(
    name="compare_salons",
    description="Generates a structured side-by-side comparison and review analysis for target salons."
)
async def compare_salons(target_salons: List[Dict[str, Any]], query: str, memory_context: Optional[str] = None) -> Dict[str, Any]:
    return await ConciergeService.compare_salons(
        query=query,
        target_salons=target_salons,
        memory_context=memory_context
    )

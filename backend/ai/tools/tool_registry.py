from typing import Callable, Dict, Any, List

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, Callable] = {}
        self._descriptions: Dict[str, str] = {}

    def register(self, name: str, description: str):
        def decorator(func: Callable):
            self._tools[name] = func
            self._descriptions[name] = description
            return func
        return decorator

    def get_tool(self, name: str) -> Callable:
        if name not in self._tools:
            raise KeyError(f"Tool '{name}' is not registered.")
        return self._tools[name]

    def get_descriptions(self) -> Dict[str, str]:
        return self._descriptions

    async def invoke(self, name: str, state: Any, **kwargs) -> Any:
        tool_func = self.get_tool(name)
        # Log tool invocation to state
        tool_call_log = {
            "tool": name,
            "arguments": kwargs,
            "status": "running"
        }
        state.tool_results.append(tool_call_log)
        try:
            # Check if it's a coroutine or standard function
            import inspect
            if inspect.iscoroutinefunction(tool_func):
                res = await tool_func(**kwargs)
            else:
                res = tool_func(**kwargs)
            
            tool_call_log["status"] = "success"
            # Return a simplified view of output to avoid bloating the state
            if isinstance(res, list):
                tool_call_log["output"] = f"List of {len(res)} items"
            elif isinstance(res, dict):
                tool_call_log["output"] = {k: v for k, v in res.items() if k in ["id", "name", "salonId", "status", "bookingId"]}
            else:
                tool_call_log["output"] = str(res)
            return res
        except Exception as e:
            tool_call_log["status"] = "failed"
            tool_call_log["error"] = str(e)
            state.errors.append(f"Tool {name} failed: {str(e)}")
            raise e

tool_registry = ToolRegistry()

import json
import logging
import httpx
from typing import List, Dict, Any, Optional
from utils.config import settings

logger = logging.getLogger("llm_provider")

class LLMProviderService:
    @staticmethod
    def get_provider(provider: Optional[str] = None) -> str:
        prov = provider.lower() if provider else settings.PRIMARY_LLM_PROVIDER
        if prov not in ["groq", "gemini", "openai"]:
            prov = "groq"
        return prov

    @classmethod
    async def generate_chat_response(
        cls,
        messages: List[Dict[str, str]],
        provider: Optional[str] = None,
        response_format: Optional[str] = None,
        max_tokens: int = 800,
        temperature: float = 0.3
    ) -> str:
        """
        Generates text completions across Groq, Gemini, or OpenAI.
        response_format can be 'json_object' or None.
        """
        selected_provider = cls.get_provider(provider)

        if selected_provider == "groq":
            return await cls._generate_groq(messages, response_format, max_tokens, temperature)
        elif selected_provider == "gemini":
            return await cls._generate_gemini(messages, response_format, max_tokens, temperature)
        elif selected_provider == "openai":
            return await cls._generate_openai(messages, response_format, max_tokens, temperature)
        
        raise ValueError(f"Unknown provider: {selected_provider}")

    @classmethod
    async def analyze_image(
        cls,
        base64_image: str,
        prompt: str,
        provider: Optional[str] = None
    ) -> str:
        """
        Analyzes a base64 image (with/without data: prefix) using a vision model.
        Falls back to available providers in the order: Gemini -> Groq -> OpenAI.
        """
        # Determine fallback order based on available keys
        providers_to_try = []
        
        # If a specific provider was requested, prioritize it
        requested = provider.lower() if provider else None
        if requested in ["gemini", "groq", "openai"]:
            providers_to_try.append(requested)
        
        # Add others as fallbacks
        for p in ["gemini", "groq", "openai"]:
            if p not in providers_to_try:
                providers_to_try.append(p)

        last_error = None

        # Clean base64 image data
        base64_data = base64_image
        mime_type = "image/jpeg"
        if base64_image.startswith("data:"):
            parts = base64_image.split(";base64,")
            if len(parts) == 2:
                base64_data = parts[1]
                mime_parts = parts[0].split(":")
                if len(mime_parts) == 2:
                    mime_type = mime_parts[1]

        for prov in providers_to_try:
            try:
                if prov == "gemini" and settings.GEMINI_API_KEY:
                    logger.info("Using Gemini Vision Provider...")
                    return await cls._analyze_gemini_vision(base64_data, mime_type, prompt)
                elif prov == "groq" and settings.GROQ_API_KEY:
                    logger.info("Using Groq Vision Provider...")
                    return await cls._analyze_groq_vision(base64_data, mime_type, prompt)
                elif prov == "openai" and settings.OPENAI_API_KEY:
                    logger.info("Using OpenAI Vision Provider...")
                    return await cls._analyze_openai_vision(base64_data, mime_type, prompt)
            except Exception as e:
                logger.error(f"{prov.capitalize()} Vision Provider failed: {e}")
                last_error = e

        raise RuntimeError(f"All vision providers failed or were unconfigured. Last error: {last_error}")

    # --- PRIVATE PROVIDER-SPECIFIC METHODS ---

    @classmethod
    async def _generate_groq(
        cls,
        messages: List[Dict[str, str]],
        response_format: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> str:
        api_key = settings.GROQ_API_KEY
        if not api_key:
            raise ValueError("GROQ_API_KEY is not defined in environment variables.")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        body = {
            "model": settings.GROQ_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if response_format == "json_object":
            body["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=body)
            if not response.is_success:
                raise RuntimeError(f"Groq API error ({response.status_code}): {response.text}")
            
            data = response.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "")

    @classmethod
    async def _generate_openai(
        cls,
        messages: List[Dict[str, str]],
        response_format: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> str:
        api_key = settings.OPENAI_API_KEY
        if not api_key:
            raise ValueError("OPENAI_API_KEY is not defined in environment variables.")

        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }
        body = {
            "model": settings.OPENAI_MODEL,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        if response_format == "json_object":
            body["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=body)
            if not response.is_success:
                raise RuntimeError(f"OpenAI API error ({response.status_code}): {response.text}")
            
            data = response.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "")

    @classmethod
    async def _generate_gemini(
        cls,
        messages: List[Dict[str, str]],
        response_format: Optional[str],
        max_tokens: int,
        temperature: float
    ) -> str:
        api_key = settings.GEMINI_API_KEY
        if not api_key:
            raise ValueError("GEMINI_API_KEY is not defined in environment variables.")

        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}

        # Translate OpenAI message format to Gemini content format
        # and extract system prompt if there is one
        system_instruction = None
        gemini_contents = []

        for msg in messages:
            role = msg.get("role")
            content = msg.get("content", "")
            if role == "system":
                system_instruction = {"parts": [{"text": content}]}
            elif role in ["user", "assistant"]:
                g_role = "user" if role == "user" else "model"
                gemini_contents.append({
                    "role": g_role,
                    "parts": [{"text": content}]
                })

        body = {
            "contents": gemini_contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": max_tokens
            }
        }
        if system_instruction:
            body["systemInstruction"] = system_instruction
        if response_format == "json_object":
            body["generationConfig"]["responseMimeType"] = "application/json"

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=body)
            if not response.is_success:
                raise RuntimeError(f"Gemini API error ({response.status_code}): {response.text}")
            
            data = response.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                raise RuntimeError(f"Unexpected response structure from Gemini API: {data}")

    @classmethod
    async def _analyze_gemini_vision(cls, base64_data: str, mime_type: str, prompt: str) -> str:
        api_key = settings.GEMINI_API_KEY
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={api_key}"
        headers = {"Content-Type": "application/json"}

        body = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt},
                        {
                            "inlineData": {
                                "mimeType": mime_type,
                                "data": base64_data
                            }
                        }
                    ]
                }
            ],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(url, headers=headers, json=body)
            if not response.is_success:
                raise RuntimeError(f"Gemini Vision API error ({response.status_code}): {response.text}")
            
            data = response.json()
            try:
                return data["candidates"][0]["content"]["parts"][0]["text"]
            except (KeyError, IndexError):
                raise RuntimeError(f"Unexpected response structure from Gemini Vision API: {data}")

    @classmethod
    async def _analyze_groq_vision(cls, base64_data: str, mime_type: str, prompt: str) -> str:
        api_key = settings.GROQ_API_KEY
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        body = {
            "model": settings.GROQ_VISION_MODEL,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_data}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.2,
            "max_tokens": 800,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(url, headers=headers, json=body)
            if not response.is_success:
                raise RuntimeError(f"Groq Vision API error ({response.status_code}): {response.text}")
            
            data = response.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "")

    @classmethod
    async def _analyze_openai_vision(cls, base64_data: str, mime_type: str, prompt: str) -> str:
        api_key = settings.OPENAI_API_KEY
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        body = {
            "model": "gpt-4o-mini",
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:{mime_type};base64,{base64_data}"
                            }
                        }
                    ]
                }
            ],
            "temperature": 0.2,
            "max_tokens": 800,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=45.0) as client:
            response = await client.post(url, headers=headers, json=body)
            if not response.is_success:
                raise RuntimeError(f"OpenAI Vision API error ({response.status_code}): {response.text}")
            
            data = response.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "")

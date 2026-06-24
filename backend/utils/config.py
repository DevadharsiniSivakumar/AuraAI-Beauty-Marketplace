import os
from pathlib import Path
from dotenv import load_dotenv

# Try to load env variables from backend's local directory first,
# then fall back to the nextjs .env.local in sibling folder
backend_dir = Path(__file__).resolve().parent.parent
nextjs_dir = backend_dir.parent / "aura-ai"

# Load in sequence so local takes precedence if any
if (backend_dir / ".env").exists():
    load_dotenv(backend_dir / ".env")
elif (nextjs_dir / ".env.local").exists():
    load_dotenv(nextjs_dir / ".env.local")
else:
    load_dotenv()  # Default system environment

class Settings:
    # API Keys
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")

    # Default Models
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    # Llama 3.2 vision fallback if llama-4-scout-17b-16e-instruct is not available/configured
    GROQ_VISION_MODEL: str = os.getenv("GROQ_VISION_MODEL", "meta-llama/llama-4-scout-17b-16e-instruct")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    # Provider setting (e.g. "groq", "gemini", "openai")
    # Defaulting to groq since it's the primary provider in original codebase
    PRIMARY_LLM_PROVIDER: str = os.getenv("PRIMARY_LLM_PROVIDER", "groq").lower()

settings = Settings()

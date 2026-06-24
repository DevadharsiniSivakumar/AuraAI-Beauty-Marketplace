import json
import logging
from typing import Dict, Any, Optional
from utils.llm_provider import LLMProviderService
from utils.config import settings
from models.profile import BeautyProfile

logger = logging.getLogger("beauty_profile_service")

# Pre-curated, premium luxury beauty profiles for simulated fallbacks
CURATED_PROFILES = [
    {
        "faceShape": "Oval",
        "hairType": "2C Wavy",
        "hairDensity": "High",
        "skinTone": "Warm Honey / Olive",
        "undertone": "Warm",
        "hairLength": "Medium",
        "beautySummary": "Your oval face shape features balanced proportions and symmetrical cheekbones, perfect for versatile styling. Your natural 2C wave pattern adds elegant texture, while your warm honey/olive skin tone radiates an active, sun-kissed healthy glow.",
        "recommendedHairstyles": [
            "Soft Shag Cut with Curtain Bangs",
            "Long Layered Beach Waves",
            "Voluminous Textured Blowout"
        ],
        "recommendedTreatments": [
            "Advanced Hydra Facial",
            "Kérastase Fusio-Dose Ritual",
            "Tea Tree Scalp Detox"
        ],
        "recommendedMakeupStyles": [
            "Sun-kissed Golden Glow Makeup",
            "Soft Bronze Smokey Eye with Nude Lips",
            "Monochromatic Peach Dewy Look"
        ]
    },
    {
        "faceShape": "Round",
        "hairType": "3B Curly",
        "hairDensity": "Medium",
        "skinTone": "Fair / Cool Pink",
        "undertone": "Cool",
        "hairLength": "Long",
        "beautySummary": "Your round contour is soft and youthful with uniform dimensions. Your voluminous 3B curls frame your face with striking texture and definition, while your fair, cool pink skin tone boasts natural clarity and a delicate rosy luminance.",
        "recommendedHairstyles": [
            "DevaCut Layered Ringlets",
            "Side-Swept Curly Lob",
            "Voluminous Curly Half-Up Style"
        ],
        "recommendedTreatments": [
            "Rose Gold Shimmer Facial",
            "Olaplex Hair Repair Treatment",
            "Intense Hydration Hair Spa"
        ],
        "recommendedMakeupStyles": [
            "Cool Berry Flush Makeup",
            "Classic Winged Eyeliner with Cool Red Lips",
            "Minimalist Pastel Pink Glow"
        ]
    },
    {
        "faceShape": "Heart",
        "hairType": "1A Straight",
        "hairDensity": "High",
        "skinTone": "Deep Bronze",
        "undertone": "Neutral",
        "hairLength": "Short",
        "beautySummary": "Your heart face shape features high, defined cheekbones tapering to a graceful chin. Your sleek 1A straight hair texture offers high natural shine and clean lines, while your deep bronze skin tone radiates warmth, high cellular vitality, and rich undertones.",
        "recommendedHairstyles": [
            "Textured Bob with Whispy Fringe",
            "Asymmetrical Sleek Lob",
            "Face-Framing Tapered Pixie"
        ],
        "recommendedTreatments": [
            "O2 Brightening Skin Facial",
            "Keratin Smoothing Treatment",
            "Brightening Acid Peel"
        ],
        "recommendedMakeupStyles": [
            "Monochromatic Terracotta Makeup",
            "Warm Golden Eye with Glossy Lips",
            "Clean Satin Skin with Coral Cheek Flush"
        ]
    }
]

class BeautyProfileService:
    @classmethod
    def get_fallback_profile(cls, index_val: int) -> BeautyProfile:
        idx = index_val % len(CURATED_PROFILES)
        data = CURATED_PROFILES[idx]
        return BeautyProfile(
            faceShape=data["faceShape"],
            hairType=data["hairType"],
            hairDensity=data["hairDensity"],
            skinTone=data["skinTone"],
            undertone=data["undertone"],
            hairLength=data.get("hairLength", "Medium"),
            beautySummary=data["beautySummary"],
            recommendedHairstyles=data["recommendedHairstyles"],
            recommendedTreatments=data["recommendedTreatments"],
            recommendedMakeupStyles=data["recommendedMakeupStyles"]
        )

    @classmethod
    async def analyze_selfie(cls, base64_image: str) -> BeautyProfile:
        has_api_keys = bool(
            settings.GROQ_API_KEY or 
            settings.GEMINI_API_KEY or 
            settings.OPENAI_API_KEY
        )

        prompt = (
            "You are a professional dermatological and hair care AI vision engine.\n"
            "Analyze the uploaded selfie image and extract:\n"
            "1. Face Shape (e.g. Oval, Round, Square, Heart, Oblong, Diamond)\n"
            "2. Hair Type (e.g. 1A Straight, 2C Wavy, 3B Curly, 4C Coily)\n"
            "3. Hair Density (e.g. Low, Medium, High)\n"
            "4. Skin Tone (e.g. Fair, Medium, Olive, Deep, Bronze)\n"
            "5. Skin Undertone (e.g. Cool, Warm, Neutral)\n"
            "6. Beauty Profile Summary (An elegant 2-3 sentence luxury beauty description outlining features. Keep it positive and professional.)\n"
            "7. Recommended Hairstyles (An array of exactly 3 suitable hairstyles)\n"
            "8. Recommended Treatments (An array of exactly 3 suitable skin or hair salon treatments, e.g. Hydra Facial, Keratin Treatment, Hair Spa)\n"
            "9. Recommended Makeup Styles (An array of exactly 3 suitable makeup styling/color suggestions)\n\n"
            "CRITICAL IMAGE VALIDATION RULES:\n"
            "Before returning analysis results, perform these checks:\n"
            "- Verify that there is EXACTLY ONE human face clearly visible in the image.\n"
            "- If there are zero faces, multiple faces, if the image is extremely blurry, or if the upload is not a human portrait, you must return a JSON response with ONLY an \"error\" field explaining the issue (e.g., {\"error\": \"No face detected in the image. Please upload a clear selfie.\"} or {\"error\": \"Multiple faces detected. Please upload a portrait with only one face.\"}).\n\n"
            "You MUST respond with a single, valid JSON object. Do not wrap the JSON in markdown code blocks like ```json.\n"
            "Your JSON response MUST follow this exact structure:\n"
            "{\n"
            "  \"faceShape\": \"Oval\",\n"
            "  \"hairType\": \"2C Wavy\",\n"
            "  \"hairDensity\": \"Medium\",\n"
            "  \"skinTone\": \"Fair\",\n"
            "  \"undertone\": \"Neutral\",\n"
            "  \"beautySummary\": \"A description of the user's features...\",\n"
            "  \"recommendedHairstyles\": [\"Hairstyle A\", \"Hairstyle B\", \"Hairstyle C\"],\n"
            "  \"recommendedTreatments\": [\"Treatment A\", \"Treatment B\", \"Treatment C\"],\n"
            "  \"recommendedMakeupStyles\": [\"Makeup A\", \"Makeup B\", \"Makeup C\"]\n"
            "}"
        )

        if has_api_keys:
            try:
                raw_response = await LLMProviderService.analyze_image(base64_image, prompt)
                cleaned = raw_response.strip()
                
                # Remove markdown code block formats if present
                if cleaned.startswith("```"):
                    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
                
                data = json.loads(cleaned)
                
                if "error" in data:
                    return BeautyProfile(
                        faceShape="Unknown",
                        hairType="Unknown",
                        hairDensity="Unknown",
                        skinTone="Unknown",
                        undertone="Unknown",
                        beautySummary="Analysis failed.",
                        recommendedHairstyles=[],
                        recommendedTreatments=[],
                        recommendedMakeupStyles=[],
                        error=data["error"]
                    )
                
                return BeautyProfile(
                    faceShape=data.get("faceShape", "Oval"),
                    hairType=data.get("hairType", "2C Wavy"),
                    hairDensity=data.get("hairDensity", "Medium"),
                    skinTone=data.get("skinTone", "Fair"),
                    undertone=data.get("undertone", "Neutral"),
                    hairLength=data.get("hairLength", "Medium"),
                    beautySummary=data.get("beautySummary", ""),
                    recommendedHairstyles=data.get("recommendedHairstyles", []),
                    recommendedTreatments=data.get("recommendedTreatments", []),
                    recommendedMakeupStyles=data.get("recommendedMakeupStyles", [])
                )
            except Exception as e:
                logger.error(f"Error invoking vision analyzer, falling back to curated simulation: {e}")
                return cls.get_fallback_profile(len(base64_image))
        else:
            logger.warning("No vision API keys found. Operating in simulated fallback mode.")
            return cls.get_fallback_profile(len(base64_image))

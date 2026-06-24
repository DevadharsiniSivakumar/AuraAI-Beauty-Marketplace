import re
import json
import logging
from datetime import datetime
from typing import Dict, Any, List, Optional
from utils.llm_provider import LLMProviderService
from utils.config import settings
from services.recommendation_service import RecommendationService
from services.memory_service import MemoryService
from models.user import UserMemory
from models.profile import BeautyProfile

logger = logging.getLogger("concierge_service")

# Localities mapped to patterns for rule-based parsing
LOCALITIES = [
    {"name": "Indiranagar", "patterns": ["indiranagar", "indira nagar"]},
    {"name": "Koramangala", "patterns": ["koramangala", "kora mangala"]},
    {"name": "Vittal Mallya Rd", "patterns": ["vittal mallya", "vittal mallya road", "vittal mallya rd", "ub city"]},
    {"name": "Jayanagar", "patterns": ["jayanagar", "jaya nagar"]},
    {"name": "HSR Layout", "patterns": ["hsr", "hsr layout"]},
    {"name": "Lavelle Road", "patterns": ["lavelle", "lavelle road"]}
]

SALONS = [
    {"id": "bodycraft-indiranagar", "patterns": ["bodycraft"]},
    {"id": "play-salon-vittal-mallya", "patterns": ["play salon", "play"]},
    {"id": "bounce-salon-koramangala", "patterns": ["bounce"]},
    {"id": "ylg-salon-hsr", "patterns": ["ylg", "you look great"]},
    {"id": "mirror-within-lavelle", "patterns": ["mirror & within", "mirror and within", "mirror within"]}
]

KEYWORD_MAP = ["facial", "hair", "nail", "massage", "spa", "cut", "styling", "balayage", "waxing", "treatment", "grooming", "makeup", "pedicure", "manicure"]

class ConciergeService:
    @staticmethod
    def detect_intent(query: str) -> Dict[str, Any]:
        """
        Rule-based intent classifier. Matches intentDetector.ts.
        """
        text = query.lower().strip()

        # 1. Price constraints
        max_price = None
        price_match = re.search(r"(?:under|below|less\s+than|budget\s+of|within)\s*(?:rs\.?|₹)?\s*(\d+)", text, re.IGNORECASE)
        if price_match:
            max_price = int(price_match.group(1))

        # 2. Localities
        locality = None
        for loc in LOCALITIES:
            if any(p in text for p in loc["patterns"]):
                locality = loc["name"]
                break

        # 3. Segments
        is_luxury = any(x in text for x in ["luxury", "premium", "high-end", "elite", "exclusive"])
        offers_home_service = any(x in text for x in ["home service", "at home", "home visit", "doorstep", "in-house"])

        # 4. Service keywords
        service_keywords = [kw for kw in KEYWORD_MAP if kw in text]

        # 5. Salons
        queried_salons = []
        for sal in SALONS:
            if any(p in text for p in sal["patterns"]):
                queried_salons.append(sal["id"])

        # 6. Classify Intent
        intent = "general_query"
        has_vs = "compare" in text or "versus" in text or " vs " in text or "difference between" in text
        
        if has_vs or len(queried_salons) >= 2:
            intent = "salon_comparison"
        elif any(x in text for x in ["book", "appointment", "schedule", "cancel", "reserve", "visit"]):
            intent = "booking_help"
        elif any(x in text for x in ["wedding", "marriage", "event", "party", "plan", "bridal", "bride"]):
            intent = "beauty_planning"
        elif any(x in text for x in ["hairstyle", "suit", "face shape", "skin tone", "look good", "haircut", "style", "contour", "melanin"]):
            intent = "style_advice"
        elif service_keywords and (max_price is not None or any(x in text for x in ["price", "cost", "charge", "rate", "fee"])):
            intent = "service_search"
        elif any(x in text for x in ["salon", "place", "outlet"]) or locality is not None or is_luxury:
            intent = "salon_search"
        elif service_keywords:
            intent = "service_search"

        return {
            "intent": intent,
            "locality": locality,
            "maxPrice": max_price,
            "isLuxury": is_luxury,
            "offersHomeService": offers_home_service,
            "serviceKeywords": service_keywords,
            "queriedSalons": queried_salons
        }

    @staticmethod
    def get_luxury_system_prompt(user_name: str, intent: str, memory_context: Optional[str] = None) -> str:
        memory_section = f"\n\nClient Preference & Booking History Memory Profile:\n{memory_context}\n" if memory_context else ""
        return (
            f"You are Aura, the premium AI Beauty & Wellness Advisor for AuraAI, consulting for the client {user_name}.\n"
            f"Your tone is sophisticated, welcoming, expert, pleasing, and aligned with high-end luxury wellness brands (e.g., Vogue, Kérastase).\n"
            f"Current active consultation context: {intent}.{memory_section}\n\n"
            "Core Guidelines:\n"
            "1. Intelligent Beauty Consultant First: Prioritize helpful, education-focused beauty advice, style planning, skincare guidance, and haircare consultation. Avoid acting like a basic search query index.\n"
            "2. Personalization Integration: Using the memory profile (if provided), naturally reference past history (e.g., \"Based on your previous bookings...\", \"Since you highly rated...\", \"You usually prefer...\", \"Considering your typical budget range...\") and physical beauty profile characteristics (such as face shape, hair type, skin tone, skin undertone, hair density, and hair length) to tailor your advice. For styling, haircare, and skin care queries, you MUST explicitly customize suggestions based on their face shape, hair type, skin undertone, and hair density (e.g., 'Based on your oval face shape, warm undertone, wavy hair type, and high hair density, I recommend...').\n"
            "3. Science-Based Accuracy: Provide accurate, dermatologically and trichologically sound information based on active ingredients (e.g., active acids, niacinamide, vitamins, retinoids), hair type, and skin tone. Strictly avoid spreading unscientific statements, fearmongering, or common beauty myths.\n"
            "4. Explain Curated Options: If structured salon or service recommendations are provided to you, explain why they fit the query, budget, locality, or beauty profile. Do NOT mention salons/services that are not in the provided recommendation list.\n"
            "5. Guidance-Only Behavior: If no structured recommendations are supplied, focus entirely on giving expert advice, planning, or style guidance. Do not try to invent or mock recommendations. Keep the response natural, conversational, and highly helpful.\n"
            "6. Presentation: Keep responses concise, precise, and visually clean. Use double line breaks for paragraph separation and gentle bullet points for readability. Never output raw markdown blocks.\n"
            "7. Home Remedies vs. Salon Transition: For any client query asking about advice, styling, skin concerns, hair issues, event preparation, or beauty treatments, your response MUST follow this exact sequence:\n"
            "   - First, validate their request and detail safe, natural, and helpful home remedies or DIY alternatives (e.g. honey, oatmeal, coconut oil, aloe vera).\n"
            "   - Second, gently and pleasingly explain the limitations or challenges of doing it at home (e.g. lack of professional-grade extraction tools, risk of skin barrier damage/infection, lower efficacy, or lack of specialist equipment).\n"
            "   - Third, convincingly suggest relevant professional salon treatments from the provided matches/catalog (especially doorstep home services if listed), explaining why they are a superior, stress-free, and safe alternative.\n"
            "Ensure all your replies are convincing, pleasing, and highly relevant to the query."
        )

    @classmethod
    async def explain_recommendations(
        cls,
        user_name: str,
        user_query: str,
        intent: str,
        recommendations: List[Any],
        memory_context: Optional[str] = None
    ) -> str:
        has_api_key = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)
        if not has_api_key:
            return cls.generate_local_explanation(user_name, intent, recommendations, memory_context, user_query)

        system_prompt = cls.get_luxury_system_prompt(user_name, intent, memory_context)

        recs_text_list = []
        for idx, rec in enumerate(recommendations):
            # recommendations could be Pydantic models or dicts
            rec_dict = rec.model_dump() if hasattr(rec, "model_dump") else rec
            rec_type = rec_dict.get("type")
            rec_name = rec_dict.get("name")
            rec_reasons = rec_dict.get("reasons", [])
            
            if rec_type == "service":
                rec_price = rec_dict.get("price")
                rec_details = rec_dict.get("details")
                recs_text_list.append(
                    f"{idx + 1}. Service: \"{rec_name}\" at Salon: \"{rec_details}\"\n"
                    f"   Price: ₹{rec_price} | Locality: {rec_details}\n"
                    f"   Why recommended: {', '.join(rec_reasons)}"
                )
            else:
                rec_details = rec_dict.get("details")
                rec_score = rec_dict.get("matchScore")
                recs_text_list.append(
                    f"{idx + 1}. Salon: \"{rec_name}\"\n"
                    f"   Locality: {rec_details} | Match score: {rec_score}%\n"
                    f"   Why recommended: {', '.join(rec_reasons)}"
                )

        recommendations_text = "\n\n".join(recs_text_list) if recs_text_list else "None. No salon or service matches were requested or found."

        if recs_text_list:
            user_prompt = (
                f"Client Query: \"{user_query}\"\n"
                f"Detected Intent: \"{intent}\"\n\n"
                f"Structured Matches Found:\n"
                f"{recommendations_text}\n\n"
                f"Aura, please explain these recommendations to the client, explaining why they match their profile or search query."
            )
        else:
            user_prompt = (
                f"Client Query: \"{user_query}\"\n"
                f"Detected Intent: \"{intent}\"\n\n"
                f"No matching recommendations were requested or provided.\n"
                f"Aura, please answer the client's query directly as an expert beauty consultant. Provide scientific, helpful guidance, education, or style tips as appropriate, without recommending specific salons."
            )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            return await LLMProviderService.generate_chat_response(messages)
        except Exception as e:
            logger.error(f"Error in LLM explain recommendations, using local narrative: {e}")
            return cls.generate_local_explanation(user_name, intent, recommendations, memory_context, user_query)

    # --- SALON COMPARISON GENERATOR ---

    @classmethod
    async def compare_salons(cls, query: str, target_salons: List[Dict[str, Any]], memory_context: Optional[str] = None) -> Dict[str, Any]:
        """
        Creates comparison structured JSON by summarizing reviews.
        """
        metrics = RecommendationService.generate_comparison_metrics(target_salons)
        has_api_key = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)

        if has_api_key:
            system_prompt = (
                "You are Aura, the expert Beauty & Wellness Advisor.\n"
                "Your task is to compare the provided salons based on the user's query, their personal preferences, and the calculated review metrics.\n"
                "You MUST respond with a single valid JSON object. Do not include any other text, markdown wrapper (like ```json), or conversational preamble.\n\n"
                "The JSON object must match this exact schema:\n"
                "{\n"
                "  \"feature1Comparison\": [\n"
                "    {\n"
                "      \"salonName\": string,\n"
                "      \"rating\": number,\n"
                "      \"priceRange\": string,\n"
                "      \"reviewScore\": string,\n"
                "      \"popularServices\": string[],\n"
                "      \"aiRecommendationBadge\": string // Short phrase, e.g., \"Best for Skincare\", \"Budget Friendly\", \"Premium Luxury\"\n"
                "    }\n"
                "  ],\n"
                "  \"feature2ReviewIntelligence\": [\n"
                "    {\n"
                "      \"salonName\": string,\n"
                "      \"overallSentiment\": \"Positive\" | \"Neutral\" | \"Negative\",\n"
                "      \"topStrengths\": string[],\n"
                "      \"commonComplaints\": string[],\n"
                "      \"mostMentionedServices\": string[]\n"
                "    }\n"
                "  ],\n"
                "  \"recommendation\": {\n"
                "    \"recommendedSalonName\": string,\n"
                "    \"reasonText\": string\n"
                "  }\n"
                "}\n\n"
                "Guidelines:\n"
                "1. \"feature1Comparison\" should summarize the analytical metrics. \"reviewScore\" can be a qualitative statement like \"Excellent (95% Positive)\".\n"
                "2. \"feature2ReviewIntelligence\" should synthesize the customer feedback based on the sentiment indicators and top services provided.\n"
                "3. The final \"recommendation\" must explicitly pick ONE salon from the list that best matches the user's query and their memory preferences (if provided). The \"reasonText\" should clearly explain why it was chosen."
            )

            user_prompt = (
                f"Client Query: \"{query}\"\n\n"
                f"Analytics Metrics:\n"
                f"{json.dumps(metrics, indent=2)}\n\n"
                f"{f'Client Memory Context: {memory_context}' if memory_context else ''}\n\n"
                f"Please generate the structured comparison JSON based on the metrics."
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            try:
                raw_response = await LLMProviderService.generate_chat_response(
                    messages, response_format="json_object", max_tokens=2500
                )
                cleaned = raw_response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
                return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Error in LLM salon comparison: {e}")
                return cls.generate_local_comparison_fallback(target_salons, query)
        else:
            return cls.generate_local_comparison_fallback(target_salons, query)

    # --- BEAUTY JOURNEY GENERATOR ---

    @classmethod
    async def generate_journey_plan(
        cls,
        user_goal: str,
        user_name: str,
        memory_context: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates a beauty journey structured plan matching the goal.
        """
        has_api_key = bool(settings.GROQ_API_KEY or settings.GEMINI_API_KEY or settings.OPENAI_API_KEY)

        if has_api_key:
            system_prompt = (
                "You are Aura, the expert Beauty & Wellness Journey Planner.\n"
                "Your task is to create a structured, scientific, and highly personalized beauty timeline based on the user's goal.\n"
                "You MUST respond with a single valid JSON object. Do not include any other text, markdown wrapper (like ```json), or conversational preamble.\n\n"
                "The JSON object must match this schema:\n"
                "{\n"
                "  \"journeyType\": \"Bridal\" | \"Event Prep\" | \"Vacation Glow-Up\" | \"Hair Recovery\" | \"Skin Recovery\" | \"Maintenance\",\n"
                "  \"durationDays\": number,\n"
                "  \"steps\": [\n"
                "    {\n"
                "      \"stepNumber\": number,\n"
                "      \"title\": string,\n"
                "      \"description\": string,\n"
                "      \"timeline\": string,\n"
                "      \"recommendedService\": string\n"
                "    }\n"
                "  ]\n"
                "}\n\n"
                "Guidelines:\n"
                "1. Journey type should be one of the listed values. Pick the best match.\n"
                "2. Formulate 3 to 6 logical chronological steps.\n"
                "3. Steps should outline specific treatments or procedures, detailing the scientific reason or expert advice in \"description\".\n"
                "4. Recommended services should be generic, premium wellness service names that are searchable (e.g. \"Advanced Hydra Facial\", \"Hair Spa\", \"Pedicure\", \"Balayage Hair Color\", etc.).\n"
                "5. Incorporate user memory context (preferred categories, budget level, or skin/hair preferences) if provided."
            )

            user_prompt = (
                f"Client: {user_name}\n"
                f"Goal: \"{user_goal}\"\n"
                f"{f'Memory Context: {memory_context}' if memory_context else ''}"
            )

            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ]

            try:
                raw_response = await LLMProviderService.generate_chat_response(
                    messages, response_format="json_object", max_tokens=1500
                )
                cleaned = raw_response.strip()
                if cleaned.startswith("```"):
                    cleaned = cleaned.replace("```json", "").replace("```", "").strip()
                return json.loads(cleaned)
            except Exception as e:
                logger.error(f"Error in LLM journey generation, falling back: {e}")
                return cls.generate_local_journey_fallback(user_goal)
        else:
            return cls.generate_local_journey_fallback(user_goal)

    # --- FALLBACK AND NARRATIVE GENERATORS ---

    @staticmethod
    def generate_local_comparison_fallback(salons_to_compare: List[Dict[str, Any]], query_text: str) -> Dict[str, Any]:
        feature1 = []
        feature2 = []

        for salon in salons_to_compare:
            services = salon.get("services", [])
            prices = [float(s.get("price", 0)) for s in services]
            start_price = min(prices) if prices else 1500

            feature1.append({
                "salonName": salon.get("name"),
                "rating": salon.get("rating", 5.0),
                "priceRange": f"Starts at ₹{int(start_price)}",
                "reviewScore": f"Excellent ({int(salon.get('rating', 5.0) * 20)}% Positive)",
                "popularServices": [s.get("name") for s in services[:3]] if services else ["Facial", "Haircut"],
                "aiRecommendationBadge": "Top Rated" if salon.get("rating", 5.0) >= 4.8 else "Highly Recommended"
            })

            feature2.append({
                "salonName": salon.get("name"),
                "overallSentiment": "Positive" if salon.get("rating", 5.0) >= 4.7 else "Neutral",
                "topStrengths": salon.get("aiReviewSummary", {}).get("pros", ["Professional staff"])[:3],
                "commonComplaints": salon.get("aiReviewSummary", {}).get("cons", ["Weekend waiting times"])[:1],
                "mostMentionedServices": [s.get("name") for s in services[:2]] if services else ["Facial"]
            })

        sorted_salons = sorted(salons_to_compare, key=lambda x: x.get("rating", 5.0), reverse=True)
        recommended = sorted_salons[0] if sorted_salons else {"name": "Bodycraft Salon & Spa", "rating": 4.8}

        return {
            "feature1Comparison": feature1,
            "feature2ReviewIntelligence": feature2,
            "recommendation": {
                "recommendedSalonName": recommended.get("name"),
                "reasonText": f"Based on your request \"{query_text}\" and analysis of reviews, {recommended.get('name')} is highly recommended with a rating of {recommended.get('rating')}★."
            }
        }

    @staticmethod
    def generate_local_journey_fallback(user_goal: str) -> Dict[str, Any]:
        goal_lower = user_goal.lower()

        if any(x in goal_lower for x in ["wed", "marri", "brid", "groom"]):
            return {
                "journeyType": "Bridal",
                "durationDays": 45,
                "steps": [
                    {"stepNumber": 1, "title": "Initial Consultation & Detox", "description": "Evaluate skin barrier and hair porosity. Calming hair treatment.", "timeline": "Day 45 (6 Weeks Out)", "recommendedService": "Advanced Hydra Facial"},
                    {"stepNumber": 2, "title": "Deep Exfoliation & Nourishment", "description": "Focus on skin brightening and hair strand repair.", "timeline": "Day 30 (4 Weeks Out)", "recommendedService": "Olaplex Hair Treatment"},
                    {"stepNumber": 3, "title": "Rejuvenation & Care", "description": "Soften hands and feet. Locking in shine.", "timeline": "Day 15 (2 Weeks Out)", "recommendedService": "Manicure & Pedicure"},
                    {"stepNumber": 4, "title": "The Final Bridal Glow", "description": "Gentle hydrating facial mask to prep for perfect makeup.", "timeline": "Day 3 (3 Days Out)", "recommendedService": "Rose Gold Shimmer Facial"}
                ]
            }

        if any(x in goal_lower for x in ["part", "event", "week", "birthday"]):
            return {
                "journeyType": "Event Prep",
                "durationDays": 7,
                "steps": [
                    {"stepNumber": 1, "title": "Deep Cleansing & Exfoliation", "description": "Clear the skin canvas of impurities.", "timeline": "Day 7 (1 Week Out)", "recommendedService": "Advanced Hydra Facial"},
                    {"stepNumber": 2, "title": "Hair Rehydration & Styling Prep", "description": "Steam-hydrate hair fibers for volume.", "timeline": "Day 3 (3 Days Out)", "recommendedService": "Hair Spa"},
                    {"stepNumber": 3, "title": "Manicure & Pedicure Grooming", "description": "Clean, shape and paint nails.", "timeline": "Day 1 (1 Day Out)", "recommendedService": "Manicure & Pedicure"}
                ]
            }

        if any(x in goal_lower for x in ["vacation", "trip", "travel", "beach", "holiday"]):
            return {
                "journeyType": "Vacation Glow-Up",
                "durationDays": 14,
                "steps": [
                    {"stepNumber": 1, "title": "Hydration Barrier Defense", "description": "Prep skin for climate changes.", "timeline": "14 Days Out", "recommendedService": "Advanced Hydra Facial"},
                    {"stepNumber": 2, "title": "Smooth & Glow Exfoliation", "description": "Full body scrub and waxing.", "timeline": "7 Days Out", "recommendedService": "Deep Tissue Massage"},
                    {"stepNumber": 3, "title": "Fresh Trim & Color Refresh", "description": "Trim ends and color shine gloss.", "timeline": "2 Days Out", "recommendedService": "Hair Color & Blow Dry"}
                ]
            }

        if any(x in goal_lower for x in ["hair", "scalp", "dandruff", "damage"]):
            return {
                "journeyType": "Hair Recovery",
                "durationDays": 30,
                "steps": [
                    {"stepNumber": 1, "title": "Scalp Exfoliation & Detox", "description": "Clear hair follicles of styling buildup.", "timeline": "Week 1", "recommendedService": "Hair Spa"},
                    {"stepNumber": 2, "title": "Internal Bond Restoration", "description": "Apply active bond rebuilding treatments.", "timeline": "Week 2", "recommendedService": "Olaplex Hair Treatment"},
                    {"stepNumber": 3, "title": "Cuticle Scaling & Shine Seal", "description": "Keratin treatment to lock in moisture.", "timeline": "Week 4", "recommendedService": "Keratin Hair Treatment"}
                ]
            }

        if any(x in goal_lower for x in ["skin", "glow", "acne", "face", "facial", "pigment"]):
            return {
                "journeyType": "Skin Recovery",
                "durationDays": 30,
                "steps": [
                    {"stepNumber": 1, "title": "Exfoliate & Resurface", "description": "Exfoliate dead surface cells with enzymes.", "timeline": "Week 1", "recommendedService": "Advanced Hydra Facial"},
                    {"stepNumber": 2, "title": "Deep Skin Barrier Nourishment", "description": "Rebuild lipids using vitamin infusions.", "timeline": "Week 2", "recommendedService": "Rose Gold Shimmer Facial"},
                    {"stepNumber": 3, "title": "Maintenance & Glow Seal", "description": "Protect the glow. Hyaluronic acid booster.", "timeline": "Week 4", "recommendedService": "Advanced Hydra Facial"}
                ]
            }

        # Default Maintenance
        return {
            "journeyType": "Maintenance",
            "durationDays": 30,
            "steps": [
                {"stepNumber": 1, "title": "Monthly Skincare Reset", "description": "Deep cleanse and hydrate skin.", "timeline": "Week 1", "recommendedService": "Advanced Hydra Facial"},
                {"stepNumber": 2, "title": "Stress Relief & Drainage", "description": "Relieve muscle tightness in shoulder.", "timeline": "Week 2", "recommendedService": "Deep Tissue Massage"},
                {"stepNumber": 3, "title": "Hand & Foot Grooming", "description": "Moisturize cuticles and trim nails.", "timeline": "Week 4", "recommendedService": "Manicure & Pedicure"}
            ]
        }

    @classmethod
    def generate_local_explanation(
        cls,
        user_name: str,
        intent: str,
        recommendations: List[Any],
        memory_context: Optional[str] = None,
        user_query: Optional[str] = None
    ) -> str:
        name_first = user_name.split(" ")[0]
        lower_query = user_query.lower().strip() if user_query else ""

        is_greeting = any(x == lower_query or f"{x} " in lower_query for x in ["hello", "hi", "hey"])
        is_info = any(x in lower_query for x in ["how do you work", "what can you do", "who are you"])

        if is_greeting:
            return (
                f"Hello {name_first}! I'm Aura, your personal AI Beauty & Wellness Concierge. "
                "How can I assist you with your beauty journey today? I can guide you on hairstyles, "
                "suggest skincare routines tailored to your profile, or help you find the best luxury salons."
            )
        if is_info:
            return (
                f"Hello {name_first}! I am Aura, your sophisticated AI Beauty Advisor. "
                "I analyze your unique Beauty Profile (such as your face shape, hair type, and skin tone) "
                "to recommend the most optimal treatments. I also scan premium wellness salons to match "
                "your budget and locality preferences."
            )

        category = "general"
        if any(x in lower_query for x in ["hair", "scalp", "cut", "dandruff", "frizz", "bald", "fall", "styling", "shag", "wave", "curl", "colour", "color"]):
            category = "hair"
        elif any(x in lower_query for x in ["skin", "acne", "glow", "facial", "tan", "blackhead", "pore", "peel", "face", "undertone"]):
            category = "skin"
        elif any(x in lower_query for x in ["wed", "marri", "brid", "groom", "event", "party"]):
            category = "wedding"

        # Build personalization block
        personalization = ""
        # Try to parse beauty profile out of memory context if it exists
        if memory_context:
            # Simple substring extracts
            bp_details = {}
            for line in memory_context.split("\n"):
                if "Face Shape:" in line:
                    bp_details["faceShape"] = line.split("Face Shape:")[1].strip()
                if "Hair Type:" in line:
                    bp_details["hairType"] = line.split("Hair Type:")[1].strip()
                if "Skin Tone:" in line:
                    bp_details["skinTone"] = line.split("Skin Tone:")[1].strip()

            if bp_details.get("faceShape") or bp_details.get("hairType"):
                face = bp_details.get("faceShape", "oval").lower()
                hair = bp_details.get("hairType", "wavy").lower()
                personalization += f"Considering your {face} face contour and {hair} hair type, "
            elif "average budget" in memory_context.lower():
                personalization += "Based on your typical budget range, "

        # Remedy logic
        if category == "hair":
            remedy = "You can certainly try some gentle, natural DIY alternatives at home to soothe your hair and scalp. Applying a lukewarm mask of organic coconut oil blended with argan oil works well to coat the hair shaft, while a paste of fresh aloe vera gel and unsweetened yogurt can help calm scalp dryness and smoothen cuticle flyaways."
            challenges = "However, achieving deep structural repair (like restructuring split bonds), professional moisture replenishment, or precision styling at home is incredibly challenging. Without professional-grade bond builders, specialized steam rehydration hoods, and the experienced technique of a master stylist, home-based DIY treatments often result in heavy product buildup, scalp clogging, or uneven hair texture rather than structural rejuvenation."
            heading = "To give your hair the safe, expert rehydration and care it needs, I highly recommend exploring professional treatments:"
        elif category == "skin":
            remedy = "You can start with some safe, calming home remedies to support your skin's surface. Applying a thin layer of raw honey combined with organic yogurt is excellent for light hydration and soothing minor redness, while a cool, finely ground oatmeal compress can help calm skin irritation."
            challenges = "However, performing professional-grade facials, deep pore extractions, or advanced exfoliation at home is difficult and carries significant risks. Without specialized clinical tools like vortex suction, sterile extraction loops, and professional-strength active serums, DIY attempts can lead to skin barrier disruption, increased bacterial spread, acne inflammation, or even permanent micro-tearing of the skin tissue."
            heading = "To achieve a deep, safe, and truly radiant transformation for your skin, professional care is the safest and most effective path:"
        elif category == "wedding":
            remedy = "For wedding or event preparation, you can begin with gentle home care. Consuming plenty of water, performing light herbal steam inhalation, and using mild, home-made nourishing face packs (like chickpea flour and turmeric) are great ways to keep your skin naturally refreshed in the weeks leading up to the event."
            challenges = "However, achieving flawless all-day makeup longevity, perfect high-definition contouring, and advanced hairstyling that holds under professional event lighting is extremely difficult to do on your own at home. Professional-grade styling requires calibrated HD airbrushing, specialist primers, lighting-adjusted color matching, and meticulous bridal artistry that standard over-the-counter cosmetics simply cannot replicate."
            heading = "To ensure you look absolutely radiant and stress-free on your special day, relying on professional stylist support is highly recommended:"
        else:
            remedy = "You can start with natural, home-based self-care routines. Maintaining a consistent gentle cleansing routine, keeping your skin and hair well-moisturized with pure aloe vera, and protecting your skin barrier are wonderful daily habits to keep yourself glowing."
            challenges = "However, standard over-the-counter home care lacks the targeted strength and clinical customization required to address deep beauty goals. Without professional diagnosis, high-efficacy concentrated serums, and custom wellness equipment, generic at-home routines are often slow to show results and cannot be calibrated to your exact physical beauty profile characteristics."
            heading = "For optimal, personalized results that are scientifically tailored to your exact profile, professional salon consultations are exceptionally effective:"

        # Format recommendations list
        recs_text = ""
        if recommendations:
            recs_list = []
            for rec in recommendations:
                rec_dict = rec.model_dump() if hasattr(rec, "model_dump") else rec
                rec_type = rec_dict.get("type")
                rec_name = rec_dict.get("name")
                rec_details = rec_dict.get("details", "")
                rec_price = rec_dict.get("price")
                rec_score = rec_dict.get("matchScore")
                rec_reasons = rec_dict.get("reasons", [])

                if rec_type == "service":
                    recs_list.append(f"• **{rec_name}** at *{rec_details}* (₹{rec_price}): Matches because it is {' & '.join(rec_reasons).lower()}.")
                else:
                    recs_list.append(f"• **{rec_name}** in *{rec_details}* ({rec_score}% match): Matches because it offers {' & '.join(rec_reasons).lower()}.")
            recs_text = "\n".join(recs_list)
            recs_text += "\n\nDid you know? Outlets like **Bodycraft Salon & Spa** also offer premium doorstep home services, allowing you to enjoy elite salon treatments in the comfort and privacy of your own home!"
        else:
            if category == "hair":
                recs_text = "I suggest looking into professional salon treatments like a Kérastase deep conditioning ritual, a scalp recovery spa, or custom styling at top-rated outlets like **Bounce Salon** or **Play Salon**."
            elif category == "skin":
                recs_text = "I recommend considering professional treatments like an Advanced Hydra Facial, a deep cleansing clean-up, or a skin barrier therapy at wellness clinics like **Bodycraft Salon & Spa** or **Mirror & Within**."
            elif category == "wedding":
                recs_text = "I recommend booking a professional bridal/groom trial or scheduling event styling packages at premium outlets like **Play Salon Vittal Mallya** or **Bodycraft Indiranagar** for a flawless look."
            else:
                recs_text = "I suggest exploring top-rated salons near Koramangala or Indiranagar where expert estheticians can design a customized regimen just for you."

        personalization_str = f"*{personalization.strip()}*\n\n" if personalization else ""
        body = f"{personalization_str}{remedy}\n\n{challenges}\n\n{heading}\n\n{recs_text}"

        return (
            f"Hello {name_first}!\n\n"
            f"{body}\n\n"
            "Please let me know if you would like me to help you compare these salons, check prices, or schedule an online booking!"
        )

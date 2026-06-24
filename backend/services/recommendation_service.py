import math
from typing import List, Dict, Any, Optional
from utils.mock_data import MOCK_SALONS
from models.recommendation import RecommendationResult

class RecommendationService:
    @staticmethod
    async def get_salons_and_services() -> List[Dict[str, Any]]:
        # In a fully deployed version, this could fetch from Firestore
        # For now, it returns MOCK_SALONS to maintain 100% compatibility
        return MOCK_SALONS

    @classmethod
    async def search_and_rank(
        cls,
        parsed_query: Dict[str, Any],
        user_profile: Dict[str, Any],
        user_bookings: List[Dict[str, Any]] = None
    ) -> List[RecommendationResult]:
        if user_bookings is None:
            user_bookings = []

        salons = await cls.get_salons_and_services()
        results: List[RecommendationResult] = []

        # Extract parsed query parameters
        intent = parsed_query.get("intent", "general_query")
        locality = parsed_query.get("locality")
        max_price = parsed_query.get("maxPrice")
        is_luxury = parsed_query.get("isLuxury", False)
        offers_home_service = parsed_query.get("offersHomeService", False)
        service_keywords = parsed_query.get("serviceKeywords", [])
        queried_salons = parsed_query.get("queriedSalons", [])

        user_fav_salons = user_profile.get("favoriteSalons", [])
        user_location = user_profile.get("location", "")
        user_locality = user_location.split(",")[0].strip() if user_location else ""

        # --- BRANCH 1: SERVICE SEARCH INTENT ---
        if intent == "service_search" or len(service_keywords) > 0:
            matched_services = []

            for salon in salons:
                for service in salon.get("services", []):
                    service_name = service.get("name", "").lower()
                    service_cat = service.get("category", "").lower()

                    matches_keyword = any(kw.lower() in service_name or kw.lower() in service_cat for kw in service_keywords)
                    if matches_keyword:
                        matched_services.append({"service": service, "salon": salon})

            filtered = matched_services

            # Apply locality filter
            if locality:
                filtered = [item for item in filtered if item["salon"].get("locality", "").lower() == locality.lower()]

            # Apply price filter
            price_fallback_active = False
            if max_price is not None:
                within_price = [item for item in filtered if float(item["service"].get("price", 0)) <= float(max_price)]
                if within_price:
                    filtered = within_price
                else:
                    price_fallback_active = True

            # Calculate match scores and build recommendations
            for item in filtered:
                service = item["service"]
                salon = item["salon"]
                service_name = service.get("name", "").lower()
                service_cat = service.get("category", "").lower()

                score = 75
                reasons = []
                memory_indicator = None

                # Locality alignment
                salon_locality = salon.get("locality", "")
                if locality and salon_locality.lower() == locality.lower():
                    score += 15
                    reasons.append(f"Located in queried locality ({salon_locality})")
                elif user_locality and salon_locality.lower() == user_locality.lower():
                    score += 5
                    reasons.append(f"Matches your neighborhood profile ({salon_locality})")

                # Price alignment
                service_price = float(service.get("price", 0))
                if max_price is not None:
                    if service_price <= float(max_price):
                        score += 15
                        reasons.append(f"Under your budget limit of ₹{max_price}")
                    elif price_fallback_active:
                        score -= 20
                        reasons.append(f"Above target budget of ₹{max_price} (best local alternative)")

                # Rating bonus
                salon_rating = float(salon.get("rating", 5.0))
                if salon_rating >= 4.7:
                    score += 10
                    reasons.append(f"Offered by a top-rated outlet ({salon_rating}★)")

                # Luxury or Home Service tags alignment
                if is_luxury and salon.get("isLuxury"):
                    score += 10
                    reasons.append("Matches luxury outlet preference")
                if offers_home_service and salon.get("offersHomeService"):
                    score += 10
                    reasons.append("Offers doorstep home service")

                # Past Booking Memory alignment
                service_id = service.get("id")
                past_booking = next((b for b in user_bookings if b.get("serviceId") == service_id and b.get("status") != "Cancelled"), None)
                if past_booking:
                    score += 12
                    memory_indicator = f"You booked this treatment on {past_booking.get('date')}"
                    reasons.append("Rebook your previous preferred service")

                # Favorite Salon bonus
                if salon.get("id") in user_fav_salons:
                    score += 8
                    reasons.append("From your favorite salons list")

                # Hair/Skin profile matching
                user_hair = user_profile.get("hairType", "").lower()
                user_skin = user_profile.get("skinTone", "").lower()
                if "hair" in service_cat and user_hair:
                    if user_hair in service.get("description", "").lower() or "hair" in service_name:
                        score += 5
                        reasons.append(f"Optimized for your {user_profile.get('hairType')} hair structure")
                if "skin" in service_cat and user_skin:
                    score += 5
                    reasons.append("Matched with your skin tone diagnostics")

                results.append(RecommendationResult(
                    type="service",
                    id=str(service.get("id")),
                    name=service.get("name"),
                    price=service_price,
                    salonId=salon.get("id"),
                    details=salon.get("name"),
                    matchScore=min(score, 99),
                    reasons=reasons,
                    memoryIndicator=memory_indicator
                ))

        # --- BRANCH 2: SALON SEARCH / COMPARISON / OTHER INTENTS ---
        else:
            target_salons = salons

            # Filter by specific queried salons if mentioned
            if len(queried_salons) > 0:
                target_salons = [s for s in salons if s.get("id") in queried_salons]

            # Filter by locality if specified in query
            if locality:
                target_salons = [s for s in target_salons if s.get("locality", "").lower() == locality.lower()]

            for salon in target_salons:
                score = 70
                reasons = []
                memory_indicator = None

                # Locality matching
                salon_locality = salon.get("locality", "")
                if locality and salon_locality.lower() == locality.lower():
                    score += 15
                    reasons.append(f"Located in {salon_locality}")
                elif user_locality and salon_locality.lower() == user_locality.lower():
                    score += 5
                    reasons.append(f"Matches your area profile ({salon_locality})")

                # Rating check
                salon_rating = float(salon.get("rating", 5.0))
                if salon_rating >= 4.8:
                    score += 15
                    reasons.append(f"Excellent customer satisfaction ({salon_rating}★)")
                elif salon_rating >= 4.5:
                    score += 8
                    reasons.append(f"Highly rated service quality ({salon_rating}★)")

                # Category matching
                if is_luxury:
                    if salon.get("isLuxury"):
                        score += 15
                        reasons.append("Bespoke luxury brand segment")
                    else:
                        score -= 15
                elif salon.get("isLuxury"):
                    score += 5

                if offers_home_service:
                    if salon.get("offersHomeService"):
                        score += 15
                        reasons.append("Offers professional home service visits")
                    else:
                        score -= 10

                # Favorite list memory check
                if salon.get("id") in user_fav_salons:
                    score += 15
                    memory_indicator = "Saved in your favorite outlets list"
                    reasons.append("You frequently consult this brand")

                # Budget category compatibility
                pref_budget = user_profile.get("preferredBudget", "")
                if salon.get("isLuxury") and "₹₹₹" in pref_budget:
                    score += 5
                    reasons.append("Matches premium budget settings")

                # Reviews summary context
                pros = salon.get("aiReviewSummary", {}).get("pros", [])
                if pros:
                    reasons.append(f"Highly reviewed for: {pros[0]}")

                results.append(RecommendationResult(
                    type="salon",
                    id=salon.get("id"),
                    name=salon.get("name"),
                    details=salon_locality,
                    matchScore=min(score, 99),
                    reasons=reasons,
                    memoryIndicator=memory_indicator
                ))

        # Sort by match score descending and return top 3
        results.sort(key=lambda x: x.matchScore, reverse=True)
        return results[:3]

    # --- SALON COMPARISON METRICS LOGIC ---

    @staticmethod
    def calculate_average_rating(reviews: List[Dict[str, Any]]) -> float:
        if not reviews:
            return 0.0
        total = sum(float(r.get("rating") or 0.0) for r in reviews)
        return round(total / len(reviews), 1)

    @staticmethod
    def calculate_sentiment_indicators(reviews: List[Dict[str, Any]]) -> Dict[str, int]:
        indicators = {"positive": 0, "neutral": 0, "negative": 0, "total": len(reviews) if reviews else 0}
        if not reviews:
            return indicators

        for r in reviews:
            rating = int(r.get("rating") or 5)
            if rating >= 4:
                indicators["positive"] += 1
            elif rating == 3:
                indicators["neutral"] += 1
            else:
                indicators["negative"] += 1

        return indicators

    @classmethod
    def count_service_mentions(cls, reviews: List[Dict[str, Any]], services: List[Dict[str, Any]]) -> Dict[str, int]:
        counts = {}
        if not reviews or not services:
            return counts

        for s in services:
            counts[s.get("name", "")] = 0

        for review in reviews:
            comment = review.get("comment", "").lower()
            tags = [t.lower() for t in review.get("tags", [])]
            for service in services:
                name = service.get("name", "")
                keywords = [kw for kw in name.lower().split(" ") if len(kw) > 3]
                matches = any(kw in comment for kw in keywords)
                
                # Check tags
                matches_tag = any(name.lower() in t for t in tags)
                if matches or matches_tag:
                    counts[name] += 1

        return counts

    @classmethod
    def get_top_reviewed_services(cls, reviews: List[Dict[str, Any]], services: List[Dict[str, Any]], top_k: int = 3) -> List[Dict[str, Any]]:
        counts = cls.count_service_mentions(reviews, services)
        sorted_counts = sorted(
            [(name, mentions) for name, mentions in counts.items() if mentions > 0],
            key=lambda x: x[1],
            reverse=True
        )
        return [{"name": name, "mentions": mentions} for name, mentions in sorted_counts[:top_k]]

    @classmethod
    def generate_comparison_metrics(cls, salons: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        metrics = []
        for salon in salons:
            reviews = salon.get("reviews", [])
            services = salon.get("services", [])
            
            price_range = "N/A"
            if services:
                prices = [float(s.get("price", 0)) for s in services]
                min_p = min(prices)
                max_p = max(prices)
                price_range = f"₹{int(min_p)}" if min_p == max_p else f"₹{int(min_p)} - ₹{int(max_p)}"

            metrics.append({
                "salonId": salon.get("id") or salon.get("salonId"),
                "salonName": salon.get("name"),
                "averageRating": cls.calculate_average_rating(reviews),
                "reviewCount": len(reviews),
                "sentiment": cls.calculate_sentiment_indicators(reviews),
                "topServices": cls.get_top_reviewed_services(reviews, services, 3),
                "priceRange": price_range
            })
        return metrics

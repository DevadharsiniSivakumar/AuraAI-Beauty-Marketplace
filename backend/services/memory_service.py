from datetime import datetime, timezone
from typing import List, Dict, Any, Set
from models.user import UserMemory, BookingHistoryItem, ReviewHistoryItem, CategoryScore

class MemoryService:
    @staticmethod
    def recalculate_user_memory(
        bookings: List[Dict[str, Any]],
        reviews: List[Dict[str, Any]],
        salons: List[Dict[str, Any]],
        user_id: str
    ) -> UserMemory:
        # Filter out Cancelled bookings to avoid counting cancelled services
        valid_bookings = [b for b in bookings if b.get("status") != "Cancelled"]

        # 1. Calculate preferred services sorted by frequency descending
        service_counts = {}
        for b in valid_bookings:
            service_name = b.get("serviceName")
            if service_name:
                service_counts[service_name] = service_counts.get(service_name, 0) + 1
        preferred_services = sorted(service_counts.keys(), key=lambda x: service_counts[x], reverse=True)

        # 2. Calculate preferred locations (localities) sorted by frequency descending
        location_counts = {}
        for b in valid_bookings:
            salon_id = b.get("salonId")
            salon = next((s for s in salons if s.get("id") == salon_id), None)
            locality = salon.get("locality") if salon else "Indiranagar"
            if locality:
                location_counts[locality] = location_counts.get(locality, 0) + 1
        preferred_locations = sorted(location_counts.keys(), key=lambda x: location_counts[x], reverse=True)

        # 3. Calculate preferred categories (Luxury / Budget / Home Service) with score
        category_counts = {"Luxury": 0, "Home Service": 0, "Budget": 0}
        for b in valid_bookings:
            salon_id = b.get("salonId")
            salon = next((s for s in salons if s.get("id") == salon_id), None)
            cat = "Budget"
            if salon:
                if salon.get("isLuxury"):
                    cat = "Luxury"
                elif salon.get("offersHomeService"):
                    cat = "Home Service"
            category_counts[cat] = category_counts.get(cat, 0) + 1

        preferred_categories = []
        for cat, score in category_counts.items():
            if score > 0:
                preferred_categories.append(CategoryScore(category=cat, score=score))
        preferred_categories.sort(key=lambda x: x.score, reverse=True)

        # 4. Calculate average spending
        total_price = sum(float(b.get("price") or 0) for b in valid_bookings)
        average_budget = round(total_price / len(valid_bookings)) if valid_bookings else 0.0

        # 5. Build review history, resolving service via user's most recent bookings at that salon
        liked_services: Set[str] = set()
        disliked_services: Set[str] = set()
        review_history: List[ReviewHistoryItem] = []

        for rev in reviews:
            salon_id = rev.get("salonId")
            salon_bookings = [b for b in bookings if b.get("salonId") == salon_id]
            
            # Prioritize Completed status
            completed_bookings = [b for b in salon_bookings if b.get("status") == "Completed"]
            target_bookings = completed_bookings if completed_bookings else salon_bookings
            
            # Sort by date descending
            def parse_date(date_str):
                try:
                    return datetime.strptime(date_str, "%Y-%m-%d")
                except Exception:
                    return datetime.min

            target_bookings_sorted = sorted(target_bookings, key=lambda x: parse_date(x.get("date")), reverse=True)
            recent_booking = target_bookings_sorted[0] if target_bookings_sorted else None
            service_name = recent_booking.get("serviceName") if recent_booking else "Unknown Service"

            rating = int(rev.get("rating") or 5)
            if service_name != "Unknown Service":
                if rating >= 4:
                    liked_services.add(service_name)
                elif rating <= 2:
                    disliked_services.add(service_name)

            salon_name = rev.get("salonName")
            if not salon_name:
                found_salon = next((s for s in salons if s.get("id") == salon_id), None)
                salon_name = found_salon.get("name") if found_salon else "Unknown Salon"

            review_history.append(ReviewHistoryItem(
                reviewId=str(rev.get("id", "")),
                serviceName=service_name,
                salonName=salon_name,
                rating=rating,
                comment=rev.get("comment", "")
            ))

        # Simplified booking history
        booking_history = [
            BookingHistoryItem(
                bookingId=str(b.get("id", "")),
                serviceName=b.get("serviceName", ""),
                salonName=b.get("salonName", ""),
                date=b.get("date", ""),
                price=float(b.get("price") or 0.0),
                status=b.get("status", "")
            )
            for b in bookings
        ]

        return UserMemory(
            userId=user_id,
            preferredServices=preferred_services,
            preferredLocations=preferred_locations,
            preferredCategories=preferred_categories,
            averageBudget=average_budget,
            favoriteSalons=[],
            likedServices=list(liked_services),
            dislikedServices=list(disliked_services),
            bookingHistory=booking_history,
            reviewHistory=review_history,
            lastUpdated=datetime.now(timezone.utc).isoformat()
        )

    @staticmethod
    def build_user_memory_context(memory: UserMemory) -> str:
        if not memory:
            return ""

        pref_services = memory.preferredServices
        preferred_services_text = (
            "\n".join(f"* {s}" for s in pref_services[:3])
            if pref_services else "* None"
        )

        pref_categories = memory.preferredCategories
        preferred_categories_text = (
            "\n".join(f"* {c.category} Salons" for c in pref_categories[:2])
            if pref_categories else "* None"
        )

        pref_locations = memory.preferredLocations
        preferred_locations_text = (
            "\n".join(f"* {l} Area" for l in pref_locations[:2])
            if pref_locations else "* None"
        )

        if memory.averageBudget > 0:
            lower = max(0, int(memory.averageBudget // 500) * 500)
            upper = lower + 500
            budget_range = f"₹{lower}-{upper}"
        else:
            budget_range = "No bookings recorded yet"

        rated_services = "\n".join(
            f"{r.serviceName} ({r.rating}★)"
            for r in memory.reviewHistory
        )

        disliked = memory.dislikedServices
        avoid_services_text = (
            "\n".join(f"* {s}" for s in disliked)
            if disliked else "* None"
        )

        return (
            f"User prefers:\n"
            f"{preferred_services_text}\n"
            f"{preferred_categories_text}\n"
            f"{preferred_locations_text}\n\n"
            f"Average Budget:\n"
            f"{budget_range}\n\n"
            f"Frequently Rated Services:\n"
            f"{rated_services if rated_services else 'None'}\n\n"
            f"Avoid:\n"
            f"{avoid_services_text}"
        )

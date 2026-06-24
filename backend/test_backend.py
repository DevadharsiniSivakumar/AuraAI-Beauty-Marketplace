import json
from fastapi.testclient import TestClient
from app import app
from utils.mock_data import MOCK_USER, MOCK_SALONS

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "online"

def test_memory_update():
    payload = {
        "userId": "rhea-sen-id",
        "bookings": [
            {
                "id": "b-1",
                "salonId": "bodycraft-indiranagar",
                "salonName": "Bodycraft Salon & Spa",
                "serviceName": "Advanced Hydra Facial",
                "price": 4500.0,
                "date": "2026-05-28",
                "status": "Completed"
            }
        ],
        "reviews": [
            {
                "id": "r-1",
                "salonId": "bodycraft-indiranagar",
                "rating": 5,
                "comment": "Incredible hydra facial!",
                "salonName": "Bodycraft Salon & Spa"
            }
        ],
        "salons": MOCK_SALONS
    }
    
    response = client.post("/api/memory/update", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["userId"] == "rhea-sen-id"
    assert "Advanced Hydra Facial" in data["preferredServices"]
    assert data["averageBudget"] == 4500.0

def test_get_memory():
    response = client.get("/api/memory/rhea-sen-id")
    assert response.status_code == 200
    data = response.json()
    assert data["userId"] == "rhea-sen-id"
    assert len(data["preferredServices"]) > 0

def test_beauty_analyze_error():
    # Sending empty base64 string should result in a validation error or trigger simulated fallback
    payload = {"image": ""}
    # Pydantic validation error or FastAPI HTTP exception
    response = client.post("/api/beauty/analyze", json=payload)
    assert response.status_code == 400

def test_beauty_analyze_fallback():
    # Sending some string to test the simulated profile fallback
    payload = {"image": "dummy_image_data_here"}
    response = client.post("/api/beauty/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["faceShape"] in ["Oval", "Round", "Heart"]
    assert len(data["recommendedHairstyles"]) == 3

def test_recommendations_generate():
    payload = {
        "userQuery": "Find me a salon offering a facial under 5000 in Indiranagar",
        "userProfile": MOCK_USER,
        "userBookings": []
    }
    response = client.post("/api/recommendations/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    # The first match should be Bodycraft in Indiranagar
    assert data[0]["type"] == "service"
    assert "Advanced Hydra Facial" in data[0]["name"]

def test_concierge_chat():
    payload = {
        "message": "Hi, my name is Rhea. Can you recommend a hairstyle for my oval face shape?",
        "userProfile": MOCK_USER,
        "bookings": [],
        "userMemory": None,
        "beautyProfile": None
    }
    response = client.post("/api/concierge/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "intent" in data
    assert "response" in data
    assert len(data["response"]) > 0

def test_journey_generate():
    payload = {
        "userGoal": "I have my wedding in 6 weeks, help me glow!",
        "userProfile": MOCK_USER,
        "userMemory": None
    }
    response = client.post("/api/journey/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["journeyType"] == "Bridal"
    assert len(data["steps"]) > 0
    assert data["steps"][0]["status"] == "Pending"

def test_compare_salons():
    payload = {
        "query": "Compare Bodycraft and Play Salon",
        "salons": MOCK_SALONS[:2],
        "memoryContext": ""
    }
    response = client.post("/api/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "feature1Comparison" in data
    assert "feature2ReviewIntelligence" in data
    assert "recommendation" in data

if __name__ == "__main__":
    import pytest
    import sys
    sys.exit(pytest.main(["-v", __file__]))

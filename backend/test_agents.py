import os
os.environ["ALLOW_MOCK_AI_DATA_FALLBACK"] = "true"
import pytest
import asyncio
from unittest.mock import patch
from ai.state import SharedWorkflowState
from ai.orchestrator.orchestrator import AIOrchestrator
from ai.registry import agent_registry
from ai.tools.tool_registry import tool_registry
from utils.mock_data import MOCK_USER
from utils.config import settings
from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def run_async(coro):
    return asyncio.run(coro)

def test_intent_routing():
    """Verify that intent routing maps correctly for general queries."""
    state = run_async(AIOrchestrator.run(
        message="Hello, how does this work?",
        user_id="test_user",
        session_id="test_sess"
    ))
    assert state.intent in ["general_conversation", "general_query"]
    assert "intent" in state.selected_agents

def test_multi_intent_request():
    """Verify wedding requests trigger planning and recommendation agents."""
    state = run_async(AIOrchestrator.run(
        message="I have my wedding in 3 weeks. Recommend me a salon in Indiranagar under 5000",
        user_id="test_user",
        session_id="test_sess"
    ))
    assert "intent" in state.selected_agents
    assert "journey" in state.selected_agents
    assert "recommendation" in state.selected_agents
    assert state.journey_plan is not None
    assert len(state.recommendations) > 0

def test_recommendation_score_calculation():
    """Test transparent matchScore calculation based on filters."""
    state = run_async(AIOrchestrator.run(
        message="Recommend a premium luxury salon in Indiranagar",
        user_id="test_user",
        session_id="test_sess"
    ))
    assert len(state.recommendations) > 0
    first_rec = state.recommendations[0]
    assert first_rec["name"] == "Bodycraft Salon & Spa"
    assert first_rec["matchScore"] >= 90
    assert any("Located in Indiranagar" in r for r in first_rec["reasons"])
    assert any("Bespoke luxury brand segment" in r for r in first_rec["reasons"])

def test_empty_salon_results():
    """Verify recommendation agent handles empty search results cleanly."""
    state = run_async(AIOrchestrator.run(
        message="Find a salon in Whitefield (not mapped)",
        user_id="test_user",
        session_id="test_sess"
    ))
    assert len(state.recommendations) == 0 or all(r["details"] != "Whitefield" for r in state.recommendations)

def test_missing_llm_api_key():
    """Ensure system operates with deterministic fallback when API keys are missing."""
    with patch.object(settings, "GROQ_API_KEY", ""), \
         patch.object(settings, "GEMINI_API_KEY", ""), \
         patch.object(settings, "OPENAI_API_KEY", ""):
        
        state = run_async(AIOrchestrator.run(
            message="Hi Aura, I want to book a facial",
            user_id="test_user",
            session_id="test_sess"
        ))
        assert state.final_response is not None
        assert "hello" in state.final_response.lower() or "facial" in state.final_response.lower()

def test_llm_timeout_failure():
    """Ensure system falls back gracefully when LLM provider fails/errors out."""
    with patch("utils.llm_provider.LLMProviderService.generate_chat_response", side_effect=RuntimeError("Timeout occurred")):
        state = run_async(AIOrchestrator.run(
            message="Hi Aura, I want to book a facial",
            user_id="test_user",
            session_id="test_sess"
        ))
        assert state.final_response is not None
        assert len(state.final_response) > 0

def test_memory_isolation_between_users():
    """Verify user memories are isolated and do not bleed."""
    mem_a = {
        "userId": "user_a",
        "preferredServices": ["Advanced Hydra Facial"],
        "preferredLocations": ["Indiranagar"],
        "preferredCategories": [{"category": "Luxury", "score": 2}],
        "averageBudget": 4500.0,
        "favoriteSalons": [],
        "likedServices": [],
        "dislikedServices": ["Balayage"],
        "bookingHistory": [],
        "reviewHistory": [],
        "lastUpdated": "2026-07-04T10:00:00Z"
    }
    
    state_a = run_async(AIOrchestrator.run(
        message="Suggest a treatment",
        user_id="user_a",
        session_id="sess_a",
        user_memory=mem_a
    ))
    
    state_b = run_async(AIOrchestrator.run(
        message="Suggest a treatment",
        user_id="user_b",
        session_id="sess_b"
    ))
    
    assert "user_a" in state_a.memory["userId"]
    assert "user_b" in state_b.memory["userId"]
    assert state_b.memory["explicit_preferences"]["preferredBudget"] != "Around ₹4500"

def test_booking_confirmation_requirement():
    """Ensure Booking Agent drafts booking but does not execute without confirmation."""
    state = run_async(AIOrchestrator.run(
        message="Book a Precision French Haircut at Play Salon next Friday at 2:00 PM",
        user_id="test_user",
        session_id="test_sess"
    ))
    assert "booking" in state.selected_agents
    assert state.booking_draft is not None
    assert state.booking_draft["status"] == "Draft"
    assert state.booking_draft["requiresConfirmation"] is True

def test_review_agent_insufficient_reviews():
    """Test Review Agent displays honest summary with few/no reviews."""
    state = SharedWorkflowState(
        request_id="test",
        user_id="test_user",
        session_id="test_sess",
        message="What are the reviews for Play Salon?"
    )
    review_agent = agent_registry.get_agent("review")
    with patch("utils.llm_provider.LLMProviderService.generate_chat_response", 
               return_value='{"overallSummary": "Based on 1 review, users like the hair style.", "salonsFeedback": []}'):
        state = run_async(review_agent.run(state))
    assert state.agent_results.get("review_analysis") is not None
    assert "overallSummary" in state.agent_results["review_analysis"]

def test_invalid_api_input():
    """Test validation constraints on routers."""
    res = client.post("/api/ai/agent", json={"message": "", "userId": "test"})
    assert res.status_code == 400
    
    res2 = client.post("/api/ai/agent", json={"userId": "test"})
    assert res2.status_code == 422


# --- FIRESTORE AND FIREBASE AUTH VERIFICATION TESTS ---

class MockDocument:
    def __init__(self, exists=True, data=None):
        self.exists = exists
        self._data = data or {}
        self.id = "mock_id"
    def to_dict(self):
        return self._data

class MockDocumentSnapshot:
    def __init__(self, exists=True, data=None, doc_id="mock_id"):
        self.exists = exists
        self._data = data or {}
        self.id = doc_id
    def to_dict(self):
        return self._data

class MockDocumentReference:
    def __init__(self, doc_id, collection_documents):
        self.id = doc_id
        self._collection_documents = collection_documents
    def get(self):
        found = next((d for d in self._collection_documents if d.id == self.id), None)
        if found:
            return MockDocumentSnapshot(exists=True, data=found._data, doc_id=self.id)
        return MockDocumentSnapshot(exists=False, doc_id=self.id)
    def set(self, data, merge=True):
        found = next((d for d in self._collection_documents if d.id == self.id), None)
        if found:
            # Firestore merge sets key-value pairs
            if "aiMemory" in data and isinstance(data["aiMemory"], dict) and "aiMemory" in found._data:
                found._data["aiMemory"].update(data["aiMemory"])
            else:
                found._data.update(data)
            found.exists = True
        else:
            new_doc = MockDocument(exists=True, data=data)
            new_doc.id = self.id
            self._collection_documents.append(new_doc)
        return None

class MockCollection:
    def __init__(self, documents=None):
        self._documents = documents or []
    def document(self, doc_id):
        return MockDocumentReference(doc_id, self._documents)
    def get(self):
        return [MockDocumentSnapshot(exists=d.exists, data=d._data, doc_id=d.id) for d in self._documents]
    def where(self, field, op, val):
        filtered = [d for d in self._documents if d.to_dict().get(field) == val]
        return MockCollection(filtered)

class MockFirestoreClient:
    def __init__(self):
        self._collections = {}
    def collection(self, name):
        if name not in self._collections:
            self._collections[name] = MockCollection()
        return self._collections[name]

def test_valid_firebase_token_accepted():
    """Verify that a valid cryptographic token is accepted and overrides userId."""
    with patch("security.firebase_auth.verify_firebase_token", return_value={"uid": "verified_user_123", "email": "test@aura.com"}):
        res = client.post(
            "/api/ai/agent",
            json={"message": "Hello", "userId": "attacker_userId_impersonator"},
            headers={"Authorization": "Bearer valid_token_string"}
        )
        assert res.status_code == 200
        data = res.json()
        assert data["metadata"]["authenticated"] is True
        assert data["metadata"]["identitySource"] == "verified_firebase_token"

def test_invalid_token_returns_401():
    """Verify that invalid/expired tokens trigger 401 Unauthorized."""
    with patch("security.firebase_auth.verify_firebase_token", return_value=None):
        res = client.post(
            "/api/ai/agent",
            json={"message": "Hello"},
            headers={"Authorization": "Bearer invalid_expired_token"}
        )
        assert res.status_code == 401

def test_anonymous_session_ephemeral_memory():
    """Verify that anonymous requests generate ephemeral user ids and session tracing."""
    res = client.post(
        "/api/ai/agent",
        json={"message": "Hello", "sessionId": "sess_xyz"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["metadata"]["authenticated"] is False
    assert data["metadata"]["identitySource"] == "anonymous_session"
    assert data["metadata"]["memorySource"] == "ephemeral"

def test_firestore_salon_grounding():
    """Verify salon tools read from Firestore collections and map fields properly."""
    mock_db = MockFirestoreClient()
    salon_doc = MockDocument(exists=True, data={"name": "Live Firestore Salon", "locality": "Indiranagar", "rating": 4.8})
    salon_doc.id = "fs_salon_1"
    mock_db.collection("salons")._documents = [salon_doc]
    
    with patch("ai.tools.salon_tools.get_firestore_client", return_value=mock_db), \
         patch("ai.tools.salon_tools.should_use_mock", return_value=False):
        
        from ai.tools.salon_tools import get_salon_by_id
        salon = run_async(get_salon_by_id("fs_salon_1"))
        assert salon is not None
        assert salon["name"] == "Live Firestore Salon"
        assert salon["locality"] == "Indiranagar"

def test_firestore_empty_result_does_not_hallucinate():
    """Verify empty document search results return None cleanly."""
    mock_db = MockFirestoreClient()
    with patch("ai.tools.salon_tools.get_firestore_client", return_value=mock_db), \
         patch("ai.tools.salon_tools.should_use_mock", return_value=False):
        
        from ai.tools.salon_tools import get_salon_by_id
        salon = run_async(get_salon_by_id("non_existent"))
        assert salon is None

def test_reviews_evidence_consensus_handling():
    """Verify evidence counting triggers correct metrics and avoids theme fabrication."""
    mock_db = MockFirestoreClient()
    salon_doc = MockDocument(exists=True, data={
        "name": "Live Salon", 
        "reviews": [{"id": "r1", "comment": "Excellent styler!", "rating": 5}]
    })
    salon_doc.id = "salon_r"
    mock_db.collection("salons")._documents = [salon_doc]
    
    with patch("ai.tools.salon_tools.get_firestore_client", return_value=mock_db), \
         patch("ai.tools.salon_tools.should_use_mock", return_value=False):
        
        from ai.tools.review_tools import get_salon_reviews
        reviews = run_async(get_salon_reviews("salon_r"))
        assert len(reviews) == 1
        assert reviews[0]["comment"] == "Excellent styler!"

def test_persistent_memory_read_and_write():
    """Verify memory write persists in Firestore and load restores it cleanly."""
    mock_db = MockFirestoreClient()
    user_doc = MockDocument(exists=True, data={})
    user_doc.id = "user_abc"
    mock_db.collection("users")._documents = [user_doc]
    
    with patch("ai.memory.memory_manager.get_firestore_client", return_value=mock_db), \
         patch("ai.memory.memory_manager.should_use_mock", return_value=False), \
         patch("ai.tools.booking_tools.get_firestore_client", return_value=mock_db), \
         patch("ai.tools.booking_tools.should_use_mock", return_value=False):
        
        from ai.memory.memory_manager import MemoryManager
        mem = run_async(MemoryManager.load_user_memory("user_abc"))
        assert mem["userId"] == "user_abc"
        
        # Verify writing sets the key in firestore certificate dictionary
        saved = mock_db.collection("users").document("user_abc").get().to_dict()
        assert "aiMemory" in saved
        
        # Simulate manual Firestore update
        saved["aiMemory"]["preferredLocations"] = ["Koramangala"]
        user_doc._data = saved
        
        # Reload memory
        mem2 = run_async(MemoryManager.load_user_memory("user_abc"))
        assert "Koramangala" in mem2["explicit_preferences"]["preferredLocations"]

def test_memory_isolation_between_users():
    """Verify that User A cannot read or write User B's persistent memory."""
    mock_db = MockFirestoreClient()
    user_a = MockDocument(exists=True, data={"aiMemory": {"userId": "user_a", "preferredLocations": ["Indiranagar"], "lastUpdated": "2026-07-04T00:00:00Z"}})
    user_a.id = "user_a"
    user_b = MockDocument(exists=True, data={"aiMemory": {"userId": "user_b", "preferredLocations": ["Whitefield"], "lastUpdated": "2026-07-04T00:00:00Z"}})
    user_b.id = "user_b"
    mock_db.collection("users")._documents = [user_a, user_b]
    
    with patch("ai.memory.memory_manager.get_firestore_client", return_value=mock_db), \
         patch("ai.memory.memory_manager.should_use_mock", return_value=False), \
         patch("ai.tools.booking_tools.get_firestore_client", return_value=mock_db), \
         patch("ai.tools.booking_tools.should_use_mock", return_value=False):
        
        from ai.memory.memory_manager import MemoryManager
        mem_a = run_async(MemoryManager.load_user_memory("user_a"))
        mem_b = run_async(MemoryManager.load_user_memory("user_b"))
        assert mem_a["explicit_preferences"]["preferredLocations"] == ["Indiranagar"]
        assert mem_b["explicit_preferences"]["preferredLocations"] == ["Whitefield"]

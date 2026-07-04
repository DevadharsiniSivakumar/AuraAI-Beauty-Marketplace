# Firestore AI Grounding Architecture

This document describes how the Aura Agentic AI system grounds its beauty intelligence and recommendations in live Firestore application database records.

---

## 1. Grounded collections

The AI agent tools and recommendation engine communicate directly with three primary Firestore collections:
1. **`salons`**: Holds salon detail documents, including embedded `reviews` arrays.
2. **`services`**: Holds services documents. Each service matches a salon ID.
3. **`bookings`**: Holds user booking transaction documents.

---

## 2. Recommendation Logic and Trace Mapping
The `RecommendationService.get_salons_and_services` queries all salons and services from Firestore, joins them by `salonId`, and builds the legacy hierarchy dynamically at runtime.

### Trace Metadata Configuration
Every recommendation result returned is labeled with a `dataSource` string tracking source mapping:
* **`firestore`**: Grounded successfully in live Firestore database.
* **`mock_fallback`**: Firestore failed or database client was not configured, and local mock database was returned.

### Fallback Toggle Configuration
Mock fallback behavior is guarded by the system environment variable:
* **`ALLOW_MOCK_AI_DATA_FALLBACK`** (defaults to `false` in production).
  * If `true`, a Firestore error drops down to local mock datasets and flags the output tracing with `"mock_fallback"`.
  * If `false`, a Firestore query failure throws a controlled RuntimeError immediately, forcing a secure fail-fast behavior.

---

## 3. Evidence-Based Review Consensus
The review tool queries the live salon document and count reviews explicitly to prevent fabricated summaries:
* **Zero Reviews**: The tool returns an empty list, and the review agent outputs a statement that no user reviews are available yet.
* **Single/Multiple Reviews**: Reviews are listed individually with ratings and exact feedback, ensuring LLM synthesis is strictly grounded in the database text evidence.

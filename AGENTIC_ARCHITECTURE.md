# Aura Agentic AI Architecture

This document describes the design, routing mechanisms, and component specifications of the **Aura Agentic AI Beauty Intelligence Platform**.

## Overview
Aura is designed as a stateful, modular multi-agent platform. The website serves as a presentation layer around a secure, server-side agentic API boundary orchestrated by a central coordinator.

```mermaid
graph TD
    User([User Request]) --> NextJS[Next.js API Route /api/concierge]
    NextJS --> FastAPI[FastAPI Route /api/ai/agent]
    
    subgraph Agentic System (Python Backend)
        FastAPI --> Orchestrator[AI Orchestrator]
        Orchestrator --> State[Shared Workflow State]
        Orchestrator --> Memory[User Memory Service]
        Orchestrator --> Intent[Intent & Context Agent]
        
        Intent --> Selector{Orchestrator Selection}
        
        Selector -->|salon_recommendation| RecAgent[Salon Recommendation Agent]
        Selector -->|review_analysis| ReviewAgent[Review Intelligence Agent]
        Selector -->|beauty_planning| PlanAgent[Beauty Journey Planning Agent]
        Selector -->|booking_assistance| BookAgent[Booking Assistance Agent]
        
        RecAgent --> Tools[Tool Registry]
        ReviewAgent --> Tools
        PlanAgent --> Tools
        BookAgent --> Tools
        
        Tools --> DB[(Firestore / Mock Data)]
    end
    
    Orchestrator --> Output[Structured Response]
    Output --> NextJS
    NextJS --> User
```

## System Components

### 1. Central AI Orchestrator
The central [AIOrchestrator](file:///d:/AuraAI/backend/ai/orchestrator/orchestrator.py) manages the execution flow. It:
- Initializes the state context.
- Loads memory.
- Triggers the Intent Agent.
- Performs dynamic routing to execute one or more specialized agents based on primary and secondary intents.
- Triggers memory updates.
- Synthesizes intermediate findings into a premium, luxury narrator explanation.

### 2. Specialized Agents
Each agent has a single, modular responsibility inheriting from [BaseAgent](file:///d:/AuraAI/backend/ai/agents/base_agent.py):
- **[Intent and Context Agent](file:///d:/AuraAI/backend/ai/agents/intent_agent.py)**: Extracts entities and detects intents using LLM-based structured parsing or rule-based regex fallback.
- **[Salon Recommendation Agent](file:///d:/AuraAI/backend/ai/agents/recommendation_agent.py)**: Filters and ranks real salons or services using a transparent scoring metric and computes trade-offs.
- **[Review Intelligence Agent](file:///d:/AuraAI/backend/ai/agents/review_agent.py)**: Aggregates real customer reviews, identifying pros, cons, and service specific themes with evidence count.
- **[Beauty Journey Planning Agent](file:///d:/AuraAI/backend/ai/agents/journey_agent.py)**: Generates chronological beauty timelines, milestones, and precautions with built-in medical disclaimers.
- **[Booking Assistance Agent](file:///d:/AuraAI/backend/ai/agents/booking_agent.py)**: Parses slot preferences, drafts booking structures, and requires explicit user confirmation.

### 3. Tool Layer
Agents perform all data access through a strictly typed, server-validated [ToolRegistry](file:///d:/AuraAI/backend/ai/tools/tool_registry.py):
- `search_salons`: Resolves matching salons/services.
- `get_salon_by_id`: Retrieves salon metadata.
- `get_salon_services`: Lists salon service packages.
- `get_salon_reviews`: Retrieves customer reviews.
- `compare_salons`: Compiles analytical metrics and review comparison.
- `get_user_booking_history`: Retrieves booking counts and dates.
- `create_booking_draft`: Compiles booking details.
- `get_user_profile`: Loads physical constraints (e.g. skin tone, hair type).

### 4. User Memory Layer
The [MemoryManager](file:///d:/AuraAI/backend/ai/memory/memory_manager.py) segments:
- **Explicit Preferences**: preferred locations, budgets, categories.
- **Beauty Context**: voluntarily provided skin and hair properties.
- **Interaction History**: shortlisted salon interest, search history.
- **Booking Context**: bookings count and last appointment date.

## Shared Workflow State
State is modeled as a unified Pydantic schema [SharedWorkflowState](file:///d:/AuraAI/backend/ai/state.py) tracking intermediate outputs, tool executions, selected agents, and runtime errors.

## Routing and Fallback Strategy
- **Intent mapping**: legacy intents like `booking_help`, `salon_search`, `service_search` are automatically mapped to standardized agents.
- **API fallbacks**: if the Groq or Gemini LLM is offline, the agents fall back to local rule-based regex matching and pre-defined templates.
- **Next.js client fallback**: if the FastAPI server is down, Next.js falls back to local TS explanation generators to ensure 100% uptime.

## Security
All API keys (`GROQ_API_KEY`, `GEMINI_API_KEY`) are kept on the server side and never exposed to the client browser code. Next.js proxies all queries to the FastAPI router via `/api/ai/agent` or `/api/concierge`.

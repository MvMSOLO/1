# Architectural Decision Records (ADRs)

## ADR-001: Vite SPA with Cloudflare Edge Adapter
- **Status**: Approved
- **Context**: We need an instant, scalable, simple application with lightweight operational footprint.
- **Decision**: Build the frontend as a Vite Single Page Application (SPA) with React 19 and Tailwind v4. Build the backend search API as a portable service easily run inside a Node or Cloudflare Worker script.
- **Consequences**: Minimizes operational overhead and page load speeds, fully decouples UI from the retrieval pipeline.

## ADR-002: Deterministic Heuristic Query Classification
- **Status**: Approved
- **Context**: V1 requires $0 budget and high speed. LLMs can add latency and cost.
- **Decision**: Classify query intent using regex patterns and keyword mappings.
- **Consequences**: Deterministic, zero-latency, free query analysis. Allows drop-in AI query interpretation later.

## ADR-003: Unified Domain Search Models
- **Status**: Approved
- **Context**: React components must not contain provider-specific mapping or logic.
- **Decision**: Standardize all provider responses into unified `Source`, `Claim`, and `SearchResult` interfaces on the backend API.
- **Consequences**: UI components remain clean, reusable, and provider-agnostic.

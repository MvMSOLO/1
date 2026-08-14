# NEXUS Architecture Guide

This document describes the high-level architecture of NEXUS, a foundational MVP for a provider-agnostic knowledge engine.

```
       +---------------------------------------------+
       |                  Frontend                   |
       |  (React 19, Vite 8, Tailwind v4, TS 7)       |
       +----------------------+----------------------+
                              |
                     HTTPS    |  Search Request
                     (JSON)   v
       +---------------------------------------------+
       |               Backend API                   |
       |        (Cloudflare-portable Service)        |
       +----------------------+----------------------+
                              |
                              v
       +---------------------------------------------+
       |            RetrievalCoordinator            |
       +----------------------+----------------------+
                              |
         +--------------------+--------------------+
         |                    |                    |
         v                    v                    v
+-----------------+  +-----------------+  +-----------------+
| Wikipedia       |  | GitHub          |  | OpenLibrary     |
| Provider        |  | Provider        |  | Provider        |
+-----------------+  +-----------------+  +-----------------+
```

## System Modules

### 1. Frontend SPA
- Built on **React 19** and **Vite 8**.
- Styling with **Tailwind CSS v4.3.3** for a "Calm Futurism" design.
- Asynchronous states managed by **TanStack Query v5**.
- Pure, componentized layout driven by the search query type and dynamic `ResultExperience`.

### 2. Portable Backend API / Cloudflare Worker
- Provides `POST /api/search` endpoints.
- Lightweight TypeScript layer suitable for Cloudflare Workers edge runtime.
- Keeps secrets and direct third-party API keys out of frontend bundles.

### 3. Retrieval Coordinator
- Orchestrates independent search providers in parallel.
- Applies per-provider timeouts using `AbortController`.
- Normalizes, deduplicates, and ranks sources.
- Emits structured domain models back to the frontend.

### 4. Providers Layer
- **Wikipedia**: Article searches and summaries via Wikimedia API.
- **GitHub**: Repository search and readme summaries via GitHub API.
- **OpenLibrary**: Book search and metadata via Open Library API.
- Custom mock fixture loaders for troubleshooting and comparative demo queries.

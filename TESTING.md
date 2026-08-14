# NEXUS Testing Strategy

## Test Suite Overview

### 1. Unit & Integration Tests
- Formulate tests for:
  - Query classification & normalization.
  - URL canonicalization.
  - Token-based Jaccard similarity and deduplication.
  - Ranking score calculations.
  - Error boundaries & timeout handling in the `RetrievalCoordinator`.

### 2. Playwright End-to-End (E2E) Tests
- Tests exact UI scenarios:
  1. Open homepage `/`.
  2. Focus search box.
  3. Enter query.
  4. Submit search.
  5. Inspect the dynamic progressive loading states (`DISCOVERING`, `SOURCES FOUND`, `REFINING`, `BUILDING RESULT`).
  6. Confirm adaptive result experience layout.
  7. Open source evidence drawer.
  8. Click a related topic to trigger a new search.
  9. Go back / forward in history.
  10. Refresh and check search persistence.
  11. Keyboard-only navigation.
  12. Mobile viewport layout.

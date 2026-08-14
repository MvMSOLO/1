# NEXUS Provider Guide

## Provider Contract
Every provider adapter implements a standard, isolated contract.

```typescript
export interface SearchProvider {
  id: string;
  search(request: SearchRequest): Promise<SearchProviderResult>;
  healthCheck?(): Promise<boolean>;
}
```

## Adding a New Provider
1. Create a subfolder under `src/providers/<provider_name>/`.
2. Implement the `SearchProvider` interface.
3. Map internal API responses to the consistent domain model (`Source`).
4. Register the new provider in the `RetrievalCoordinator`.
5. Keep provider exceptions isolated: if one provider crashes or times out, the `RetrievalCoordinator` must still return the rest of the results seamlessly.

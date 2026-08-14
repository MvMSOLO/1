# NEXUS Search & Retrieval Pipeline

## Pipeline Steps

```
[User Query]
     |
     v
[Query Classification (Heuristics)]  --> normalizedQuery, topic selection
     |
     v
[Parallel Search Providers]  ----------> Wikipedia, GitHub, OpenLibrary
     |
     v
[Source Normalization]  --------------> Consistent Source model
     |
     v
[Deduplication Layer]  ---------------> Hash comparison & Token similarity
     |
     v
[Relevance & Quality Ranking]  -------> Multi-factor heuristic scoring
     |
     v
[Claim & Contradiction Mapping]  -----> Extract distinct assertions, flag conflicts
     |
     v
[Dynamic Experience Selection]  ------> Render layout (overview, comparison, troubleshooting)
```

### Heuristic Query Classifier
Analyzes raw string to find search intent (factual, explanatory, comparative, troubleshooting, research) using deterministic regex and keywords:
- "compare", "vs" -> comparative
- "why", "how to fix", "freeze", "crash", "error" -> troubleshooting / explanatory
- "when", "history", "timeline" -> timeline / historical

### Deduplication
Calculates Jaccard token similarity on text segments and normalizes URLs to group duplicate claims together and compute an `independenceScore`.

### Ranking Algorithm
Applies a composite weight score:
```
score = (relevance * 0.4) + (freshness * 0.2) + (specificity * 0.2) + (sourceQuality * 0.2) - (duplicationPenalty)
```
- Fully transparent in development mode.
- Adapts freshness weights based on query type (e.g., highly decay news/troubleshooting but low decay static docs).

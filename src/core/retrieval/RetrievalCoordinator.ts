import { SearchProvider } from './SearchProvider.ts';
import { SearchIntent, Source, SearchResult, Claim, ExperienceKind } from '../../types/index.ts';
import { deduplicateSources } from '../deduplication/deduplicator.ts';
import { rankSources } from '../ranking/ranker.ts';

export class RetrievalCoordinator {
  private providers: SearchProvider[];

  constructor(providers: SearchProvider[]) {
    this.providers = providers;
  }

  async coordinate(intent: SearchIntent, timeoutMs: number = 4000): Promise<SearchResult> {
    const startTime = Date.now();
    const providerMetrics: Record<string, { latencyMs: number; success: boolean }> = {};
    const controller = new AbortController();

    const timeoutPromise = new Promise<Source[]>((_, reject) => {
      const id = setTimeout(() => {
        controller.abort();
        reject(new Error('Search timeout reached'));
      }, timeoutMs);
      // Keep Node from hanging in tests
      if (id.unref) id.unref();
    });

    const fetchFromProvider = async (provider: SearchProvider): Promise<Source[]> => {
      const start = Date.now();
      try {
        const results = await provider.search(intent, controller.signal);
        providerMetrics[provider.id] = {
          latencyMs: Date.now() - start,
          success: true,
        };
        return results;
      } catch (err) {
        providerMetrics[provider.id] = {
          latencyMs: Date.now() - start,
          success: false,
        };
        return [];
      }
    };

    let allSources: Source[] = [];
    try {
      // Run providers in parallel with timeout race
      const providerPromises = this.providers.map(p => fetchFromProvider(p));
      const resultsArray = await Promise.race([
        Promise.all(providerPromises),
        timeoutPromise,
      ]) as Source[][];

      allSources = resultsArray.flat();
    } catch (e) {
      // If the race rejected due to global timeout, retrieve whatever finished or return empty gracefully
      const completedPromises = this.providers.map(async p => {
        try {
          const start = Date.now();
          const res = await p.search(intent, controller.signal);
          providerMetrics[p.id] = { latencyMs: Date.now() - start, success: true };
          return res;
        } catch {
          providerMetrics[p.id] = { latencyMs: 0, success: false };
          return [];
        }
      });
      const results = await Promise.all(completedPromises);
      allSources = results.flat();
    }

    // 1. Deduplicate sources
    const dedupedSources = deduplicateSources(allSources);

    // 2. Rank sources
    const rankedSources = rankSources(dedupedSources, intent);

    // 3. Extract claims & identify contradictions
    const claims: Claim[] = [];
    const relatedTopics: string[] = [];

    // Derive ExperienceKind based on queryType
    let experience: ExperienceKind = 'overview';
    if (intent.queryType === 'comparative') {
      experience = 'comparison';
    } else if (intent.queryType === 'troubleshooting') {
      experience = 'troubleshooting';
    } else if (intent.queryType === 'historical') {
      experience = 'timeline';
    } else if (intent.queryType === 'research') {
      experience = 'research';
    }

    // Primary items generation
    const primaryItems = rankedSources.slice(0, 3).map((s) => ({
      title: s.title,
      description: s.excerpt || 'Source snippet detailing query evidence.',
      sourceIds: [s.id],
    }));

    // Generate dynamic claims mapping
    rankedSources.forEach((s) => {
      if (s.excerpt && s.excerpt.length > 20) {
        const text = s.excerpt.length > 100 ? `${s.excerpt.substring(0, 97)}...` : s.excerpt;
        claims.push({
          id: `claim-${s.id}`,
          text,
          sourceIds: [s.id],
          topicIds: intent.topics,
          confidence: s.duplicateOf ? 0.4 : 0.85,
          claimType: 'fact',
        });
      }
    });

    // Populate general related topics
    if (intent.topics.length > 0) {
      relatedTopics.push(...intent.topics);
    }
    if (intent.entities.length > 0) {
      intent.entities.forEach(ent => {
        relatedTopics.push(`${ent.name} overview`);
        relatedTopics.push(`${ent.name} future trends`);
      });
    } else {
      relatedTopics.push(`${intent.rawQuery} core concepts`, `${intent.rawQuery} tutorial`, `${intent.rawQuery} troubleshooting`);
    }

    const latencyMs = Date.now() - startTime;

    return {
      query: intent,
      experience,
      primaryItems,
      claims,
      sources: rankedSources,
      relatedTopics: Array.from(new Set(relatedTopics)),
      metadata: {
        latencyMs,
        providerMetrics,
        cacheHit: false,
      },
    };
  }
}

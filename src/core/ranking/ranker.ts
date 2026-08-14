import { Source, SearchIntent } from '../../types/index.ts';

export interface ScoredSource extends Source {
  relevanceScore: number;
  freshnessScore: number;
  specificityScore: number;
  sourceQualityScore: number;
  compositeScore: number;
}

/**
 * Normalizes scores to [0, 1] range.
 */
function normalize(val: number): number {
  return Math.min(1, Math.max(0, val));
}

/**
 * Calculates freshness score with query-dependent decay.
 */
function calculateFreshness(publishedAt?: string, queryType?: SearchIntent['queryType']): number {
  if (!publishedAt) return 0.5; // Neutral baseline for missing dates

  let pubYear = parseInt(publishedAt.substring(0, 4));
  if (isNaN(pubYear)) {
    // Check if it's just a year
    pubYear = parseInt(publishedAt);
    if (isNaN(pubYear)) return 0.5;
  }

  const currentYear = 2026; // Set from spec: Date: 2026-08-13
  const age = Math.max(0, currentYear - pubYear);

  // Time-sensitive queries decay fast, static knowledge decays slowly
  const isTimeSensitive = queryType === 'time-sensitive' || queryType === 'troubleshooting';
  const decayRate = isTimeSensitive ? 0.3 : 0.02;

  // Exponential decay
  return Math.exp(-decayRate * age);
}

/**
 * Assigns a basic trust/quality score based on provider and signals.
 */
function calculateQuality(src: Source): number {
  let score = 0.5;

  if (src.provider === 'wikipedia') {
    score = 0.9;
  } else if (src.provider === 'github') {
    score = 0.8;
  } else if (src.provider === 'openlibrary') {
    score = 0.75;
  }

  if (src.trustSignals?.authoritative) {
    score += 0.1;
  }
  if (src.trustSignals?.independentConfirmation) {
    score += 0.05;
  }

  return normalize(score);
}

/**
 * Calculate keyword matching relevance.
 */
function calculateRelevance(title: string, excerpt: string, query: string): number {
  const queryWords = query.toLowerCase().match(/\b\w+\b/g) || [];
  if (queryWords.length === 0) return 0.5;

  const targetText = `${title} ${excerpt}`.toLowerCase();
  let matchCount = 0;

  for (const word of queryWords) {
    if (targetText.includes(word)) {
      matchCount++;
    }
  }

  return normalize(matchCount / queryWords.length);
}

/**
 * Scores and ranks sources dynamically.
 */
export function rankSources(sources: Source[], intent: SearchIntent): ScoredSource[] {
  const query = intent.rawQuery;
  const queryType = intent.queryType;

  return sources.map(src => {
    const relevanceScore = calculateRelevance(src.title, src.excerpt || '', query);
    const freshnessScore = calculateFreshness(src.publishedAt || src.updatedAt, queryType);
    const specificityScore = src.excerpt && src.excerpt.length > 50 ? normalize(src.excerpt.length / 500) : 0.4;
    const sourceQualityScore = calculateQuality(src);

    // Composite score
    // score = (relevance * 0.4) + (freshness * 0.2) + (specificity * 0.2) + (sourceQuality * 0.2) - duplicationPenalty
    const duplicationPenalty = src.duplicateOf ? 0.5 : 0.0;
    const rawScore = (relevanceScore * 0.4) + (freshnessScore * 0.2) + (specificityScore * 0.2) + (sourceQualityScore * 0.2) - duplicationPenalty;

    return {
      ...src,
      relevanceScore,
      freshnessScore,
      specificityScore,
      sourceQualityScore,
      compositeScore: normalize(rawScore),
    };
  }).sort((a, b) => b.compositeScore - a.compositeScore);
}

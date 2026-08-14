export type SourceType =
  | 'article'
  | 'documentation'
  | 'repository'
  | 'forum'
  | 'wiki'
  | 'dataset'
  | 'feed'
  | 'api'
  | 'book'
  | 'other';

export interface TrustSignals {
  independentConfirmation?: boolean;
  authoritative?: boolean;
  citationCount?: number;
}

export interface Source {
  id: string;
  provider: string;
  canonicalUrl: string;
  title: string;
  publisher?: string;
  author?: string;
  publishedAt?: string;
  updatedAt?: string;
  retrievedAt: string;
  language?: string;
  sourceType: SourceType;
  excerpt?: string;
  content?: string;
  imageUrl?: string;
  faviconUrl?: string;
  trustSignals?: TrustSignals;
  independenceScore?: number;
  duplicateOf?: string;
  similarityScore?: number;
}

export interface Claim {
  id: string;
  text: string;
  sourceIds: string[];
  topicIds: string[];
  confidence: number;
  claimType: 'fact' | 'opinion' | 'inference' | 'estimate';
  publishedAt?: string;
}

export type QueryType =
  | 'factual'
  | 'explanatory'
  | 'comparative'
  | 'troubleshooting'
  | 'research'
  | 'historical'
  | 'navigational'
  | 'list'
  | 'recommendation'
  | 'definition'
  | 'technical'
  | 'time-sensitive';

export interface EntityReference {
  name: string;
  type: string;
}

export interface SearchIntent {
  rawQuery: string;
  normalizedQuery: string;
  language?: string;
  topics: string[];
  entities: EntityReference[];
  queryType: QueryType;
}

export type ExperienceKind =
  | 'overview'
  | 'comparison'
  | 'timeline'
  | 'troubleshooting'
  | 'research';

export interface SearchResult {
  query: SearchIntent;
  experience: ExperienceKind;
  primaryItems: Array<{
    title: string;
    description: string;
    sourceIds: string[];
  }>;
  claims: Claim[];
  sources: Source[];
  relatedTopics: string[];
  warnings?: string[];
  metadata: {
    latencyMs: number;
    providerMetrics: Record<string, { latencyMs: number; success: boolean }>;
    cacheHit: boolean;
  };
}

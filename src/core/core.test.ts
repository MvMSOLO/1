import { describe, it, expect } from 'vitest';
import { classifyQuery } from './query/interpreter';
import { deduplicateSources } from './deduplication/deduplicator';
import { rankSources } from './ranking/ranker';
import { Source, SearchIntent } from '../types';

describe('Heuristic Classifier', () => {
  it('correctly classifies comparative query', () => {
    const res = classifyQuery('React vs Vue for mobile projects');
    expect(res.queryType).toBe('comparative');
    expect(res.entities.map(e => e.name)).toContain('React');
    expect(res.entities.map(e => e.name)).toContain('Vue');
  });

  it('correctly classifies troubleshooting query', () => {
    const res = classifyQuery('cs 1.6 freezes when aiming');
    expect(res.queryType).toBe('troubleshooting');
  });
});

describe('Deduplicator', () => {
  it('identifies exact URL duplicates', () => {
    const list: Source[] = [
      { id: '1', provider: 'test', canonicalUrl: 'http://domain.com/1', title: 'A', retrievedAt: '', sourceType: 'api' },
      { id: '2', provider: 'test', canonicalUrl: 'http://domain.com/1', title: 'B', retrievedAt: '', sourceType: 'api' },
    ];
    const deduped = deduplicateSources(list);
    expect(deduped[1].duplicateOf).toBe('1');
    expect(deduped[1].similarityScore).toBe(1);
  });

  it('identifies title/excerpt Jaccard duplicates', () => {
    const list: Source[] = [
      { id: '1', provider: 'test', canonicalUrl: 'http://domain.com/1', title: 'The sky is blue and beautiful today', excerpt: 'sun is shining', retrievedAt: '', sourceType: 'api' },
      { id: '2', provider: 'test', canonicalUrl: 'http://domain.com/2', title: 'the sky is blue and beautiful today', excerpt: 'sun is shining', retrievedAt: '', sourceType: 'api' },
    ];
    const deduped = deduplicateSources(list);
    expect(deduped[1].duplicateOf).toBe('1');
    expect(deduped[1].similarityScore).toBeGreaterThan(0.9);
  });
});

describe('Ranker', () => {
  it('ranks higher relevance first', () => {
    const intent: SearchIntent = {
      rawQuery: 'React',
      normalizedQuery: 'react',
      topics: [],
      entities: [],
      queryType: 'factual'
    };
    const list: Source[] = [
      { id: '1', provider: 'test', canonicalUrl: 'http://a', title: 'Something completely unrelated', excerpt: 'none', retrievedAt: '', sourceType: 'api' },
      { id: '2', provider: 'test', canonicalUrl: 'http://b', title: 'React framework guides', excerpt: 'React components', retrievedAt: '', sourceType: 'api' },
    ];
    const ranked = rankSources(list, intent);
    expect(ranked[0].id).toBe('2');
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DuckDuckGoProvider } from './DuckDuckGoProvider';
import { SearchIntent } from '../../types';

describe('DuckDuckGoProvider', () => {
  let provider: DuckDuckGoProvider;

  beforeEach(() => {
    provider = new DuckDuckGoProvider();
    vi.restoreAllMocks();
  });

  it('has correct id', () => {
    expect(provider.id).toBe('duckduckgo');
  });

  it('returns empty array if query is empty', async () => {
    const intent: SearchIntent = {
      rawQuery: '   ',
      normalizedQuery: '',
      topics: [],
      entities: [],
      queryType: 'factual',
    };
    const results = await provider.search(intent);
    expect(results).toEqual([]);
  });

  it('parses DuckDuckGo HTML results correctly', async () => {
    const mockHtml = `
      <html>
        <body>
          <div class="result">
            <a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Ftest-page">Example Test Page</a>
            <a class="result__snippet">This is an example snippet text for testing DuckDuckGoProvider.</a>
          </div>
        </body>
      </html>
    `;

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      text: async () => mockHtml,
    } as Response);

    const intent: SearchIntent = {
      rawQuery: 'test query',
      normalizedQuery: 'test query',
      topics: [],
      entities: [],
      queryType: 'factual',
    };

    const results = await provider.search(intent);
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('Example Test Page');
    expect(results[0].canonicalUrl).toBe('https://example.com/test-page');
    expect(results[0].excerpt).toBe('This is an example snippet text for testing DuckDuckGoProvider.');
    expect(results[0].provider).toBe('duckduckgo');
  });

  it('falls back to DuckDuckGo API if HTML fetch returns non-ok', async () => {
    const mockApiResponse = {
      Heading: 'DuckDuckGo Heading',
      AbstractText: 'DuckDuckGo Abstract Description',
      AbstractURL: 'https://duckduckgo.com/abstract',
      RelatedTopics: [],
    };

    // First fetch (HTML) fails
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: false } as Response)
      // Second fetch (API) succeeds
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockApiResponse,
      } as Response);

    const intent: SearchIntent = {
      rawQuery: 'fallback query',
      normalizedQuery: 'fallback query',
      topics: [],
      entities: [],
      queryType: 'factual',
    };

    const results = await provider.search(intent);
    expect(results.length).toBe(1);
    expect(results[0].title).toBe('DuckDuckGo Heading');
    expect(results[0].canonicalUrl).toBe('https://duckduckgo.com/abstract');
    expect(results[0].excerpt).toBe('DuckDuckGo Abstract Description');
  });

  it('handles fetch exception gracefully', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network error'));

    const intent: SearchIntent = {
      rawQuery: 'error query',
      normalizedQuery: 'error query',
      topics: [],
      entities: [],
      queryType: 'factual',
    };

    const results = await provider.search(intent);
    expect(results).toEqual([]);
  });
});

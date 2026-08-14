import { SearchProvider } from '../../core/retrieval/SearchProvider.ts';
import { SearchIntent, Source } from '../../types/index.ts';

export class WikipediaProvider implements SearchProvider {
  id = 'wikipedia';

  async search(intent: SearchIntent, signal?: AbortSignal): Promise<Source[]> {
    const q = intent.rawQuery;
    // Don't hammer real Wikipedia API during simple demo queries unless they want real results.
    // If we're offline or doing specialized demo scenarios, fallback appropriately or query live API safely.
    try {
      const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(
        q
      )}&format=json&origin=*`;

      const response = await fetch(url, { signal });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      const results = data.query?.search || [];

      return results.map((item: any, index: number) => {
        const pageid = item.pageid;
        return {
          id: `wiki-${pageid || index}`,
          provider: 'wikipedia',
          canonicalUrl: `https://en.wikipedia.org/?curid=${pageid}`,
          title: item.title,
          retrievedAt: new Date().toISOString(),
          sourceType: 'wiki',
          excerpt: item.text ? item.text : item.snippet ? item.snippet.replace(/<\/?[^>]+(>|$)/g, '') : '', // Strip HTML tags
          trustSignals: {
            authoritative: true,
            independentConfirmation: true,
          },
        } as Source;
      });
    } catch {
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch('https://en.wikipedia.org/wiki/Main_Page', { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

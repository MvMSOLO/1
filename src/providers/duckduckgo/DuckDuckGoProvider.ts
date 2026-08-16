import { SearchProvider } from '../../core/retrieval/SearchProvider.ts';
import { SearchIntent, Source } from '../../types/index.ts';

export class DuckDuckGoProvider implements SearchProvider {
  id = 'duckduckgo';

  async search(intent: SearchIntent, signal?: AbortSignal): Promise<Source[]> {
    const q = intent.rawQuery;
    if (!q || !q.trim()) return [];

    try {
      // Primary: Live HTML web search from DuckDuckGo
      const htmlResults = await this.searchHtml(q, signal);
      if (htmlResults.length > 0) {
        return htmlResults;
      }

      // Fallback: DuckDuckGo Instant Answer API
      return await this.searchApi(q, signal);
    } catch {
      return [];
    }
  }

  private async searchHtml(q: string, signal?: AbortSignal): Promise<Source[]> {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`;
    const response = await fetch(url, {
      signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) return [];

    const html = await response.text();
    const results: Source[] = [];

    const linkRegex = /<a [^>]*class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    const snippetRegex = /<a [^>]*class="result__snippet[^"]*"[^>]*>([\s\S]*?)<\/a>/g;

    const links: Array<{ title: string; url: string }> = [];
    let linkMatch: RegExpExecArray | null;

    while ((linkMatch = linkRegex.exec(html)) !== null) {
      const rawUrl = linkMatch[1];
      const title = linkMatch[2].replace(/<[^>]+>/g, '').trim();
      let actualUrl = rawUrl;

      if (rawUrl.includes('uddg=')) {
        const uParam = rawUrl.split('uddg=')[1]?.split('&')[0];
        if (uParam) actualUrl = decodeURIComponent(uParam);
      } else if (rawUrl.startsWith('//')) {
        actualUrl = `https:${rawUrl}`;
      }

      if (actualUrl.startsWith('http')) {
        links.push({ title, url: actualUrl });
      }
    }

    const snippets: string[] = [];
    let snipMatch: RegExpExecArray | null;
    while ((snipMatch = snippetRegex.exec(html)) !== null) {
      snippets.push(snipMatch[1].replace(/<[^>]+>/g, '').trim());
    }

    const now = new Date().toISOString();
    for (let i = 0; i < links.length; i++) {
      const link = links[i];
      const snippet = snippets[i] || '';

      results.push({
        id: `ddg-${i}-${Date.now()}`,
        provider: 'duckduckgo',
        canonicalUrl: link.url,
        title: link.title || 'Web Search Result',
        retrievedAt: now,
        sourceType: 'article',
        excerpt: snippet,
        trustSignals: {
          authoritative: link.url.includes('.gov') || link.url.includes('.edu') || link.url.includes('github.com'),
          independentConfirmation: true,
        },
      });
    }

    return results;
  }

  private async searchApi(q: string, signal?: AbortSignal): Promise<Source[]> {
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json`;
    const response = await fetch(url, { signal });
    if (!response.ok) return [];

    const data = await response.json();
    const results: Source[] = [];
    const now = new Date().toISOString();

    if (data.AbstractText && data.AbstractURL) {
      results.push({
        id: `ddg-api-abstract-${Date.now()}`,
        provider: 'duckduckgo',
        canonicalUrl: data.AbstractURL,
        title: data.Heading || q,
        retrievedAt: now,
        sourceType: 'article',
        excerpt: data.AbstractText,
        trustSignals: {
          authoritative: true,
          independentConfirmation: true,
        },
      });
    }

    if (Array.isArray(data.RelatedTopics)) {
      data.RelatedTopics.forEach((topic: any, idx: number) => {
        if (topic.FirstURL && topic.Text) {
          results.push({
            id: `ddg-api-topic-${idx}-${Date.now()}`,
            provider: 'duckduckgo',
            canonicalUrl: topic.FirstURL,
            title: topic.Text.split(' - ')[0] || topic.Text.substring(0, 50),
            retrievedAt: now,
            sourceType: 'article',
            excerpt: topic.Text,
            trustSignals: {
              authoritative: false,
              independentConfirmation: true,
            },
          });
        }
      });
    }

    return results;
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch('https://duckduckgo.com', { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

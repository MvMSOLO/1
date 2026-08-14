import { SearchProvider } from '../../core/retrieval/SearchProvider.ts';
import { SearchIntent, Source } from '../../types/index.ts';

export class GitHubProvider implements SearchProvider {
  id = 'github';

  async search(intent: SearchIntent, signal?: AbortSignal): Promise<Source[]> {
    const q = intent.rawQuery;
    try {
      const url = `https://api.github.com/search/repositories?q=${encodeURIComponent(
        q
      )}&per_page=5`;

      const response = await fetch(url, {
        signal,
        headers: {
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      const items = data.items || [];

      return items.map((item: any) => ({
        id: `github-${item.id}`,
        provider: 'github',
        canonicalUrl: item.html_url,
        title: item.full_name,
        publisher: item.owner?.login,
        retrievedAt: new Date().toISOString(),
        publishedAt: item.created_at,
        updatedAt: item.updated_at,
        sourceType: 'repository',
        excerpt: item.description || 'No description available.',
        trustSignals: {
          independentConfirmation: false,
          citationCount: item.stargazers_count,
        },
      } as Source));
    } catch {
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch('https://api.github.com', { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

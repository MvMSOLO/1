import { SearchProvider } from '../../core/retrieval/SearchProvider.ts';
import { SearchIntent, Source } from '../../types/index.ts';

export class OpenLibraryProvider implements SearchProvider {
  id = 'openlibrary';

  async search(intent: SearchIntent, signal?: AbortSignal): Promise<Source[]> {
    const q = intent.rawQuery;
    try {
      const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(
        q
      )}&limit=5`;

      const response = await fetch(url, { signal });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      const docs = data.docs || [];

      return docs.map((doc: any, index: number) => {
        const key = doc.key ? doc.key.replace('/works/', '') : index;
        return {
          id: `openlibrary-${key}`,
          provider: 'openlibrary',
          canonicalUrl: doc.key ? `https://openlibrary.org${doc.key}` : 'https://openlibrary.org',
          title: doc.title,
          publisher: doc.publisher ? doc.publisher[0] : undefined,
          author: doc.author_name ? doc.author_name[0] : undefined,
          publishedAt: doc.first_publish_year ? String(doc.first_publish_year) : undefined,
          retrievedAt: new Date().toISOString(),
          sourceType: 'book',
          excerpt: doc.subject ? `Subjects: ${doc.subject.slice(0, 5).join(', ')}` : 'No subject metadata found.',
          trustSignals: {
            authoritative: true,
          },
        } as Source;
      });
    } catch {
      return [];
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const res = await fetch('https://openlibrary.org', { method: 'HEAD' });
      return res.ok;
    } catch {
      return false;
    }
  }
}

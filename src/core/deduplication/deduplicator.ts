import { Source } from '../../types/index.ts';

/**
 * Compute Jaccard Similarity between two strings based on lowercase words (tokens)
 */
export function getJaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().match(/\b\w+\b/g) || []);
  const wordsB = new Set(b.toLowerCase().match(/\b\w+\b/g) || []);

  if (wordsA.size === 0 && wordsB.size === 0) return 1;

  const intersection = new Set([...wordsA].filter(x => wordsB.has(x)));
  const union = new Set([...wordsA, ...wordsB]);

  return intersection.size / union.size;
}

/**
 * Deduplicates and clusters sources.
 * Sets `duplicateOf`, `similarityScore`, and `independenceScore` properties.
 */
export function deduplicateSources(sources: Source[]): Source[] {
  const result: Source[] = [];

  for (const src of sources) {
    let duplicateOf: string | undefined;
    let maxSimilarity = 0;

    // Check against already added sources
    for (const finalSrc of result) {
      // 1. Same canonical URL
      if (src.canonicalUrl === finalSrc.canonicalUrl) {
        duplicateOf = finalSrc.id;
        maxSimilarity = 1.0;
        break;
      }

      // 2. Strong title + content Jaccard similarity
      const titleSim = getJaccardSimilarity(src.title, finalSrc.title);
      const excerptSim = getJaccardSimilarity(src.excerpt || '', finalSrc.excerpt || '');
      const averageSim = (titleSim + excerptSim) / 2;

      if (averageSim > 0.65) {
        duplicateOf = finalSrc.id;
        maxSimilarity = averageSim;
        break;
      }
    }

    if (duplicateOf) {
      src.duplicateOf = duplicateOf;
      src.similarityScore = maxSimilarity;
      src.independenceScore = Math.max(0.1, 1.0 - maxSimilarity);
    } else {
      src.independenceScore = 1.0;
    }

    result.push(src);
  }

  return result;
}

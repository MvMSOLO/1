import { SearchIntent } from '../../types/index.ts';

export function classifyQuery(query: string): SearchIntent {
  const raw = query.trim();
  const lower = raw.toLowerCase();

  // Normalize query: remove excessive spaces, punctuation that won't help
  const normalized = lower
    .replace(/[?.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Basic entity/topic heuristic extraction
  const topics: string[] = [];
  const entities: Array<{ name: string; type: string }> = [];

  // Match entities
  if (lower.includes('react')) {
    entities.push({ name: 'React', type: 'Framework' });
    topics.push('Web Development');
  }
  if (lower.includes('vue')) {
    entities.push({ name: 'Vue', type: 'Framework' });
    topics.push('Web Development');
  }
  if (lower.includes('black hole')) {
    entities.push({ name: 'Black Hole', type: 'Astronomical Object' });
    topics.push('Astrophysics');
  }
  if (lower.includes('counter-strike') || lower.includes('cs 1.6')) {
    entities.push({ name: 'Counter-Strike 1.6', type: 'Video Game' });
    topics.push('Gaming Troubleshooting');
  }

  // Determine queryType
  let queryType: SearchIntent['queryType'] = 'factual';

  if (
    lower.includes('compare') ||
    lower.includes('difference') ||
    lower.includes('vs') ||
    lower.includes('versus') ||
    lower.includes('or') && (lower.includes('better') || lower.includes('prefer'))
  ) {
    queryType = 'comparative';
  } else if (
    lower.includes('freeze') ||
    lower.includes('crash') ||
    lower.includes('lag') ||
    lower.includes('trouble') ||
    lower.includes('fix') ||
    lower.includes('why does') && lower.includes('only when') ||
    lower.includes('how do i') && (lower.includes('solve') || lower.includes('repair'))
  ) {
    queryType = 'troubleshooting';
  } else if (
    lower.includes('history') ||
    lower.includes('timeline') ||
    lower.includes('who created') ||
    lower.includes('year') ||
    lower.includes('when did') ||
    lower.includes('origins')
  ) {
    queryType = 'historical';
  } else if (
    lower.includes('explain') ||
    lower.includes('why') ||
    lower.includes('how does') ||
    lower.includes('for a beginner')
  ) {
    queryType = 'explanatory';
  } else if (
    lower.includes('research') ||
    lower.includes('find the original source') ||
    lower.includes('study') ||
    lower.includes('papers')
  ) {
    queryType = 'research';
  } else if (
    lower.includes('what is') ||
    lower.includes('definition of') ||
    lower.includes('define')
  ) {
    queryType = 'definition';
  }

  return {
    rawQuery: raw,
    normalizedQuery: normalized,
    language: 'en',
    topics,
    entities,
    queryType,
  };
}

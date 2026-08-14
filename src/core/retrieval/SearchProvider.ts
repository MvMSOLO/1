import { SearchIntent, Source } from '../../types/index.ts';

export interface SearchProvider {
  id: string;
  search(intent: SearchIntent, signal?: AbortSignal): Promise<Source[]>;
  healthCheck?(): Promise<boolean>;
}

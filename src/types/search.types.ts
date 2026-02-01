

export type SearchResultType = 'course' | 'category' | 'user' | 'certificate';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  
  category?: string;
  status?: string;
  date?: string | number;
}

export interface SearchFilters {
  types?: SearchResultType[];
  categories?: string[];
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
}

export interface SearchOptions {
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title' | 'popularity';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  hasMore: boolean;
  query: string;
  executionTime: number;
}

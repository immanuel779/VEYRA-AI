import { tavily } from '@tavily/core';
import { env } from '../config/env';

const tavilyClient = env.TAVILY_API_KEY
  ? tavily({ apiKey: env.TAVILY_API_KEY })
  : null;

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface SearchResponse {
  answer: string | null;
  results: SearchResult[];
}

export async function webSearch(query: string): Promise<SearchResponse> {
  if (!tavilyClient) {
    return { answer: null, results: [] };
  }

  try {
    const response = await tavilyClient.search(query, {
      searchDepth: 'basic',
      maxResults: 5,
      includeAnswer: true,
      includeRawContent: false,
    });

    return {
      answer: typeof response.answer === 'string' ? response.answer : null,
      results: (response.results || []).map((r) => ({
        title: r.title || '',
        url: r.url || '',
        content: r.content || '',
        score: r.score || 0,
      })),
    };
  } catch (err) {
    console.error('[search] Tavily search failed:', (err as Error).message);
    return { answer: null, results: [] };
  }
}

export function isSearchConfigured(): boolean {
  return tavilyClient !== null;
}

export function formatSearchResultsForAI(response: SearchResponse): string {
  if (response.results.length === 0) {
    return 'No search results found.';
  }

  const lines: string[] = [];

  if (response.answer) {
    lines.push(`Summary: ${response.answer}`);
    lines.push('');
  }

  lines.push('Sources:');
  response.results.forEach((r, i) => {
    lines.push(`[${i + 1}] ${r.title}`);
    lines.push(`    URL: ${r.url}`);
    lines.push(`    ${r.content.slice(0, 500)}`);
    lines.push('');
  });

  return lines.join('\n');
}

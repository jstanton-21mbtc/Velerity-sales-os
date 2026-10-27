/**
 * Tavily search API client.
 * Docs: https://docs.tavily.com/docs/rest-api/api-reference
 */

export type TavilyResult = {
  title: string;
  url: string;
  content: string;
  score: number;
};

export type TavilyResponse = {
  results: TavilyResult[];
  query: string;
};

export async function tavilySearch(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeAnswer?: boolean;
  } = {}
): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) throw new Error("TAVILY_API_KEY is not set");

  const body = {
    api_key: apiKey,
    query,
    max_results: options.maxResults ?? 5,
    search_depth: options.searchDepth ?? "basic",
    include_answer: options.includeAnswer ?? false,
  };

  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Tavily API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<TavilyResponse>;
}

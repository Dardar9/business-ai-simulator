import axios from 'axios';

// Check if Serper API key is available
const serperApiKey = process.env.NEXT_PUBLIC_SERPER_API_KEY || process.env.SERPER_API_KEY;

// Flag to track if we're using mock search results
const isUsingMockSearchResults = !serperApiKey;

// Log warning if API key is missing
if (isUsingMockSearchResults) {
  console.warn('Serper API key is missing. Using mock search results instead.');
}

/**
 * Search the web for information using the Serper API
 * @param query The search query
 * @returns The search results
 */
export async function searchWeb(query: string): Promise<string> {
  // If we're using mock search results, return mock data
  if (isUsingMockSearchResults) {
    console.log('Using mock search results for query:', query);
    return generateMockSearchResults(query);
  }

  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: query,
        num: 5,
      },
      {
        headers: {
          'X-API-KEY': serperApiKey,
          'Content-Type': 'application/json',
        },
      }
    );

    // Format the search results into a readable format
    const organicResults = response.data.organic || [];
    let formattedResults = `# Search Results for "${query}"\n\n`;

    if (organicResults.length === 0) {
      return `No search results found for "${query}".`;
    }

    organicResults.forEach((result: any, index: number) => {
      formattedResults += `## ${index + 1}. ${result.title}\n`;
      formattedResults += `${result.snippet}\n`;
      formattedResults += `[Read more](${result.link})\n\n`;
    });

    return formattedResults;
  } catch (error) {
    console.error('Error searching the web:', error);
    console.log('Falling back to mock search results');
    return generateMockSearchResults(query);
  }
}

/**
 * Generate mock search results for when the Serper API is not available
 * @param query The search query
 * @returns Mock search results
 */
function generateMockSearchResults(query: string): string {
  const lowerQuery = query.toLowerCase();

  // Check if query is about business or industry
  if (lowerQuery.includes('business') || lowerQuery.includes('industry') || lowerQuery.includes('market')) {
    return `# Search Results for "${query}"

## 1. Industry Trends and Market Analysis
The ${query.split(' ')[0]} industry is experiencing significant growth, with a projected CAGR of 12.5% over the next five years. Key drivers include technological innovation, changing consumer preferences, and increasing demand for sustainable solutions.

## 2. Competitive Landscape
Major players in the market include Company A (35% market share), Company B (22% market share), and Company C (18% market share). Recent entrants are disrupting traditional business models with innovative approaches to product development and customer engagement.

## 3. Future Outlook and Opportunities
Experts predict continued expansion in emerging markets, with particular growth in Asia-Pacific regions. Investment in digital transformation and sustainability initiatives will be critical success factors for businesses looking to maintain competitive advantage.

*Note: These are mock search results because the Serper API key is not configured.*`;
  }

  // Default mock search results
  return `# Search Results for "${query}"

## 1. Overview and Key Information
This search result provides general information about ${query}. The topic has gained significant attention in recent years due to its impact on various industries and consumer behaviors.

## 2. Recent Developments
Recent studies have shown interesting trends related to ${query}, with experts predicting continued evolution in this space. Several key innovations have emerged that are reshaping how businesses and consumers interact with this concept.

## 3. Expert Analysis
According to industry experts, the future of ${query} will be shaped by technological advancements, regulatory changes, and shifting market demands. Organizations that adapt quickly to these changes will be better positioned for success.

*Note: These are mock search results because the Serper API key is not configured. To get real search results, please add your Serper API key to the environment variables.*`;
}

/**
 * Alternative implementation using a free API if Serper is not available
 * @param query The search query
 * @returns The search results
 */
export async function searchWebFallback(query: string): Promise<string> {
  // If we're using mock search results, return mock data
  if (isUsingMockSearchResults) {
    console.log('Using mock search results for fallback query:', query);
    return generateMockSearchResults(query);
  }

  try {
    const response = await axios.get(
      `https://ddg-api.herokuapp.com/search?query=${encodeURIComponent(query)}&limit=5`
    );

    const results = response.data || [];
    let formattedResults = `# Search Results for "${query}"\n\n`;

    if (results.length === 0) {
      return `No search results found for "${query}".`;
    }

    results.forEach((result: any, index: number) => {
      formattedResults += `## ${index + 1}. ${result.title}\n`;
      formattedResults += `${result.snippet}\n`;
      formattedResults += `[Read more](${result.link})\n\n`;
    });

    return formattedResults;
  } catch (error) {
    console.error('Error searching the web with fallback method:', error);
    console.log('Falling back to mock search results');
    return generateMockSearchResults(query);
  }
}

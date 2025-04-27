import axios from 'axios';

/**
 * Search the web for information using the Serper API
 * @param query The search query
 * @returns The search results
 */
export async function searchWeb(query: string): Promise<string> {
  try {
    // Check if API key is available
    const apiKey = process.env.SERPER_API_KEY;
    if (!apiKey) {
      console.error('SERPER_API_KEY is not defined in environment variables');
      return `No search results available. Please configure the SERPER_API_KEY environment variable.`;
    }

    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: query,
        num: 5,
      },
      {
        headers: {
          'X-API-KEY': apiKey,
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
    return `Error searching for "${query}". Please try again later.`;
  }
}

/**
 * Alternative implementation using a free API if Serper is not available
 * @param query The search query
 * @returns The search results
 */
export async function searchWebFallback(query: string): Promise<string> {
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
    return `Error searching for "${query}". Please try again later.`;
  }
}

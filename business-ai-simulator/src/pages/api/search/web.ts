import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { query, num = 5 } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Get the API key from server-side environment variable
    const serperApiKey = process.env.SERPER_API_KEY;
    
    if (!serperApiKey) {
      return res.status(500).json({ error: 'Serper API key is not configured' });
    }

    console.log('Searching web for query:', query);
    
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: query,
        num: Number(num),
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
      formattedResults = `No search results found for "${query}".`;
    } else {
      organicResults.forEach((result: any, index: number) => {
        formattedResults += `## ${index + 1}. ${result.title}\n`;
        formattedResults += `${result.snippet}\n`;
        formattedResults += `[Read more](${result.link})\n\n`;
      });
    }

    return res.status(200).json({ 
      results: formattedResults,
      rawResults: response.data,
    });
  } catch (error: any) {
    console.error('Serper API error:', error);
    return res.status(500).json({ 
      error: 'Error searching the web', 
      message: error.message || 'Unknown error'
    });
  }
}

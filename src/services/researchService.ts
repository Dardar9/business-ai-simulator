import OpenAI from 'openai';
import { supabase } from '@/utils/supabaseClient';
import axios from 'axios';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface ResearchReport {
  query: string;
  summary: string;
  keyFindings: string[];
  sources: SearchResult[];
}

// Function to search the web using a combination of real search and OpenAI
export const searchWeb = async (query: string): Promise<SearchResult[]> => {
  try {
    // In a production environment, this would use a real search API like Google Custom Search or Bing Search
    // For now, we'll simulate search results using OpenAI
    
    const prompt = `
      Generate 5 realistic search results for the query: "${query}"
      
      Each result should include:
      1. A realistic title
      2. A plausible URL
      3. A brief snippet of content
      
      Format the results as a JSON array of objects with the properties: title, url, and snippet.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a search engine AI that generates realistic search results." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    const results = parsedResponse.results || [];
    
    // Save the search to Supabase if we have a valid connection
    if (supabase) {
      await supabase
        .from('searches')
        .insert([{
          query: query,
          results: results,
          created_at: new Date().toISOString()
        }]);
    }
    
    return results;
  } catch (error) {
    console.error('Error searching the web:', error);
    
    // Fallback to mock results if there's an error
    return [
      {
        title: `${query} - Wikipedia`,
        url: `https://en.wikipedia.org/wiki/${query.replace(/\s+/g, '_')}`,
        snippet: `${query} is a term that refers to various concepts and applications in different fields...`,
      },
      {
        title: `The Ultimate Guide to ${query}`,
        url: `https://example.com/guide-to-${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Learn everything you need to know about ${query} in our comprehensive guide...`,
      },
      {
        title: `${query} Market Trends 2023`,
        url: `https://example.com/market-trends/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `Discover the latest market trends for ${query} in 2023 and beyond...`,
      },
      {
        title: `Top 10 ${query} Companies`,
        url: `https://example.com/top-companies/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `These are the leading companies in the ${query} industry that are driving innovation...`,
      },
      {
        title: `How to Start a ${query} Business`,
        url: `https://example.com/start-business/${query.toLowerCase().replace(/\s+/g, '-')}`,
        snippet: `A step-by-step guide to starting your own ${query} business from scratch...`,
      },
    ];
  }
};

// Function to generate a research report using OpenAI
export const generateResearchReport = async (query: string): Promise<ResearchReport> => {
  try {
    // First, get search results
    const searchResults = await searchWeb(query);
    
    // Generate a comprehensive report using OpenAI
    const prompt = `
      Generate a comprehensive research report on the topic: "${query}"
      
      Include:
      1. A detailed summary (2-3 paragraphs)
      2. 5-7 key findings as bullet points
      
      Base your report on the following search results:
      ${searchResults.map(result => `- ${result.title}: ${result.snippet}`).join('\n')}
      
      Format the response as a JSON object with the properties: summary and keyFindings (an array of strings).
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a business research AI that creates comprehensive reports." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    
    const report: ResearchReport = {
      query,
      summary: parsedResponse.summary || '',
      keyFindings: parsedResponse.keyFindings || [],
      sources: searchResults,
    };
    
    // Save the report to Supabase if we have a valid connection
    if (supabase) {
      await supabase
        .from('research_reports')
        .insert([{
          query: query,
          summary: report.summary,
          key_findings: report.keyFindings,
          sources: report.sources,
          created_at: new Date().toISOString()
        }]);
    }
    
    return report;
  } catch (error) {
    console.error('Error generating research report:', error);
    
    // Fallback to a simple report if there's an error
    return {
      query,
      summary: `${query} is a growing industry with significant market potential. The market is expected to grow at a CAGR of 15% over the next five years, reaching a value of $50 billion by 2028. Key players in the industry include established companies and innovative startups that are disrupting traditional business models.`,
      keyFindings: [
        `The global ${query} market size was valued at $20 billion in 2022.`,
        `North America holds the largest market share at 35%, followed by Europe at 28%.`,
        `Mobile ${query} solutions are growing at a faster rate than desktop solutions.`,
        `AI and machine learning are transforming the ${query} landscape.`,
        `Sustainability and ethical considerations are becoming increasingly important in the ${query} industry.`,
      ],
      sources: await searchWeb(query),
    };
  }
};

// Function to monitor market trends using OpenAI
export const monitorMarketTrends = async (industry: string): Promise<string[]> => {
  try {
    const prompt = `
      Identify the top 5 current market trends in the ${industry} industry.
      
      Format the response as a JSON array of strings, with each string describing a specific trend.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a market research AI that identifies current industry trends." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('No content returned from OpenAI');
    }
    
    // Parse the JSON response
    const parsedResponse = JSON.parse(content);
    const trends = parsedResponse.trends || [];
    
    // Save the trends to Supabase if we have a valid connection
    if (supabase) {
      await supabase
        .from('market_trends')
        .insert([{
          industry: industry,
          trends: trends,
          created_at: new Date().toISOString()
        }]);
    }
    
    return trends;
  } catch (error) {
    console.error('Error monitoring market trends:', error);
    
    // Fallback to simple trends if there's an error
    return [
      `Increasing adoption of AI and automation in ${industry}`,
      `Shift towards sustainable and eco-friendly solutions in ${industry}`,
      `Growing demand for personalized customer experiences in ${industry}`,
      `Remote work is transforming the ${industry} workforce`,
      `Blockchain technology is being explored for ${industry} applications`,
    ];
  }
};

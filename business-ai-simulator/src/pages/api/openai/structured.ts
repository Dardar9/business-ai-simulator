import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// Initialize the OpenAI client with server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, model = 'gpt-3.5-turbo', temperature = 0.7 } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating structured OpenAI response for prompt:', prompt.substring(0, 50) + '...');
    
    // Request JSON response from OpenAI
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful assistant that always responds in valid JSON format.'
        },
        { 
          role: 'user', 
          content: prompt 
        }
      ],
      temperature,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    
    // Parse the JSON response
    try {
      const parsedResponse = JSON.parse(content || '{}');
      return res.status(200).json({ 
        result: parsedResponse,
        usage: response.usage
      });
    } catch (parseError) {
      console.error('Error parsing OpenAI JSON response:', parseError);
      return res.status(500).json({ 
        error: 'Error parsing JSON response', 
        rawContent: content
      });
    }
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Error generating structured response', 
      message: error.message || 'Unknown error'
    });
  }
}

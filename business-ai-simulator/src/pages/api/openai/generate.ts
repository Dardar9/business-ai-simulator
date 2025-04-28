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
    const { prompt, model = 'gpt-3.5-turbo', temperature = 0.7, max_tokens } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log('Generating OpenAI response for prompt:', prompt.substring(0, 50) + '...');
    
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      ...(max_tokens ? { max_tokens } : {}),
    });

    return res.status(200).json({ 
      result: response.choices[0].message.content,
      usage: response.usage
    });
  } catch (error: any) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ 
      error: 'Error generating response', 
      message: error.message || 'Unknown error'
    });
  }
}

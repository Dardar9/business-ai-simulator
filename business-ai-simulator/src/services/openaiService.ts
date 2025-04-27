import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a response from OpenAI
 * @param prompt The prompt to send to OpenAI
 * @param model The model to use (defaults to gpt-4)
 * @param temperature The temperature to use (defaults to 0.7)
 * @returns The generated text
 */
export async function generateOpenAIResponse(
  prompt: string,
  model: string = 'gpt-4',
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    throw error;
  }
}

/**
 * Generate a structured response from OpenAI
 * @param prompt The prompt to send to OpenAI
 * @param model The model to use (defaults to gpt-4)
 * @param temperature The temperature to use (defaults to 0.7)
 * @returns The parsed JSON response
 */
export async function generateStructuredResponse<T>(
  prompt: string,
  model: string = 'gpt-4',
  temperature: number = 0.7
): Promise<T> {
  try {
    const enhancedPrompt = `
${prompt}

Please provide your response in valid JSON format only, with no additional text or explanations.
`;

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: enhancedPrompt }],
      temperature,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content) as T;
  } catch (error) {
    console.error('Error generating structured OpenAI response:', error);
    throw error;
  }
}

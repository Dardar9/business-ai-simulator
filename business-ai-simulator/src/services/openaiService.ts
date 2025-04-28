// No need to import OpenAI directly anymore
// We'll use our secure API routes instead

// Flag to track if we're in a browser environment
// This helps us determine if we should use mock responses for SSR
const isBrowser = typeof window !== 'undefined';

// We'll check if we're in development mode to show appropriate warnings
const isDevelopment = process.env.NODE_ENV === 'development';

// Flag to track if we should use mock responses
// We'll always use real responses in production through our API routes
const isUsingMockResponses = isDevelopment && !isBrowser;

// Log warning if we're using mock responses in development
if (isUsingMockResponses && isDevelopment) {
  console.warn('Using mock responses for server-side rendering in development mode.');
}

/**
 * Generate a response from OpenAI
 * @param prompt The prompt to send to OpenAI
 * @param model The model to use (defaults to gpt-4)
 * @param temperature The temperature to use (defaults to 0.7)
 * @returns The generated text
 */
export async function generateOpenAIResponse(
  prompt: string,
  model: string = 'gpt-3.5-turbo',
  temperature: number = 0.7
): Promise<string> {
  // If we're using mock responses (for SSR in development), return a mock response
  if (isUsingMockResponses) {
    console.log('Using mock response for prompt:', prompt.substring(0, 50) + '...');
    return generateMockResponse(prompt);
  }

  try {
    // Call our secure API route instead of using the OpenAI SDK directly
    const response = await fetch('/api/openai/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error calling OpenAI API');
    }

    const data = await response.json();
    return data.result || '';
  } catch (error) {
    console.error('Error generating OpenAI response:', error);
    console.log('Falling back to mock response');
    return generateMockResponse(prompt);
  }
}

/**
 * Generate a mock response for when OpenAI is not available
 * @param prompt The prompt that would have been sent to OpenAI
 * @returns A mock response
 */
function generateMockResponse(prompt: string): string {
  // Extract key information from the prompt
  const keywords = prompt.toLowerCase().split(' ');

  if (prompt.includes('business') && prompt.includes('report')) {
    return `# Business Report

## Executive Summary
This is an automatically generated mock report. The OpenAI API key is not configured.

## Business Overview
This report provides an overview of the business and its current status.

## Key Findings
- The business is showing potential for growth
- There are opportunities for expansion in new markets
- Customer satisfaction remains a priority

## Recommendations
1. Invest in marketing and brand awareness
2. Explore partnerships with complementary businesses
3. Focus on customer retention strategies

*This is a mock response because the OpenAI API key is not configured.*`;
  }

  if (prompt.includes('agent') || prompt.includes('role')) {
    return `As an AI agent, I would approach this task methodically. First, I would analyze the requirements and break them down into manageable components. Then, I would develop a strategic plan that leverages my expertise in this domain. Finally, I would implement the solution while monitoring for any potential issues.

Note: This is a mock response because the OpenAI API key is not configured.`;
  }

  // Default generic response
  return `Thank you for your prompt. This is a mock response because the OpenAI API key is not configured in the environment variables. Please add your OpenAI API key to use the actual AI-powered responses.

To add your API key:
1. Go to your Vercel project settings
2. Add OPENAI_API_KEY as an environment variable
3. Deploy again with the updated configuration

For now, I'm providing this placeholder response instead of the AI-generated content you would normally receive.`;
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
  model: string = 'gpt-3.5-turbo',
  temperature: number = 0.7
): Promise<T> {
  // If we're using mock responses (for SSR in development), return a mock structured response
  if (isUsingMockResponses) {
    console.log('Using mock structured response for prompt:', prompt.substring(0, 50) + '...');
    return generateMockStructuredResponse<T>(prompt);
  }

  try {
    // Enhance the prompt to ensure we get a proper JSON response
    const enhancedPrompt = `
${prompt}

Please provide your response in valid JSON format only, with no additional text or explanations.
`;

    // Call our secure API route instead of using the OpenAI SDK directly
    const response = await fetch('/api/openai/structured', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        model,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error calling OpenAI API for structured response');
    }

    const data = await response.json();
    return data.result as T;
  } catch (error) {
    console.error('Error generating structured OpenAI response:', error);
    console.log('Falling back to mock structured response');
    return generateMockStructuredResponse<T>(prompt);
  }
}

/**
 * Generate a mock structured response for when OpenAI is not available
 * @param prompt The prompt that would have been sent to OpenAI
 * @returns A mock structured response
 */
function generateMockStructuredResponse<T>(prompt: string): T {
  // Check if the prompt is asking for agents
  if (prompt.toLowerCase().includes('role') && prompt.toLowerCase().includes('business')) {
    // This is likely asking for AI agents for a business
    const mockAgentsResponse = [
      {
        "role": "CEO",
        "name": "Alex Morgan",
        "description": "Chief Executive Officer responsible for overall business strategy and leadership.",
        "skills": ["Leadership", "Strategic Planning", "Decision Making", "Business Development"]
      },
      {
        "role": "CTO",
        "name": "Jamie Chen",
        "description": "Chief Technology Officer overseeing all technical aspects and innovation.",
        "skills": ["Software Architecture", "Technical Leadership", "Innovation Management", "System Design"]
      },
      {
        "role": "CFO",
        "name": "Taylor Reynolds",
        "description": "Chief Financial Officer managing financial planning, risk management, and reporting.",
        "skills": ["Financial Analysis", "Budgeting", "Risk Management", "Strategic Planning"]
      },
      {
        "role": "CMO",
        "name": "Jordan Smith",
        "description": "Chief Marketing Officer leading brand strategy and marketing initiatives.",
        "skills": ["Brand Strategy", "Digital Marketing", "Market Analysis", "Customer Acquisition"]
      },
      {
        "role": "COO",
        "name": "Casey Williams",
        "description": "Chief Operating Officer ensuring efficient business operations and processes.",
        "skills": ["Operations Management", "Process Optimization", "Team Leadership", "Strategic Implementation"]
      }
    ];

    return mockAgentsResponse as unknown as T;
  }

  // Default generic structured response
  const mockDefaultResponse = {
    "message": "This is a mock structured response because the OpenAI API key is not configured.",
    "status": "mock",
    "timestamp": new Date().toISOString(),
    "data": {
      "note": "Please configure your OpenAI API key in the environment variables to use the actual AI service."
    }
  };

  return mockDefaultResponse as unknown as T;
}

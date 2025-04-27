import { Agent as ModelAgent, AgentRole, Business as ModelBusiness } from '@/models/Business';
import { Agent, Business } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { generateOpenAIResponse, generateStructuredResponse } from './openaiService';
import { searchWeb } from './webSearchService';

// This is a mock service that would be replaced with actual AI API calls in a production environment

interface AgentTemplate {
  role: AgentRole;
  name: string;
  description: string;
  skills: string[];
  avatar: string;
}

const defaultAgentTemplates: Record<string, AgentTemplate> = {
  [AgentRole.CEO]: {
    role: AgentRole.CEO,
    name: 'AI CEO',
    description: 'Chief Executive Officer responsible for overall business strategy and leadership.',
    skills: ['Leadership', 'Strategy', 'Decision Making', 'Business Development'],
    avatar: '/avatars/ceo.png',
  },
  [AgentRole.CTO]: {
    role: AgentRole.CTO,
    name: 'AI CTO',
    description: 'Chief Technology Officer responsible for technical strategy and implementation.',
    skills: ['Technical Leadership', 'Software Architecture', 'Innovation', 'Team Management'],
    avatar: '/avatars/cto.png',
  },
  [AgentRole.CFO]: {
    role: AgentRole.CFO,
    name: 'AI CFO',
    description: 'Chief Financial Officer responsible for financial planning and management.',
    skills: ['Financial Planning', 'Risk Management', 'Budgeting', 'Investment Strategy'],
    avatar: '/avatars/cfo.png',
  },
  [AgentRole.CMO]: {
    role: AgentRole.CMO,
    name: 'AI CMO',
    description: 'Chief Marketing Officer responsible for marketing strategy and brand management.',
    skills: ['Marketing Strategy', 'Brand Management', 'Market Analysis', 'Customer Acquisition'],
    avatar: '/avatars/cmo.png',
  },
  [AgentRole.COO]: {
    role: AgentRole.COO,
    name: 'AI COO',
    description: 'Chief Operating Officer responsible for day-to-day operations and execution.',
    skills: ['Operations Management', 'Process Optimization', 'Team Leadership', 'Project Management'],
    avatar: '/avatars/coo.png',
  },
  [AgentRole.MARKETING_SPECIALIST]: {
    role: AgentRole.MARKETING_SPECIALIST,
    name: 'AI Marketing Specialist',
    description: 'Marketing specialist responsible for promoting the business and its products.',
    skills: ['Digital Marketing', 'Content Creation', 'Market Research', 'Brand Strategy'],
    avatar: '/avatars/marketing.png',
  },
  [AgentRole.SALES_MANAGER]: {
    role: AgentRole.SALES_MANAGER,
    name: 'AI Sales Manager',
    description: 'Sales manager responsible for driving revenue and managing the sales team.',
    skills: ['Sales Strategy', 'Customer Relationship Management', 'Negotiation', 'Team Leadership'],
    avatar: '/avatars/sales.png',
  },
  [AgentRole.PRODUCT_MANAGER]: {
    role: AgentRole.PRODUCT_MANAGER,
    name: 'AI Product Manager',
    description: 'Product manager responsible for product development and lifecycle management.',
    skills: ['Product Strategy', 'User Experience', 'Market Research', 'Roadmap Planning'],
    avatar: '/avatars/product.png',
  },
  [AgentRole.AI_ENGINEER]: {
    role: AgentRole.AI_ENGINEER,
    name: 'AI Engineer',
    description: 'AI Engineer responsible for developing and implementing AI solutions.',
    skills: ['Machine Learning', 'Data Science', 'Software Development', 'Problem Solving'],
    avatar: '/avatars/engineer.png',
  },
  [AgentRole.SOFTWARE_DEVELOPER]: {
    role: AgentRole.SOFTWARE_DEVELOPER,
    name: 'AI Software Developer',
    description: 'Software developer responsible for building and maintaining software applications.',
    skills: ['Programming', 'Software Architecture', 'Problem Solving', 'Testing'],
    avatar: '/avatars/developer.png',
  },
  [AgentRole.DATA_SCIENTIST]: {
    role: AgentRole.DATA_SCIENTIST,
    name: 'AI Data Scientist',
    description: 'Data scientist responsible for analyzing data and extracting insights.',
    skills: ['Data Analysis', 'Machine Learning', 'Statistics', 'Data Visualization'],
    avatar: '/avatars/data-scientist.png',
  },
  [AgentRole.BUSINESS_ANALYST]: {
    role: AgentRole.BUSINESS_ANALYST,
    name: 'AI Business Analyst',
    description: 'Business analyst responsible for analyzing business processes and requirements.',
    skills: ['Business Analysis', 'Process Modeling', 'Requirements Gathering', 'Data Analysis'],
    avatar: '/avatars/analyst.png',
  },
  [AgentRole.HR_MANAGER]: {
    role: AgentRole.HR_MANAGER,
    name: 'AI HR Manager',
    description: 'HR manager responsible for human resources management and employee relations.',
    skills: ['Recruitment', 'Employee Relations', 'Performance Management', 'Training and Development'],
    avatar: '/avatars/hr.png',
  },
  [AgentRole.CUSTOMER_SUPPORT]: {
    role: AgentRole.CUSTOMER_SUPPORT,
    name: 'AI Customer Support',
    description: 'Customer support specialist responsible for assisting customers and resolving issues.',
    skills: ['Customer Service', 'Problem Solving', 'Communication', 'Product Knowledge'],
    avatar: '/avatars/support.png',
  },
};

// Function to generate agents based on business type
export const generateAgentsForBusiness = async (businessType: string, businessDescription: string): Promise<Agent[]> => {
  try {
    // First, try to use OpenAI to generate appropriate agents
    const prompt = `
You are an AI business consultant tasked with creating a team of AI agents for a new business.

Business Type: ${businessType}
Business Description: ${businessDescription}

Based on this business type and description, determine the most appropriate roles for this business.
Choose from the following roles:
${Object.values(AgentRole).map(role => `- ${role}`).join('\n')}

For each role you select, provide:
1. A brief description of their responsibilities
2. A list of 4-5 key skills they should have

Return a JSON array of objects with the following structure:
[
  {
    "role": "CEO",
    "name": "AI CEO",
    "description": "Chief Executive Officer responsible for...",
    "skills": ["Leadership", "Strategy", "Decision Making", "Business Development"]
  },
  ...
]

Include at least 5 roles, but no more than 8 roles. Always include a CEO role.
`;

    interface AIGeneratedAgent {
      role: string;
      name: string;
      description: string;
      skills: string[];
    }

    // Try to get AI-generated agents
    try {
      const aiGeneratedAgents = await generateStructuredResponse<AIGeneratedAgent[]>(prompt);

      // Validate and map the AI-generated agents to our Agent type
      if (Array.isArray(aiGeneratedAgents) && aiGeneratedAgents.length >= 3) {
        return aiGeneratedAgents.map(agent => {
          // Find the matching AgentRole enum value
          const roleKey = Object.keys(AgentRole).find(
            key => AgentRole[key as keyof typeof AgentRole] === agent.role
          );

          // If we found a matching role, use the template avatar, otherwise use a default
          const avatar = roleKey
            ? defaultAgentTemplates[AgentRole[roleKey as keyof typeof AgentRole]].avatar
            : '/avatars/default.png';

          return {
            id: uuidv4(),
            role: agent.role,
            name: agent.name || `AI ${agent.role}`,
            description: agent.description,
            skills: agent.skills || [],
            avatar
          };
        });
      }
    } catch (error) {
      console.error('Error generating agents with AI:', error);
      // Fall back to rule-based approach if AI fails
    }

    // Fallback: Use rule-based approach if AI generation fails
    console.log('Falling back to rule-based agent generation');

    const standardRoles = [
      AgentRole.CEO,
      AgentRole.CTO,
      AgentRole.CFO,
      AgentRole.MARKETING_SPECIALIST,
    ];

    // Add additional roles based on business type
    let additionalRoles: AgentRole[] = [];

    if (businessType.toLowerCase().includes('tech') || businessType.toLowerCase().includes('software')) {
      additionalRoles = [
        AgentRole.SOFTWARE_DEVELOPER,
        AgentRole.PRODUCT_MANAGER,
        AgentRole.DATA_SCIENTIST,
      ];
    } else if (businessType.toLowerCase().includes('retail') || businessType.toLowerCase().includes('ecommerce')) {
      additionalRoles = [
        AgentRole.SALES_MANAGER,
        AgentRole.CUSTOMER_SUPPORT,
        AgentRole.BUSINESS_ANALYST,
      ];
    } else if (businessType.toLowerCase().includes('marketing') || businessType.toLowerCase().includes('agency')) {
      additionalRoles = [
        AgentRole.CMO,
        AgentRole.MARKETING_SPECIALIST,
        AgentRole.BUSINESS_ANALYST,
      ];
    } else {
      // For other business types, add some general roles
      additionalRoles = [
        AgentRole.COO,
        AgentRole.BUSINESS_ANALYST,
        AgentRole.HR_MANAGER,
      ];
    }

    // Create a combined array without duplicates
    const combinedRoles = [...standardRoles, ...additionalRoles];
    const allRoles = Array.from(new Set(combinedRoles));

    // Create agents from templates
    return allRoles.map(role => ({
      id: uuidv4(),
      ...defaultAgentTemplates[role],
    }));
  } catch (error) {
    console.error('Error in generateAgentsForBusiness:', error);

    // Return a minimal set of agents if everything fails
    return [
      {
        id: uuidv4(),
        ...defaultAgentTemplates[AgentRole.CEO],
      },
      {
        id: uuidv4(),
        ...defaultAgentTemplates[AgentRole.CTO],
      },
      {
        id: uuidv4(),
        ...defaultAgentTemplates[AgentRole.CFO],
      }
    ];
  }
};

// Function to simulate agent communication
export const simulateAgentCommunication = async (
  agents: Agent[],
  message: string,
  fromAgentId?: string
): Promise<{ agentId: string; message: string }[]> => {
  try {
    // Filter out the agent that sent the message
    const respondingAgents = agents.filter(agent => agent.id !== fromAgentId);

    // If there are no agents to respond, return an empty array
    if (respondingAgents.length === 0) {
      return [];
    }

    // Get the sender agent if fromAgentId is provided
    const fromAgent = fromAgentId ? agents.find(agent => agent.id === fromAgentId) : null;
    const fromAgentRole = fromAgent ? fromAgent.role : 'Unknown';

    // Generate responses using OpenAI
    const responses = await Promise.all(
      respondingAgents.map(async (agent) => {
        try {
          const prompt = `
You are an AI agent named ${agent.name} with the role of ${agent.role} in a business simulation.
Your skills include: ${agent.skills.join(', ')}.

You've received the following message from ${fromAgent ? fromAgent.name : 'someone'} (${fromAgentRole}):
"${message}"

Respond to this message in character as ${agent.role}. Keep your response concise (1-3 sentences) and professional.
Focus on your specific role's perspective and expertise.
`;

          const response = await generateOpenAIResponse(prompt, 'gpt-3.5-turbo', 0.7);

          return {
            agentId: agent.id,
            message: `[${agent.name}]: ${response}`,
          };
        } catch (error) {
          console.error(`Error generating response for agent ${agent.name}:`, error);

          // Fallback response if AI generation fails
          return {
            agentId: agent.id,
            message: `[${agent.name}]: I acknowledge your message regarding "${message.substring(0, 30)}...". I'll work on this from my ${agent.role} perspective.`,
          };
        }
      })
    );

    return responses;
  } catch (error) {
    console.error('Error in simulateAgentCommunication:', error);

    // Fallback to basic responses if everything fails
    return agents
      .filter(agent => agent.id !== fromAgentId)
      .map(agent => {
        return {
          agentId: agent.id,
          message: `[${agent.name}]: I acknowledge your message regarding "${message.substring(0, 30)}...". I'll work on this from my ${agent.role} perspective.`,
        };
      });
  }
};

// Function to generate a business report
export const generateBusinessReport = async (business: Business, reportType: string): Promise<string> => {
  try {
    // First, try to get some market information about the business type
    let marketInfo = '';
    try {
      marketInfo = await searchBusinessInformation(`${business.type} industry trends`);
    } catch (error) {
      console.error('Error fetching market information:', error);
      marketInfo = 'Unable to fetch market information at this time.';
    }

    // Generate a detailed report using OpenAI
    const prompt = `
You are an AI business analyst tasked with creating a ${reportType} report for a business.

Business Name: ${business.name}
Business Type: ${business.type}
Business Description: ${business.description || 'No description provided.'}

Team Structure:
${business.agents.map(agent => `- ${agent.name} (${agent.role})`).join('\n')}

Market Information:
${marketInfo}

Create a comprehensive ${reportType} report for this business. Include the following sections:
1. Executive Summary
2. Business Overview
3. Team Structure Analysis
4. Market Analysis
5. SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats)
6. Recommendations
7. Next Steps

Format the report in Markdown with proper headings, bullet points, and sections.
`;

    try {
      const report = await generateOpenAIResponse(prompt);
      return report;
    } catch (error) {
      console.error('Error generating business report with AI:', error);

      // Fallback to a template-based report if AI generation fails
      return `
# ${reportType} Report for ${business.name}

## Executive Summary
This is an automatically generated report for ${business.name}, a ${business.type} business.

## Business Overview
${business.description || 'No business description provided.'}

## Team Structure
The business currently has ${business.agents.length} AI agents in the following roles:
${business.agents.map(agent => `- ${agent.name} (${agent.role})`).join('\n')}

## Market Information
${marketInfo}

## Recommendations
Based on the current business structure and market trends, we recommend:
1. Expanding the team with additional specialized roles
2. Developing a comprehensive marketing strategy
3. Exploring new product opportunities in the market

## Next Steps
1. Schedule a strategy meeting with the leadership team
2. Conduct market research on competitor offerings
3. Develop a 6-month roadmap for business growth

*This report was generated by the Business AI Simulator*
`;
    }
  } catch (error) {
    console.error('Error in generateBusinessReport:', error);

    // Return a basic report if everything fails
    return `
# ${reportType} Report for ${business.name}

## Executive Summary
This is an automatically generated report for ${business.name}, a ${business.type} business.

## Business Overview
${business.description || 'No business description provided.'}

## Team Structure
The business currently has ${business.agents.length} AI agents in the following roles:
${business.agents.map(agent => `- ${agent.name} (${agent.role})`).join('\n')}

## Recommendations
Based on the current business structure, we recommend:
1. Expanding the team with additional specialized roles
2. Developing a comprehensive marketing strategy
3. Exploring new product opportunities in the market

*This report was generated by the Business AI Simulator*
`;
  }
};

// Function to search the web for business information
export const searchBusinessInformation = async (query: string): Promise<string> => {
  try {
    // Try to search the web using the web search service
    const searchResults = await searchWeb(query);
    return searchResults;
  } catch (error) {
    console.error('Error searching the web:', error);

    // If web search fails, try to generate information using OpenAI
    try {
      const prompt = `
You are a business intelligence analyst. Provide information about the following business topic:
"${query}"

Include information about:
1. Market overview and size
2. Key competitors
3. Recent trends
4. Potential opportunities

Format your response in Markdown with proper headings and bullet points.
`;

      const aiGeneratedInfo = await generateOpenAIResponse(prompt);
      return aiGeneratedInfo;
    } catch (aiError) {
      console.error('Error generating business information with AI:', aiError);

      // Return mock results if both web search and AI generation fail
      return `
# Search Results for "${query}"

## Market Overview
The ${query.split(' ')[0]} market is growing at a rate of approximately 12% annually, with significant opportunities in emerging markets.

## Key Competitors
1. Company A - Market leader with 35% market share
2. Company B - Innovative startup disrupting the industry
3. Company C - Established player focusing on premium segment

## Recent Trends
- Increasing adoption of AI and automation
- Shift towards sustainable and eco-friendly solutions
- Growing demand for personalized customer experiences

## Potential Opportunities
- Developing niche products for underserved segments
- Leveraging technology to improve operational efficiency
- Exploring international expansion opportunities

*This information was generated as a fallback and may not be accurate*
`;
    }
  }
};

import { Agent as ModelAgent, AgentRole, Business as ModelBusiness } from '@/models/Business';
import { Agent, Business } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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
  // In a real application, this would use AI to determine the appropriate agents for the business type
  // For now, we'll return a standard set of agents

  const standardRoles = [
    AgentRole.CEO,
    AgentRole.CTO,
    AgentRole.CFO,
    AgentRole.MARKETING_SPECIALIST,
    AgentRole.AI_ENGINEER,
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
  }

  // Create a combined array without duplicates
  const combinedRoles = [...standardRoles, ...additionalRoles];
  const allRoles = Array.from(new Set(combinedRoles));

  // Create agents from templates
  return allRoles.map(role => ({
    id: uuidv4(),
    ...defaultAgentTemplates[role],
  }));
};

// Function to simulate agent communication
export const simulateAgentCommunication = async (
  agents: Agent[],
  message: string,
  fromAgentId?: string
): Promise<{ agentId: string; message: string }[]> => {
  // In a real application, this would use AI to generate responses from each agent
  // For now, we'll return mock responses

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1000));

  return agents
    .filter(agent => agent.id !== fromAgentId)
    .map(agent => {
      return {
        agentId: agent.id,
        message: `[${agent.name}]: I acknowledge your message regarding "${message.substring(0, 30)}...". I'll work on this from my ${agent.role} perspective.`,
      };
    });
};

// Function to generate a business report
export const generateBusinessReport = async (business: Business, reportType: string): Promise<string> => {
  // In a real application, this would use AI to generate a detailed report
  // For now, we'll return a mock report

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

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
};

// Function to search the web for business information
export const searchBusinessInformation = async (query: string): Promise<string> => {
  // In a real application, this would use an API to search the web
  // For now, we'll return mock results

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500));

  return `
# Search Results for "${query}"

## Market Overview
The ${query} market is growing at a rate of approximately 12% annually, with significant opportunities in emerging markets.

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

*This information was gathered from public sources and may not be comprehensive*
`;
};

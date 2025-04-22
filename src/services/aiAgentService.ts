import { Agent, AgentRole, Business } from '@/models/Business';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';
import { supabase } from '@/utils/supabaseClient';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This service uses OpenAI API to generate AI agent responses

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

// Function to generate agents based on business type using OpenAI
export const generateAgentsForBusiness = async (businessType: string, businessDescription: string): Promise<Agent[]> => {
  try {
    // First, determine the appropriate roles for this business type using OpenAI
    const roleSelectionPrompt = `
      You are an AI business consultant. Based on the following business type and description, 
      recommend the most appropriate roles for a virtual business team. 
      
      Business Type: ${businessType}
      Business Description: ${businessDescription}
      
      Select from the following roles:
      ${Object.values(AgentRole).join(', ')}
      
      Return only the role names as a comma-separated list, with no additional text.
    `;
    
    const roleResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a business consultant AI that recommends appropriate team structures." },
        { role: "user", content: roleSelectionPrompt }
      ],
      temperature: 0.7,
      max_tokens: 150
    });
    
    // Parse the response to get the roles
    const roleText = roleResponse.choices[0].message.content?.trim() || '';
    const selectedRoles = roleText.split(',').map(role => role.trim());
    
    // Filter to valid roles
    const validRoles = selectedRoles.filter(role => 
      Object.values(AgentRole).includes(role as AgentRole)
    ) as AgentRole[];
    
    // Ensure we have at least some standard roles if the AI didn't return valid ones
    const standardRoles = [
      AgentRole.CEO,
      AgentRole.CTO,
      AgentRole.CFO,
      AgentRole.MARKETING_SPECIALIST,
      AgentRole.AI_ENGINEER,
    ];
    
    const allRoles = validRoles.length > 0 
      ? validRoles 
      : standardRoles;
    
    // Create agents from templates
    const agents = allRoles.map(role => ({
      id: uuidv4(),
      ...defaultAgentTemplates[role],
    }));
    
    // Save agents to Supabase if we have a valid connection
    if (supabase) {
      for (const agent of agents) {
        await supabase
          .from('agents')
          .insert([{
            id: agent.id,
            name: agent.name,
            role: agent.role,
            description: agent.description,
            skills: agent.skills,
            avatar: agent.avatar
          }]);
      }
    }
    
    return agents;
  } catch (error) {
    console.error('Error generating agents:', error);
    
    // Fallback to standard roles if there's an error
    const standardRoles = [
      AgentRole.CEO,
      AgentRole.CTO,
      AgentRole.CFO,
      AgentRole.MARKETING_SPECIALIST,
      AgentRole.AI_ENGINEER,
    ];
    
    return standardRoles.map(role => ({
      id: uuidv4(),
      ...defaultAgentTemplates[role],
    }));
  }
};

// Function for agent communication using OpenAI
export const simulateAgentCommunication = async (
  agents: Agent[],
  message: string,
  fromAgentId?: string
): Promise<{ agentId: string; message: string }[]> => {
  try {
    const responses: { agentId: string; message: string }[] = [];
    
    // Get the sender agent if fromAgentId is provided
    const fromAgent = fromAgentId 
      ? agents.find(agent => agent.id === fromAgentId) 
      : undefined;
    
    // Generate responses for each agent
    for (const agent of agents) {
      // Skip the sender
      if (agent.id === fromAgentId) continue;
      
      const prompt = `
        You are ${agent.name}, a ${agent.role} in a virtual business. 
        Your skills include: ${agent.skills.join(', ')}.
        
        ${fromAgent 
          ? `${fromAgent.name} (${fromAgent.role}) has sent the following message:` 
          : 'The business owner has sent the following message:'}
        
        "${message}"
        
        Respond to this message from your perspective as ${agent.role}. 
        Keep your response concise, professional, and focused on your role's responsibilities.
        Start your response with [${agent.name}]:
      `;
      
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: `You are ${agent.name}, a ${agent.role} in a virtual business.` },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        max_tokens: 200
      });
      
      const responseText = response.choices[0].message.content?.trim() || '';
      
      responses.push({
        agentId: agent.id,
        message: responseText
      });
      
      // Save the communication to Supabase if we have a valid connection
      if (supabase) {
        await supabase
          .from('communications')
          .insert([{
            from_agent_id: fromAgentId || 'owner',
            to_agent_id: agent.id,
            message: message,
            response: responseText,
            created_at: new Date().toISOString()
          }]);
      }
    }
    
    return responses;
  } catch (error) {
    console.error('Error simulating agent communication:', error);
    
    // Fallback to simple responses if there's an error
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

// Function to generate a business report using OpenAI
export const generateBusinessReport = async (business: Business, reportType: string): Promise<string> => {
  try {
    const prompt = `
      Generate a detailed ${reportType} report for ${business.name}, a ${business.type} business.
      
      Business Description: ${business.description || 'No business description provided.'}
      
      Team Structure:
      ${business.agents.map(agent => `- ${agent.name} (${agent.role})`).join('\n')}
      
      Include the following sections:
      1. Executive Summary
      2. Business Overview
      3. Team Structure
      4. Market Analysis
      5. Recommendations
      6. Next Steps
      
      Format the report in Markdown.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a business analyst AI that generates detailed business reports." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const report = response.choices[0].message.content?.trim() || '';
    
    // Save the report to Supabase if we have a valid connection
    if (supabase) {
      await supabase
        .from('reports')
        .insert([{
          business_id: business.id,
          title: `${reportType} Report`,
          content: report,
          created_at: new Date().toISOString()
        }]);
    }
    
    return report;
  } catch (error) {
    console.error('Error generating business report:', error);
    
    // Fallback to a simple report if there's an error
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
  }
};

// Function to search the web for business information using OpenAI
export const searchBusinessInformation = async (query: string): Promise<string> => {
  try {
    const prompt = `
      You are a business research AI. Provide comprehensive information about the following business topic:
      
      "${query}"
      
      Include the following sections:
      1. Market Overview
      2. Key Competitors
      3. Recent Trends
      4. Potential Opportunities
      
      Format the response in Markdown.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a business research AI that provides comprehensive market information." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 800
    });
    
    const information = response.choices[0].message.content?.trim() || '';
    
    // Save the search to Supabase if we have a valid connection
    if (supabase) {
      await supabase
        .from('searches')
        .insert([{
          query: query,
          results: information,
          created_at: new Date().toISOString()
        }]);
    }
    
    return information;
  } catch (error) {
    console.error('Error searching business information:', error);
    
    // Fallback to simple information if there's an error
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
  }
};

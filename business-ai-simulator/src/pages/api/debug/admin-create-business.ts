import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed'
      });
    }

    const { name, type, description, userId, email } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and type are required'
      });
    }

    console.log('API: Creating business with admin privileges, name:', name);

    // Log Supabase connection info
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('API: Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');
    console.log('API: OpenAI API Key:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');

    try {
      // Step 1: Find or create a user
      let userAuth0Id = '';
      const timestamp = new Date().toISOString();

      // First, try to find the user by userId if provided
      if (userId) {
        console.log('API: Looking for existing user with ID:', userId);

        const { data: existingUserById, error: userByIdError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth0_id', userId)
          .single();

        if (!userByIdError && existingUserById) {
          console.log('API: Found existing user by ID:', existingUserById);
          userAuth0Id = existingUserById.auth0_id;
        } else {
          console.log('API: User not found by ID, error:', userByIdError);
        }
      }

      // If not found by ID, try to find by email if provided
      if (!userAuth0Id && email) {
        console.log('API: Looking for existing user with email:', email);

        const { data: existingUserByEmail, error: userByEmailError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();

        if (!userByEmailError && existingUserByEmail) {
          console.log('API: Found existing user by email:', existingUserByEmail);
          userAuth0Id = existingUserByEmail.auth0_id;
        } else {
          console.log('API: User not found by email, error:', userByEmailError);
        }
      }

      // If still not found, try to find any user
      if (!userAuth0Id) {
        console.log('API: Looking for any existing user');

        const { data: anyUser, error: anyUserError } = await supabaseAdmin
          .from('users')
          .select('*')
          .limit(1)
          .single();

        if (!anyUserError && anyUser) {
          console.log('API: Found an existing user:', anyUser);
          userAuth0Id = anyUser.auth0_id;
        } else {
          console.log('API: No existing users found, error:', anyUserError);
        }
      }

      // If still no user found, create a new one
      if (!userAuth0Id) {
        console.log('API: No existing user found, creating a new one');

        const ADMIN_TEST_USER_ID = 'admin_user_' + Math.random().toString(36).substring(2, 7);

        const { data: newUser, error: userError } = await supabaseAdmin
          .from('users')
          .insert([{
            auth0_id: ADMIN_TEST_USER_ID,
            email: email || `admin_test_${ADMIN_TEST_USER_ID}@example.com`,
            name: 'Admin User',
            created_at: timestamp,
            updated_at: timestamp
          }])
          .select()
          .single();

        if (userError) {
          console.error('API: Error creating admin user:', userError);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to create admin user',
            error: userError
          });
        }

        console.log('API: Admin user created successfully:', newUser);
        userAuth0Id = ADMIN_TEST_USER_ID;
      }

      // Step 2: Generate AI content for the business
      console.log('API: Generating AI content for business');

      // Define an interface for the agent structure
      interface AIAgent {
        name: string;
        role: string;
        description: string;
        skills: string[];
      }

      let aiGeneratedAgents: AIAgent[] = [];
      let aiGeneratedDescription = description || '';

      try {
        // Generate AI description if not provided
        if (!description) {
          const descriptionPrompt = `Generate a detailed description for a ${type} business named "${name}". The description should be 2-3 sentences long.`;

          const descriptionResponse = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: "You are a helpful assistant that generates business descriptions." },
              { role: "user", content: descriptionPrompt }
            ],
            max_tokens: 150
          });

          // Add null checks to handle potential undefined values
          if (descriptionResponse?.choices &&
              descriptionResponse.choices.length > 0 &&
              descriptionResponse.choices[0]?.message?.content) {
            aiGeneratedDescription = descriptionResponse.choices[0].message.content.trim();
            console.log('API: Generated AI description:', aiGeneratedDescription);
          } else {
            aiGeneratedDescription = `A promising ${type} business focused on innovation and customer satisfaction.`;
            console.log('API: Using default description due to empty AI response');
          }
        }

        // Generate AI agents
        const agentsPrompt = `Generate 3-4 key employees/agents for a ${type} business named "${name}". For each agent, provide:
1. Name (realistic full name)
2. Role/title (specific job title)
3. Brief description of their responsibilities (1-2 sentences)
4. 3-5 key skills (as an array of strings)

Format the response as a valid JSON array of objects with the following structure:
[
  {
    "name": "Full Name",
    "role": "Job Title",
    "description": "Brief description",
    "skills": ["skill1", "skill2", "skill3"]
  },
  ...
]`;

        const agentsResponse = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful assistant that generates business employees in JSON format." },
            { role: "user", content: agentsPrompt }
          ],
          max_tokens: 500,
          response_format: { type: "json_object" }
        });

        // Add null checks to handle potential undefined values
        let agentsContent = '';
        if (agentsResponse?.choices &&
            agentsResponse.choices.length > 0 &&
            agentsResponse.choices[0]?.message?.content) {
          agentsContent = agentsResponse.choices[0].message.content.trim();
          console.log('API: Generated AI agents content:', agentsContent);
        } else {
          console.log('API: Empty AI response for agents, will use default agents');
          // We'll use the default agents defined below
        }

        try {
          // Only try to parse if we have content
          if (agentsContent && agentsContent.trim() !== '') {
            const parsedAgents = JSON.parse(agentsContent);
            if (parsedAgents && parsedAgents.agents && Array.isArray(parsedAgents.agents)) {
              aiGeneratedAgents = parsedAgents.agents;
            } else if (parsedAgents && Array.isArray(parsedAgents)) {
              aiGeneratedAgents = parsedAgents;
            } else {
              // If we got JSON but not in the expected format, use defaults
              console.log('API: Unexpected JSON format for agents, using defaults');
              throw new Error('Unexpected JSON format');
            }
          } else {
            // If we have no content, use defaults
            console.log('API: No content to parse for agents, using defaults');
            throw new Error('No content to parse');
          }
        } catch (parseError) {
          console.error('API: Error parsing AI agents:', parseError);
          // Fall back to default agents if parsing fails
          aiGeneratedAgents = [
            {
              name: "Alex Johnson",
              role: "Chief Executive Officer",
              description: "Leads the company with strategic vision and operational oversight.",
              skills: ["leadership", "strategy", "management", "communication"]
            } as AIAgent,
            {
              name: "Taylor Smith",
              role: "Chief Technology Officer",
              description: "Oversees all technical aspects and innovation initiatives.",
              skills: ["technology", "innovation", "development", "architecture"]
            } as AIAgent,
            {
              name: "Jordan Williams",
              role: "Marketing Director",
              description: "Manages brand strategy and marketing campaigns.",
              skills: ["marketing", "branding", "social media", "analytics"]
            } as AIAgent
          ];
        }
      } catch (aiError) {
        console.error('API: Error generating AI content:', aiError);
        // Fall back to default description and agents
        if (!aiGeneratedDescription) {
          aiGeneratedDescription = `A promising ${type} business focused on innovation and customer satisfaction.`;
        }

        aiGeneratedAgents = [
          {
            name: "Alex Johnson",
            role: "Chief Executive Officer",
            description: "Leads the company with strategic vision and operational oversight.",
            skills: ["leadership", "strategy", "management", "communication"]
          } as AIAgent,
          {
            name: "Taylor Smith",
            role: "Chief Technology Officer",
            description: "Oversees all technical aspects and innovation initiatives.",
            skills: ["technology", "innovation", "development", "architecture"]
          } as AIAgent,
          {
            name: "Jordan Williams",
            role: "Marketing Director",
            description: "Manages brand strategy and marketing campaigns.",
            skills: ["marketing", "branding", "social media", "analytics"]
          } as AIAgent
        ];
      }

      // Step 3: Create the business with admin client
      console.log('API: Creating business for user:', userAuth0Id);

      const businessData = {
        user_id: userAuth0Id,
        name,
        type,
        description: aiGeneratedDescription,
        created_at: timestamp,
        updated_at: timestamp
      };

      const { data: newBusiness, error: businessError } = await supabaseAdmin
        .from('businesses')
        .insert([businessData])
        .select()
        .single();

      if (businessError) {
        console.error('API: Failed to create business:', businessError);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create business',
          error: businessError
        });
      }

      console.log('API: Business created successfully with admin client:', newBusiness);

      // Step 4: Create AI-generated agents with admin client
      console.log('API: Creating AI-generated agents for business');

      const formattedAgents = aiGeneratedAgents.map((agent: AIAgent) => ({
        name: agent.name,
        role: agent.role,
        description: agent.description,
        skills: JSON.stringify(agent.skills || []),
        avatar: `/avatars/${agent.role.toLowerCase().replace(/[^a-z0-9]/g, '')}.png`,
        business_id: newBusiness.id,
        created_at: timestamp,
        updated_at: timestamp
      }));

      const { data: newAgents, error: agentsError } = await supabaseAdmin
        .from('agents')
        .insert(formattedAgents)
        .select();

      if (agentsError) {
        console.error('API: Failed to create agents:', agentsError);
        // Continue even if agent creation fails
      } else {
        console.log('API: Agents created successfully with admin client:', newAgents);
      }

      // Return success response
      return res.status(201).json({
        status: 'success',
        message: 'Business created successfully with admin privileges',
        business: newBusiness,
        agents: newAgents || [],
        user_id: userAuth0Id
      });
    } catch (error) {
      console.error('API: Error in admin-create-business:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('API: Error in admin-create-business:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

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

    const { name, type, description } = req.body;

    if (!name || !type) {
      return res.status(400).json({
        status: 'error',
        message: 'Name and type are required'
      });
    }

    console.log('API: Creating business directly with name:', name);

    // First, create a test user
    try {
      // Generate a random email and ID
      const randomId = Math.random().toString(36).substring(2, 15);
      const testEmail = `test_${randomId}@example.com`;

      // Create a test user
      const timestamp = new Date().toISOString();

      // Log Supabase connection info
      console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
      console.log('API: Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

      // Try different approaches to create a user
      let testUser = null;
      let userCreated = false;

      // Approach 1: Minimal fields
      try {
        console.log('API: Trying minimal user creation');

        const minimalUserData = {
          auth0_id: randomId,
          email: testEmail
        };

        const { data: minimalUser, error: minimalError } = await supabase
          .from('users')
          .insert([minimalUserData])
          .select('id')
          .single();

        if (minimalError) {
          console.error('API: Minimal user creation error:', minimalError);
        } else {
          console.log('API: Minimal user creation successful:', minimalUser);
          testUser = minimalUser;
          userCreated = true;
        }
      } catch (minimalError) {
        console.error('API: Minimal user creation exception:', minimalError);
      }

      // Approach 2: Standard fields
      if (!userCreated) {
        try {
          console.log('API: Trying standard user creation');

          const standardUserData = {
            auth0_id: randomId,
            email: testEmail,
            name: 'Test User'
          };

          const { data: standardUser, error: standardError } = await supabase
            .from('users')
            .insert([standardUserData])
            .select('id')
            .single();

          if (standardError) {
            console.error('API: Standard user creation error:', standardError);
          } else {
            console.log('API: Standard user creation successful:', standardUser);
            testUser = standardUser;
            userCreated = true;
          }
        } catch (standardError) {
          console.error('API: Standard user creation exception:', standardError);
        }
      }

      // Approach 3: Full fields
      if (!userCreated) {
        try {
          console.log('API: Trying full user creation');

          const fullUserData = {
            auth0_id: randomId,
            email: testEmail,
            name: 'Test User',
            created_at: timestamp,
            updated_at: timestamp
          };

          const { data: fullUser, error: fullError } = await supabase
            .from('users')
            .insert([fullUserData])
            .select('id')
            .single();

          if (fullError) {
            console.error('API: Full user creation error:', fullError);
          } else {
            console.log('API: Full user creation successful:', fullUser);
            testUser = fullUser;
            userCreated = true;
          }
        } catch (fullError) {
          console.error('API: Full user creation exception:', fullError);
        }
      }

      // If all approaches failed, return error
      if (!userCreated || !testUser) {
        console.error('API: All user creation approaches failed');
        return res.status(500).json({
          status: 'error',
          message: 'All user creation approaches failed',
          testId: randomId,
          testEmail
        });
      }

      console.log('API: Test user created successfully:', testUser);

      // Now create the business
      // IMPORTANT: user_id should be the auth0_id, not the user's UUID
      const businessData = {
        user_id: randomId, // Use auth0_id as the user_id
        name,
        type,
        description: description || '',
        created_at: timestamp,
        updated_at: timestamp
      };

      // Try to create the business
      let newBusiness = null;
      let businessCreated = false;

      try {
        console.log('API: Creating business with data:', businessData);
        const { data, error } = await supabase
          .from('businesses')
          .insert([businessData])
          .select()
          .single();

        if (error) {
          console.error('API: Error creating business:', error);

          // Try with a different approach if the first one fails
          if (error.code === '23503') { // Foreign key constraint error
            console.log('API: Foreign key constraint error, trying with a different approach');

            // Try creating the business with a direct SQL query
            try {
              // Create a simpler business object
              const simplifiedBusinessData = {
                user_id: randomId,
                name,
                type,
                description: description || ''
              };

              console.log('API: Trying simplified business creation:', simplifiedBusinessData);

              const { data: simplifiedBusiness, error: simplifiedError } = await supabase
                .from('businesses')
                .insert([simplifiedBusinessData])
                .select()
                .single();

              if (simplifiedError) {
                console.error('API: Error creating simplified business:', simplifiedError);
              } else {
                console.log('API: Simplified business created successfully:', simplifiedBusiness);
                newBusiness = simplifiedBusiness;
                businessCreated = true;
              }
            } catch (simplifiedError) {
              console.error('API: Exception in simplified business creation:', simplifiedError);
            }
          }
        } else {
          console.log('API: Business created successfully:', data);
          newBusiness = data;
          businessCreated = true;
        }
      } catch (createBusinessError) {
        console.error('API: Exception in business creation:', createBusinessError);
      }

      // If business creation failed, return error
      if (!businessCreated || !newBusiness) {
        console.error('API: All business creation approaches failed');
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create business after multiple attempts',
          userId: randomId
        });
      }

      console.log('API: Business created successfully:', newBusiness);

      // Create some default agents
      let newAgents = [];

      try {
        const agents = [
          {
            name: 'CEO',
            role: 'Chief Executive Officer',
            description: 'Leads the company',
            skills: JSON.stringify(['leadership', 'strategy', 'management']),
            avatar: '/avatars/ceo.png',
            business_id: newBusiness.id,
            created_at: timestamp,
            updated_at: timestamp
          },
          {
            name: 'CTO',
            role: 'Chief Technology Officer',
            description: 'Leads the technical team',
            skills: JSON.stringify(['technology', 'innovation', 'development']),
            avatar: '/avatars/cto.png',
            business_id: newBusiness.id,
            created_at: timestamp,
            updated_at: timestamp
          }
        ];

        console.log('API: Creating agents for business ID:', newBusiness.id);

        const { data, error } = await supabase
          .from('agents')
          .insert(agents)
          .select();

        if (error) {
          console.error('API: Error creating agents:', error);

          // Try creating agents one by one
          console.log('API: Trying to create agents one by one');

          for (const agent of agents) {
            try {
              const { data: singleAgent, error: singleError } = await supabase
                .from('agents')
                .insert([agent])
                .select()
                .single();

              if (singleError) {
                console.error('API: Error creating single agent:', singleError);
              } else {
                console.log('API: Single agent created successfully:', singleAgent);
                newAgents.push(singleAgent);
              }
            } catch (singleError) {
              console.error('API: Exception creating single agent:', singleError);
            }
          }
        } else {
          console.log('API: Agents created successfully:', data);
          newAgents = data;
        }
      } catch (agentError) {
        console.error('API: Exception in agent creation:', agentError);
        // Continue even if agent creation fails
      }

      // We'll continue even if agent creation fails completely

      return res.status(201).json({
        status: 'success',
        message: 'Business created successfully',
        business: newBusiness,
        agents: newAgents || [],
        user: testUser,
        auth0_id: randomId,
        email: testEmail,
        debug_info: {
          userCreationMethod: userCreated ? 'success' : 'failed',
          businessCreationMethod: businessCreated ? 'success' : 'failed',
          agentsCreated: newAgents.length
        }
      });
    } catch (error) {
      console.error('API: Error in direct-create-business API:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('API: Error in direct-create-business API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

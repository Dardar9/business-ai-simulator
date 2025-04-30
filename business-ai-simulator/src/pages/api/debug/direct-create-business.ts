import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

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

    // Log Supabase connection info
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('API: Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

    try {
      // Use a hardcoded test user ID that we know exists
      // This is a special user ID for direct business creation
      const DIRECT_CREATION_USER_ID = 'direct_creation_user';
      const timestamp = new Date().toISOString();

      // Declare userId variable at the beginning with the correct type
      let userId: string = DIRECT_CREATION_USER_ID;

      // First, check if our special user exists
      const { data: existingUser, error: userCheckError } = await supabase
        .from('users')
        .select('id, auth0_id')
        .eq('auth0_id', DIRECT_CREATION_USER_ID)
        .single();

      if (userCheckError) {
        console.log('API: Special user does not exist, creating it now');

        // Create our special user if it doesn't exist
        const { data: newUser, error: createUserError } = await supabase
          .from('users')
          .insert([{
            auth0_id: DIRECT_CREATION_USER_ID,
            email: 'direct_creation@example.com',
            name: 'Direct Creation User',
            created_at: timestamp,
            updated_at: timestamp
          }])
          .select('id, auth0_id')
          .single();

        if (createUserError) {
          console.error('API: Error creating special user:', createUserError);

          // Try with minimal fields
          const { data: minimalUser, error: minimalError } = await supabase
            .from('users')
            .insert([{
              auth0_id: DIRECT_CREATION_USER_ID,
              email: 'direct_creation@example.com'
            }])
            .select('id, auth0_id')
            .single();

          if (minimalError) {
            console.error('API: Error creating minimal special user:', minimalError);

            // If we can't create the special user, try to find any existing user
            const { data: anyUser, error: anyUserError } = await supabase
              .from('users')
              .select('id, auth0_id')
              .limit(1)
              .single();

            if (anyUserError || !anyUser) {
              console.error('API: Could not find any user:', anyUserError);
              return res.status(500).json({
                status: 'error',
                message: 'Could not find or create a user for business creation',
                error: anyUserError || 'No users found'
              });
            }

            console.log('API: Using existing user for business creation:', anyUser);
            userId = anyUser.auth0_id;
          } else {
            console.log('API: Created minimal special user:', minimalUser);
            // No need to reassign, already using DIRECT_CREATION_USER_ID
          }
        } else {
          console.log('API: Created special user:', newUser);
          // No need to reassign, already using DIRECT_CREATION_USER_ID
        }
      } else {
        console.log('API: Special user already exists:', existingUser);
        // No need to reassign, already using DIRECT_CREATION_USER_ID
      }

      console.log('API: Using user ID for business creation:', userId);

      // Now create the business
      // IMPORTANT: user_id should be the auth0_id, not the user's UUID
      const businessData = {
        user_id: userId, // Use the user ID we found or created
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

            // Try creating the business with a simpler object
            try {
              // Create a simpler business object
              const simplifiedBusinessData = {
                user_id: userId,
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
          userId: userId
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
        auth0_id: userId,
        debug_info: {
          userMethod: 'Using hardcoded or existing user',
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

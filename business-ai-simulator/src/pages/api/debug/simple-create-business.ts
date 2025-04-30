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

    console.log('API: Creating business with simple approach, name:', name);

    // Log Supabase connection info
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('API: Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

    try {
      // Step 1: Check if our test user exists
      const FIXED_USER_ID = 'fixed_test_user_123';
      const FIXED_EMAIL = 'fixed_test_user@example.com';
      
      console.log('API: Checking if fixed test user exists');
      
      // First try to get the user
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth0_id', FIXED_USER_ID)
        .single();
        
      // If user doesn't exist, create it
      if (userError) {
        console.log('API: Fixed test user not found, creating it');
        
        // Create a minimal user
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert([{
            auth0_id: FIXED_USER_ID,
            email: FIXED_EMAIL
          }])
          .select()
          .single();
          
        if (createError) {
          console.error('API: Failed to create fixed test user:', createError);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to create test user',
            error: createError
          });
        }
        
        console.log('API: Created fixed test user:', newUser);
      } else {
        console.log('API: Fixed test user already exists:', existingUser);
      }
      
      // Step 2: Create the business
      console.log('API: Creating business for fixed test user');
      
      const timestamp = new Date().toISOString();
      const businessData = {
        user_id: FIXED_USER_ID,
        name,
        type,
        description: description || '',
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const { data: newBusiness, error: businessError } = await supabase
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
      
      console.log('API: Business created successfully:', newBusiness);
      
      // Step 3: Create default agents
      console.log('API: Creating default agents for business');
      
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
      
      const { data: newAgents, error: agentsError } = await supabase
        .from('agents')
        .insert(agents)
        .select();
        
      if (agentsError) {
        console.error('API: Failed to create agents:', agentsError);
        // Continue even if agent creation fails
      } else {
        console.log('API: Agents created successfully:', newAgents);
      }
      
      // Return success response
      return res.status(201).json({
        status: 'success',
        message: 'Business created successfully with simple approach',
        business: newBusiness,
        agents: newAgents || [],
        user_id: FIXED_USER_ID
      });
    } catch (error) {
      console.error('API: Error in simple-create-business:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('API: Error in simple-create-business:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

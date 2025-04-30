import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabaseAdmin';
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

    console.log('API: Creating business with admin privileges, name:', name);

    // Log Supabase connection info
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('API: Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

    try {
      // Step 1: Create a fixed test user with admin client (bypasses RLS)
      const ADMIN_TEST_USER_ID = 'admin_test_user_' + Math.random().toString(36).substring(2, 7);
      const timestamp = new Date().toISOString();
      
      console.log('API: Creating admin test user with ID:', ADMIN_TEST_USER_ID);
      
      const { data: newUser, error: userError } = await supabaseAdmin
        .from('users')
        .insert([{
          auth0_id: ADMIN_TEST_USER_ID,
          email: `admin_test_${ADMIN_TEST_USER_ID}@example.com`,
          name: 'Admin Test User',
          created_at: timestamp,
          updated_at: timestamp
        }])
        .select()
        .single();
        
      if (userError) {
        console.error('API: Error creating admin test user:', userError);
        return res.status(500).json({
          status: 'error',
          message: 'Failed to create admin test user',
          error: userError
        });
      }
      
      console.log('API: Admin test user created successfully:', newUser);
      
      // Step 2: Create the business with admin client
      console.log('API: Creating business for admin test user');
      
      const businessData = {
        user_id: ADMIN_TEST_USER_ID,
        name,
        type,
        description: description || '',
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
      
      // Step 3: Create default agents with admin client
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
      
      const { data: newAgents, error: agentsError } = await supabaseAdmin
        .from('agents')
        .insert(agents)
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
        user_id: ADMIN_TEST_USER_ID
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

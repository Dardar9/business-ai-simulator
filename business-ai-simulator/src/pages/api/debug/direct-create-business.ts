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
      const testUserData = {
        auth0_id: randomId,
        email: testEmail,
        name: 'Test User',
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const { data: testUser, error: createUserError } = await supabase
        .from('users')
        .insert([testUserData])
        .select('id')
        .single();
        
      if (createUserError) {
        console.error('API: Error creating test user:', createUserError);
        return res.status(500).json({
          status: 'error',
          message: 'Error creating test user',
          error: createUserError
        });
      }
      
      console.log('API: Test user created successfully:', testUser);
      
      // Now create the business
      const businessData = {
        user_id: testUser.id,
        name,
        type,
        description: description || '',
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const { data: newBusiness, error: createBusinessError } = await supabase
        .from('businesses')
        .insert([businessData])
        .select()
        .single();
        
      if (createBusinessError) {
        console.error('API: Error creating business:', createBusinessError);
        return res.status(500).json({
          status: 'error',
          message: 'Error creating business',
          error: createBusinessError
        });
      }
      
      console.log('API: Business created successfully:', newBusiness);
      
      // Create some default agents
      const agents = [
        {
          name: 'CEO',
          role: 'Chief Executive Officer',
          description: 'Leads the company',
          skills: JSON.stringify(['leadership', 'strategy', 'management']),
          avatar: '',
          business_id: newBusiness.id,
          created_at: timestamp,
          updated_at: timestamp
        },
        {
          name: 'CTO',
          role: 'Chief Technology Officer',
          description: 'Leads the technical team',
          skills: JSON.stringify(['technology', 'innovation', 'development']),
          avatar: '',
          business_id: newBusiness.id,
          created_at: timestamp,
          updated_at: timestamp
        }
      ];
      
      const { data: newAgents, error: createAgentsError } = await supabase
        .from('agents')
        .insert(agents)
        .select();
        
      if (createAgentsError) {
        console.error('API: Error creating agents:', createAgentsError);
        // Continue even if agent creation fails
      } else {
        console.log('API: Agents created successfully:', newAgents);
      }
      
      return res.status(201).json({
        status: 'success',
        message: 'Business created successfully',
        business: newBusiness,
        agents: newAgents || [],
        user: testUser
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

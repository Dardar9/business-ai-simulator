import type { NextApiRequest, NextApiResponse } from 'next';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({
        status: 'error',
        message: 'Method not allowed'
      });
    }

    // Get the business ID from the query parameters
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        status: 'error',
        message: 'Business ID is required'
      });
    }

    console.log('API: Getting business with admin privileges, ID:', id);

    // Log Supabase connection info
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('API: Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

    try {
      // Get the business with its agents
      const { data: business, error: businessError } = await supabaseAdmin
        .from('businesses')
        .select('*')
        .eq('id', id)
        .single();
        
      if (businessError) {
        console.error('API: Error getting business:', businessError);
        return res.status(500).json({
          status: 'error',
          message: 'Error getting business',
          error: businessError
        });
      }
      
      if (!business) {
        console.log('API: Business not found with ID:', id);
        return res.status(404).json({
          status: 'error',
          message: 'Business not found'
        });
      }
      
      console.log('API: Found business:', business);
      
      // Get the agents for this business
      const { data: agents, error: agentsError } = await supabaseAdmin
        .from('agents')
        .select('*')
        .eq('business_id', id);
        
      if (agentsError) {
        console.error('API: Error getting agents:', agentsError);
        // Continue without agents
      }
      
      console.log('API: Found agents:', agents?.length || 0);
      
      // Add agents to the business object
      const businessWithAgents = {
        ...business,
        agents: agents || []
      };
      
      // Return success response
      return res.status(200).json({
        status: 'success',
        message: 'Business retrieved successfully',
        business: businessWithAgents
      });
    } catch (error) {
      console.error('API: Error in admin-get-business:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('API: Error in admin-get-business:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

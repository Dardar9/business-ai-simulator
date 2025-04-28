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

    const { userId, businessData, agents } = req.body;

    if (!userId || !businessData) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required fields',
        received: { userId, businessData: !!businessData, agents: !!agents }
      });
    }

    // Test creating a business directly
    console.log('Creating test business with user ID:', userId);
    
    // Create the business
    const { data: newBusiness, error: businessError } = await supabase
      .from('businesses')
      .insert([{
        user_id: userId,
        name: businessData.name || 'Test Business',
        type: businessData.type || 'Test Type',
        description: businessData.description || 'Test Description'
      }])
      .select()
      .single();

    if (businessError) {
      console.error('Error creating business:', businessError);
      return res.status(500).json({
        status: 'error',
        message: 'Error creating business',
        error: businessError
      });
    }

    if (!newBusiness) {
      return res.status(500).json({
        status: 'error',
        message: 'No business returned after creation'
      });
    }

    // Return success
    return res.status(200).json({
      status: 'success',
      message: 'Test business created successfully',
      business: newBusiness
    });
  } catch (error) {
    console.error('Error in debug/create-business API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

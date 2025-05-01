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

    // Get the user ID from the query parameters
    const { userId, email } = req.query;

    if (!userId && !email) {
      return res.status(400).json({
        status: 'error',
        message: 'Either userId or email is required'
      });
    }

    console.log('API: Getting businesses with admin privileges');
    console.log('API: User ID:', userId);
    console.log('API: Email:', email);

    // Log Supabase connection info
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('API: Supabase Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Not set');

    try {
      // Step 1: Find the user
      let userAuth0Id = null;
      
      // First, try to find the user by userId if provided
      if (userId) {
        console.log('API: Looking for user with ID:', userId);
        
        const { data: existingUserById, error: userByIdError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('auth0_id', userId)
          .single();
          
        if (!userByIdError && existingUserById) {
          console.log('API: Found user by ID:', existingUserById);
          userAuth0Id = existingUserById.auth0_id;
        } else {
          console.log('API: User not found by ID, error:', userByIdError);
        }
      }
      
      // If not found by ID, try to find by email if provided
      if (!userAuth0Id && email) {
        console.log('API: Looking for user with email:', email);
        
        const { data: existingUserByEmail, error: userByEmailError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('email', email)
          .single();
          
        if (!userByEmailError && existingUserByEmail) {
          console.log('API: Found user by email:', existingUserByEmail);
          userAuth0Id = existingUserByEmail.auth0_id;
        } else {
          console.log('API: User not found by email, error:', userByEmailError);
        }
      }
      
      // If still not found, try to find any user
      if (!userAuth0Id) {
        console.log('API: Looking for any user');
        
        const { data: anyUser, error: anyUserError } = await supabaseAdmin
          .from('users')
          .select('*')
          .limit(1)
          .single();
          
        if (!anyUserError && anyUser) {
          console.log('API: Found a user:', anyUser);
          userAuth0Id = anyUser.auth0_id;
        } else {
          console.log('API: No users found, error:', anyUserError);
          return res.status(404).json({
            status: 'error',
            message: 'No users found'
          });
        }
      }
      
      // Step 2: Get all businesses for the user
      console.log('API: Getting businesses for user:', userAuth0Id);
      
      const { data: businesses, error: businessesError } = await supabaseAdmin
        .from('businesses')
        .select('*, agents(*)')
        .eq('user_id', userAuth0Id);
        
      if (businessesError) {
        console.error('API: Error getting businesses:', businessesError);
        return res.status(500).json({
          status: 'error',
          message: 'Error getting businesses',
          error: businessesError
        });
      }
      
      console.log('API: Found businesses:', businesses?.length || 0);
      
      // Return success response
      return res.status(200).json({
        status: 'success',
        message: 'Businesses retrieved successfully',
        businesses: businesses || [],
        user_id: userAuth0Id
      });
    } catch (error) {
      console.error('API: Error in admin-get-businesses:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('API: Error in admin-get-businesses:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

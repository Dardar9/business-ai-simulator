import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

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

    const { email, auth0_id } = req.body;

    if (!email && !auth0_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Email or auth0_id is required'
      });
    }

    console.log('API: Force auth request:', { email, auth0_id });

    // First check if user exists by auth0_id
    if (auth0_id) {
      try {
        const { data: existingUser, error: checkError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('auth0_id', auth0_id)
          .single();

        if (!checkError && existingUser) {
          console.log('API: Found existing user by auth0_id:', existingUser.id);
          return res.status(200).json({
            status: 'success',
            message: 'User found by auth0_id',
            userId: existingUser.id,
            authenticated: true
          });
        }
      } catch (error) {
        console.error('API: Error checking user by auth0_id:', error);
      }
    }

    // Then check if user exists by email
    if (email) {
      try {
        const { data: existingUser, error: checkError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single();

        if (!checkError && existingUser) {
          console.log('API: Found existing user by email:', existingUser.id);
          return res.status(200).json({
            status: 'success',
            message: 'User found by email',
            userId: existingUser.id,
            authenticated: true
          });
        }
      } catch (error) {
        console.error('API: Error checking user by email:', error);
      }
    }

    // If we get here, create a new user
    try {
      const timestamp = new Date().toISOString();
      const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const userData = {
        auth0_id: auth0_id || randomId,
        email: email || `${randomId}@example.com`,
        name: email ? email.split('@')[0] : 'Anonymous User',
        created_at: timestamp,
        updated_at: timestamp
      };

      console.log('API: Creating new user for force auth:', userData);

      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([userData])
        .select('id')
        .single();

      if (createError) {
        console.error('API: Error creating user for force auth:', createError);
        return res.status(500).json({
          status: 'error',
          message: 'Error creating user',
          error: createError
        });
      }

      console.log('API: Created new user for force auth:', newUser.id);
      return res.status(201).json({
        status: 'success',
        message: 'User created for force auth',
        userId: newUser.id,
        authenticated: true
      });
    } catch (error) {
      console.error('API: Error in force auth:', error);
      return res.status(500).json({
        status: 'error',
        message: 'Error in force auth',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('API: Unhandled error in force-auth:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { createUserIfNotExists } from '@/utils/supabaseUtils';
import { supabaseAdmin } from '@/utils/supabaseAdmin';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    console.log('API: Checking user authentication status');

    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('API: Session error:', sessionError);
      return res.status(401).json({
        status: 'error',
        message: 'Authentication error',
        error: sessionError.message,
        authenticated: false
      });
    }

    if (!session || !session.user) {
      console.log('API: No session or user found');

      // Check if we have a user ID in localStorage (client-side only)
      return res.status(200).json({
        status: 'success',
        message: 'Not authenticated',
        authenticated: false
      });
    }

    console.log('API: Session found, user:', {
      id: session.user.id,
      email: session.user.email,
      name: session.user.user_metadata?.name
    });

    // Get or create user in database
    let userId = null;
    try {
      if (session.user.email) {
        console.log('API: Creating or getting user in database with email:', session.user.email);

        // First try with regular client
        userId = await createUserIfNotExists(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name,
          session.user.user_metadata?.avatar_url
        );

        // If that fails, try with admin client
        if (!userId) {
          console.log('API: Failed to get/create user with regular client, trying admin client');

          // First check if user exists
          const { data: existingUser, error: checkError } = await supabaseAdmin
            .from('users')
            .select('id')
            .eq('auth0_id', session.user.id)
            .single();

          if (!checkError && existingUser) {
            console.log('API: Found existing user with admin client:', existingUser.id);
            userId = existingUser.id;
          } else {
            // Create new user with admin client
            const timestamp = new Date().toISOString();
            const userData = {
              auth0_id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.name || session.user.email.split('@')[0],
              avatar_url: session.user.user_metadata?.avatar_url,
              created_at: timestamp,
              updated_at: timestamp
            };

            const { data: newUser, error: createError } = await supabaseAdmin
              .from('users')
              .insert([userData])
              .select('id')
              .single();

            if (!createError && newUser) {
              console.log('API: Created new user with admin client:', newUser.id);
              userId = newUser.id;
            } else {
              console.error('API: Failed to create user with admin client:', createError);
            }
          }
        }

        console.log('API: User ID from database:', userId);
      } else {
        console.warn('API: User has no email in session:', session.user);
      }
    } catch (dbError) {
      console.error('API: Error creating/getting user in database:', dbError);
    }

    return res.status(200).json({
      status: 'success',
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.user_metadata?.name,
        avatar: session.user.user_metadata?.avatar_url
      },
      userId: userId,
      authenticated: true
    });
  } catch (error) {
    console.error('Error in auth/user API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
      authenticated: false
    });
  }
}

import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { createUserIfNotExists } from '@/utils/supabaseUtils';

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
        message: 'Not authenticated',
        error: sessionError.message
      });
    }

    if (!session || !session.user) {
      console.log('API: No session or user found');

      // Check if we have a user ID in the request cookies
      const cookies = req.cookies;
      const supabaseAuthToken = cookies['sb-access-token'] || cookies['sb-refresh-token'];

      if (supabaseAuthToken) {
        console.log('API: Found Supabase auth token in cookies, but no session');
      }

      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
        session: null,
        cookies: Object.keys(cookies || {})
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
        userId = await createUserIfNotExists(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.name,
          session.user.user_metadata?.avatar_url
        );
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
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

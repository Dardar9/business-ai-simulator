import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';
import { createUserIfNotExists } from '@/utils/authUtils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
        error: sessionError.message
      });
    }
    
    if (!session || !session.user) {
      return res.status(401).json({
        status: 'error',
        message: 'Not authenticated',
        session: null
      });
    }
    
    // Get or create user in database
    let userId = null;
    if (session.user.email) {
      userId = await createUserIfNotExists(
        session.user.id,
        session.user.email,
        session.user.user_metadata?.name,
        session.user.user_metadata?.avatar_url
      );
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

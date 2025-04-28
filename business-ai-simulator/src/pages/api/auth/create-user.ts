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

    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    console.log('API: Creating user in database directly with email:', email);

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('API: Error checking user existence:', checkError);
      return res.status(500).json({
        status: 'error',
        message: 'Error checking user existence',
        error: checkError
      });
    }

    if (existingUser) {
      console.log('API: User already exists in database, returning existing ID:', existingUser.id);
      return res.status(200).json({
        status: 'success',
        message: 'User already exists',
        userId: existingUser.id
      });
    }

    // Generate a random ID for the user
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create new user
    console.log('API: Creating new user in database with email:', email);
    const newUserData = {
      auth0_id: randomId, // Using a random ID since we don't have a real auth0_id
      email,
      name: name || email.split('@')[0], // Use part of email as name if not provided
    };

    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert([newUserData])
      .select('id')
      .single();

    if (createError) {
      console.error('API: Error creating user:', createError);
      return res.status(500).json({
        status: 'error',
        message: 'Error creating user',
        error: createError
      });
    }

    console.log('API: User created successfully:', newUser);
    return res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      userId: newUser.id
    });
  } catch (error) {
    console.error('API: Error in create-user API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

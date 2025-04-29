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

    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required'
      });
    }

    console.log('API: Creating user in database directly with email:', email);

    // First, check if the users table exists
    try {
      const { error: tableCheckError } = await supabase
        .from('users')
        .select('id')
        .limit(1);

      if (tableCheckError) {
        console.error('API: Error checking users table:', tableCheckError);
        return res.status(500).json({
          status: 'error',
          message: 'Error checking users table. The table might not exist.',
          error: tableCheckError
        });
      }
    } catch (tableError) {
      console.error('API: Exception checking users table:', tableError);
      return res.status(500).json({
        status: 'error',
        message: 'Exception checking users table. The table might not exist.',
        error: tableError instanceof Error ? tableError.message : String(tableError)
      });
    }

    // Check if user already exists by email
    try {
      const { data: existingUserByEmail, error: emailCheckError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (emailCheckError) {
        console.error('API: Error checking user existence by email:', emailCheckError);
        return res.status(500).json({
          status: 'error',
          message: 'Error checking user existence by email',
          error: emailCheckError
        });
      }

      if (existingUserByEmail) {
        console.log('API: User already exists in database by email, returning existing ID:', existingUserByEmail.id);
        return res.status(200).json({
          status: 'success',
          message: 'User already exists',
          userId: existingUserByEmail.id
        });
      }
    } catch (emailError) {
      console.error('API: Exception checking user by email:', emailError);
      // Continue to create user even if check fails
    }

    // Generate a random ID for the user
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    // Create new user
    console.log('API: Creating new user in database with email:', email);

    // Check the structure of the users table
    try {
      const { data: tableInfo, error: tableInfoError } = await supabase
        .rpc('get_table_info', { table_name: 'users' });

      if (tableInfoError) {
        console.error('API: Error getting users table info:', tableInfoError);
      } else {
        console.log('API: Users table info:', tableInfo);
      }
    } catch (tableInfoError) {
      console.error('API: Exception getting users table info:', tableInfoError);
    }

    // Create the user with minimal required fields
    try {
      const timestamp = new Date().toISOString();
      const newUserData = {
        auth0_id: randomId, // Using a random ID since we don't have a real auth0_id
        email,
        name: name || email.split('@')[0], // Use part of email as name if not provided
        created_at: timestamp,
        updated_at: timestamp
      };

      // Try with admin client first to bypass RLS
      const { data: newUser, error: createError } = await supabaseAdmin
        .from('users')
        .insert([newUserData])
        .select('id')
        .single();

      if (createError) {
        console.error('API: Error creating user with admin client:', createError);

        // Try with regular client as fallback
        const { data: regularUser, error: regularError } = await supabase
          .from('users')
          .insert([newUserData])
          .select('id')
          .single();

        if (!regularError && regularUser) {
          console.log('API: User created successfully with regular client:', regularUser);
          return res.status(201).json({
            status: 'success',
            message: 'User created successfully with regular client',
            userId: regularUser.id
          });
        }

        // Try a simpler approach if both previous attempts fail
        console.log('API: Trying with minimal fields...');
        const simpleUserData = {
          auth0_id: randomId,
          email
        };

        const { data: simpleUser, error: simpleError } = await supabaseAdmin
          .from('users')
          .insert([simpleUserData])
          .select('id')
          .single();

        if (simpleError) {
          console.error('API: Error creating simple user with admin client:', simpleError);

          // Last resort: try simple user with regular client
          const { data: lastResortUser, error: lastResortError } = await supabase
            .from('users')
            .insert([simpleUserData])
            .select('id')
            .single();

          if (lastResortError) {
            console.error('API: All user creation attempts failed:', lastResortError);
            return res.status(500).json({
              status: 'error',
              message: 'All user creation attempts failed',
              error: lastResortError
            });
          }

          if (lastResortUser) {
            console.log('API: User created with last resort method:', lastResortUser);
            return res.status(201).json({
              status: 'success',
              message: 'User created with last resort method',
              userId: lastResortUser.id
            });
          }

          return res.status(500).json({
            status: 'error',
            message: 'Error creating user',
            error: simpleError
          });
        }

        console.log('API: Simple user created successfully:', simpleUser);
        return res.status(201).json({
          status: 'success',
          message: 'Simple user created successfully',
          userId: simpleUser.id
        });
      }

      console.log('API: User created successfully:', newUser);
      return res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        userId: newUser.id
      });
    } catch (createError) {
      console.error('API: Exception creating user:', createError);
      return res.status(500).json({
        status: 'error',
        message: 'Exception creating user',
        error: createError instanceof Error ? createError.message : String(createError)
      });
    }
  } catch (error) {
    console.error('API: Error in create-user API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

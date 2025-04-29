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

    console.log('API: Creating test user');
    
    // Log Supabase connection info
    console.log('API: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
    console.log('API: Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');
    
    // Generate test data
    const timestamp = new Date().toISOString();
    const testId = `test_${Math.random().toString(36).substring(2, 10)}`;
    const testEmail = `${testId}@example.com`;
    
    // Try different approaches to create a user
    
    // Approach 1: Minimal fields
    try {
      console.log('API: Trying minimal user creation');
      
      const minimalUserData = {
        auth0_id: testId,
        email: testEmail
      };
      
      const { data: minimalUser, error: minimalError } = await supabase
        .from('users')
        .insert([minimalUserData])
        .select()
        .single();
        
      if (minimalError) {
        console.error('API: Minimal user creation error:', minimalError);
      } else {
        console.log('API: Minimal user creation successful:', minimalUser);
        return res.status(201).json({
          status: 'success',
          message: 'Test user created successfully with minimal fields',
          user: minimalUser,
          approach: 'minimal'
        });
      }
    } catch (minimalError) {
      console.error('API: Minimal user creation exception:', minimalError);
    }
    
    // Approach 2: Standard fields
    try {
      console.log('API: Trying standard user creation');
      
      const standardUserData = {
        auth0_id: testId,
        email: testEmail,
        name: 'Test User'
      };
      
      const { data: standardUser, error: standardError } = await supabase
        .from('users')
        .insert([standardUserData])
        .select()
        .single();
        
      if (standardError) {
        console.error('API: Standard user creation error:', standardError);
      } else {
        console.log('API: Standard user creation successful:', standardUser);
        return res.status(201).json({
          status: 'success',
          message: 'Test user created successfully with standard fields',
          user: standardUser,
          approach: 'standard'
        });
      }
    } catch (standardError) {
      console.error('API: Standard user creation exception:', standardError);
    }
    
    // Approach 3: Full fields
    try {
      console.log('API: Trying full user creation');
      
      const fullUserData = {
        auth0_id: testId,
        email: testEmail,
        name: 'Test User',
        created_at: timestamp,
        updated_at: timestamp
      };
      
      const { data: fullUser, error: fullError } = await supabase
        .from('users')
        .insert([fullUserData])
        .select()
        .single();
        
      if (fullError) {
        console.error('API: Full user creation error:', fullError);
      } else {
        console.log('API: Full user creation successful:', fullUser);
        return res.status(201).json({
          status: 'success',
          message: 'Test user created successfully with full fields',
          user: fullUser,
          approach: 'full'
        });
      }
    } catch (fullError) {
      console.error('API: Full user creation exception:', fullError);
    }
    
    // Approach 4: Raw SQL
    try {
      console.log('API: Trying SQL user creation');
      
      const { data: sqlUser, error: sqlError } = await supabase.rpc(
        'create_test_user',
        { 
          auth0_id_param: testId,
          email_param: testEmail,
          name_param: 'Test User'
        }
      );
        
      if (sqlError) {
        console.error('API: SQL user creation error:', sqlError);
      } else {
        console.log('API: SQL user creation successful:', sqlUser);
        return res.status(201).json({
          status: 'success',
          message: 'Test user created successfully with SQL',
          user: sqlUser,
          approach: 'sql'
        });
      }
    } catch (sqlError) {
      console.error('API: SQL user creation exception:', sqlError);
    }
    
    // If all approaches failed, return error
    return res.status(500).json({
      status: 'error',
      message: 'All user creation approaches failed',
      testId,
      testEmail
    });
  } catch (error) {
    console.error('API: Error in create-test-user API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

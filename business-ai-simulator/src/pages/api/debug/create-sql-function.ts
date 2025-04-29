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

    console.log('API: Creating SQL function for test user creation');
    
    // Create the SQL function
    const { data, error } = await supabase.rpc('create_sql_function');
    
    if (error) {
      console.error('API: Error creating SQL function:', error);
      
      // Try direct SQL execution
      try {
        const { data: directData, error: directError } = await supabase.rpc('exec_sql', {
          sql_query: `
            CREATE OR REPLACE FUNCTION create_test_user(
              auth0_id_param TEXT,
              email_param TEXT,
              name_param TEXT
            ) RETURNS JSONB
            LANGUAGE plpgsql
            AS $$
            DECLARE
              new_user_id UUID;
              result JSONB;
            BEGIN
              -- Insert the new user
              INSERT INTO users (auth0_id, email, name, created_at, updated_at)
              VALUES (auth0_id_param, email_param, name_param, NOW(), NOW())
              RETURNING id INTO new_user_id;
              
              -- Prepare the result
              SELECT jsonb_build_object(
                'id', new_user_id,
                'auth0_id', auth0_id_param,
                'email', email_param,
                'name', name_param
              ) INTO result;
              
              RETURN result;
            END;
            $$;
          `
        });
        
        if (directError) {
          console.error('API: Error with direct SQL execution:', directError);
          return res.status(500).json({
            status: 'error',
            message: 'Failed to create SQL function with direct execution',
            error: directError
          });
        }
        
        console.log('API: SQL function created with direct execution:', directData);
        return res.status(200).json({
          status: 'success',
          message: 'SQL function created with direct execution',
          data: directData
        });
      } catch (directError) {
        console.error('API: Exception with direct SQL execution:', directError);
        return res.status(500).json({
          status: 'error',
          message: 'Exception creating SQL function with direct execution',
          error: directError instanceof Error ? directError.message : String(directError)
        });
      }
    }
    
    console.log('API: SQL function created successfully:', data);
    return res.status(200).json({
      status: 'success',
      message: 'SQL function created successfully',
      data
    });
  } catch (error) {
    console.error('API: Error in create-sql-function API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

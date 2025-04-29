import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

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

    console.log('API: Testing Supabase connection');
    
    // Collect environment variables (without exposing sensitive values)
    const envInfo = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set',
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
    };
    
    console.log('API: Environment info:', envInfo);
    
    // Test basic connection
    let connectionTest = 'Failed';
    let connectionError = null;
    
    try {
      const { data, error } = await supabase.from('_test_connection').select('*').limit(1);
      
      if (error) {
        connectionError = error;
        console.error('API: Connection test error:', error);
      } else {
        connectionTest = 'Success';
        console.log('API: Connection test successful');
      }
    } catch (error) {
      connectionError = error;
      console.error('API: Connection test exception:', error);
    }
    
    // Test tables existence
    const tables = ['users', 'businesses', 'agents'];
    const tableResults = {};
    
    for (const table of tables) {
      try {
        console.log(`API: Testing table '${table}'`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        
        if (error) {
          console.error(`API: Error accessing table '${table}':`, error);
          tableResults[table] = {
            exists: false,
            error: error
          };
        } else {
          console.log(`API: Table '${table}' exists, sample data:`, data);
          tableResults[table] = {
            exists: true,
            sampleCount: data?.length || 0,
            sample: data
          };
        }
      } catch (error) {
        console.error(`API: Exception testing table '${table}':`, error);
        tableResults[table] = {
          exists: false,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }
    
    // Try to create a test record in users table
    let createTest = 'Not attempted';
    let createError = null;
    let createdUser = null;
    
    try {
      console.log('API: Testing user creation');
      
      // Generate test data
      const timestamp = new Date().toISOString();
      const testId = `test_${Math.random().toString(36).substring(2, 10)}`;
      const testEmail = `${testId}@example.com`;
      
      // Try to create a user with minimal fields
      const userData = {
        auth0_id: testId,
        email: testEmail
      };
      
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();
        
      if (error) {
        createError = error;
        console.error('API: User creation test error:', error);
        
        // Try with more fields
        try {
          console.log('API: Trying user creation with more fields');
          
          const fullUserData = {
            auth0_id: testId,
            email: testEmail,
            name: 'Test User',
            created_at: timestamp,
            updated_at: timestamp
          };
          
          const { data: fullData, error: fullError } = await supabase
            .from('users')
            .insert([fullUserData])
            .select()
            .single();
            
          if (fullError) {
            console.error('API: Full user creation test error:', fullError);
          } else {
            createTest = 'Success with full fields';
            createdUser = fullData;
            console.log('API: Full user creation test successful:', fullData);
          }
        } catch (fullError) {
          console.error('API: Full user creation test exception:', fullError);
        }
      } else {
        createTest = 'Success';
        createdUser = data;
        console.log('API: User creation test successful:', data);
      }
    } catch (error) {
      createError = error;
      console.error('API: User creation test exception:', error);
    }
    
    // Try to get schema information
    let schemaInfo = null;
    let schemaError = null;
    
    try {
      console.log('API: Getting schema information');
      
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      if (error) {
        schemaError = error;
        console.error('API: Schema info error:', error);
      } else {
        schemaInfo = data;
        console.log('API: Schema info successful:', data);
      }
    } catch (error) {
      schemaError = error;
      console.error('API: Schema info exception:', error);
    }
    
    // Return all test results
    return res.status(200).json({
      status: 'success',
      timestamp: new Date().toISOString(),
      environment: envInfo,
      connection: {
        test: connectionTest,
        error: connectionError
      },
      tables: tableResults,
      creation: {
        test: createTest,
        error: createError,
        user: createdUser
      },
      schema: {
        info: schemaInfo,
        error: schemaError
      }
    });
  } catch (error) {
    console.error('API: Error in supabase-test API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

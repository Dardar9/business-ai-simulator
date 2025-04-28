import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Not set',
    };

    // Test database connection
    let dbStatus = 'Unknown';
    let error = null;
    let tables = [];
    let tableData = null;

    try {
      // Try to create a test user
      const testUser = {
        auth0_id: 'test-' + Date.now(),
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
      };

      // Insert test user
      const { data: insertData, error: insertError } = await supabase
        .from('users')
        .insert([testUser])
        .select();

      if (insertError) {
        dbStatus = 'Error';
        error = insertError;
      } else {
        dbStatus = 'Connected';
        tableData = insertData;

        // Clean up test user
        if (insertData && insertData.length > 0) {
          await supabase
            .from('users')
            .delete()
            .eq('auth0_id', testUser.auth0_id);
        }
      }

      // Get list of tables
      const { data: tablesData } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');

      tables = tablesData || [];
    } catch (e) {
      dbStatus = 'Error';
      error = e;
    }

    // Return status
    res.status(200).json({
      status: 'success',
      environment: envStatus,
      database: {
        status: dbStatus,
        error,
        tables,
        testData: tableData,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in test-db API:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

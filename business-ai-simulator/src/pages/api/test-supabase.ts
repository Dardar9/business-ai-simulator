import type { NextApiRequest, NextApiResponse } from 'next';
import { supabase } from '@/utils/supabaseClient';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Test Supabase connection
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check environment variables
    const envStatus = {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? 'Set' : 'Not set',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseAnonKey ? 'Set' : 'Not set',
    };

    // Test database connection
    let dbStatus = 'Unknown';
    let error = null;
    let tables = [];

    try {
      // Try to query the users table
      const { data, error: queryError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (queryError) {
        dbStatus = 'Error';
        error = queryError;
      } else {
        dbStatus = 'Connected';
      }

      // Get list of tables
      const { data: tableData } = await supabase
        .from('pg_tables')
        .select('tablename')
        .eq('schemaname', 'public');

      tables = tableData || [];
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
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error in test-supabase API:', error);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

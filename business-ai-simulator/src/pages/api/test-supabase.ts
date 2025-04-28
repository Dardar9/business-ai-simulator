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
    let error: any = null;
    let tables: any[] = [];

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

      // Try to get users table info as a simple test
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('count')
        .limit(1);

      if (!usersError) {
        tables.push({ name: 'users', accessible: true });
      }

      // Try to get businesses table info
      const { data: businessesData, error: businessesError } = await supabase
        .from('businesses')
        .select('count')
        .limit(1);

      if (!businessesError) {
        tables.push({ name: 'businesses', accessible: true });
      }

      // Try to get agents table info
      const { data: agentsData, error: agentsError } = await supabase
        .from('agents')
        .select('count')
        .limit(1);

      if (!agentsError) {
        tables.push({ name: 'agents', accessible: true });
      }
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

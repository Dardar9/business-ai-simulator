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

    const { table } = req.query;
    
    if (!table || typeof table !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Table name is required'
      });
    }

    console.log('API: Getting table info for:', table);

    // Get table information
    try {
      // First, check if the table exists
      const { data: tableExists, error: tableExistsError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (tableExistsError) {
        console.error(`API: Error checking if table ${table} exists:`, tableExistsError);
        return res.status(404).json({
          status: 'error',
          message: `Table ${table} might not exist`,
          error: tableExistsError
        });
      }

      // Get column information
      const { data: columns, error: columnsError } = await supabase
        .rpc('get_table_columns', { table_name: table });

      if (columnsError) {
        console.error(`API: Error getting columns for table ${table}:`, columnsError);
        
        // Try a different approach
        const { data: tableData, error: tableDataError } = await supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable')
          .eq('table_name', table);
          
        if (tableDataError) {
          console.error(`API: Error getting table data from information_schema:`, tableDataError);
          return res.status(500).json({
            status: 'error',
            message: `Error getting table information`,
            error: tableDataError
          });
        }
        
        return res.status(200).json({
          status: 'success',
          table,
          exists: true,
          columns: tableData || [],
          sample: tableExists || []
        });
      }

      return res.status(200).json({
        status: 'success',
        table,
        exists: true,
        columns: columns || [],
        sample: tableExists || []
      });
    } catch (error) {
      console.error(`API: Error getting table info for ${table}:`, error);
      return res.status(500).json({
        status: 'error',
        message: `Error getting table information`,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  } catch (error) {
    console.error('API: Error in table-info API:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

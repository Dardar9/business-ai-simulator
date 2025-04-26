import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Type definitions for Supabase tables
export type User = {
  id: string;
  auth0_id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
};

export type Business = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  description?: string;
  created_at: string;
  updated_at: string;
  agents?: Agent[];
};

export type Agent = {
  id: string;
  business_id: string;
  name: string;
  role: string;
  description?: string;
  skills?: string[];
  avatar?: string;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  due_date?: string;
  completed_at?: string;
};

export type Meeting = {
  id: string;
  business_id: string;
  title: string;
  description?: string;
  date: string;
  duration: number;
  agenda?: string[];
  notes?: string;
  created_at: string;
  updated_at: string;
  attendees?: Agent[];
};

export type Report = {
  id: string;
  business_id: string;
  title: string;
  content: string;
  created_by?: string;
  created_at: string;
  charts?: Chart[];
};

export type Chart = {
  id: string;
  report_id: string;
  type: string;
  title: string;
  data: any;
  options?: any;
};

export type Communication = {
  id: string;
  business_id: string;
  from_agent_id: string;
  to_agent_id: string;
  message: string;
  response?: string;
  created_at: string;
};

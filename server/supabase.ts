import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database schema types (matching your existing schema)
export interface User {
  id: string;
  google_id?: string;
  email: string;
  name: string;
  avatar?: string;
  created_at: string;
}

export interface Submission {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  project_name: string;
  project_summary: string;
  site_url: string;
  what_do_you_need: string;
  screenshot_path?: string;
  created_at: string;
}

export interface Validation {
  id: string;
  user_id?: string;
  idea: string;
  target_customer: string;
  problem_solved: string;
  feedback: string;
  created_at: string;
}

export interface AdminSession {
  id: string;
  created_at: string;
  expires_at: string;
}

// Insert types (for creating new records)
export interface InsertUser {
  google_id?: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface InsertValidation {
  idea: string;
  targetCustomer: string;
  problemSolved: string;
}

export interface InsertSubmission {
  name: string;
  email: string;
  projectName: string;
  projectSummary: string;
  siteUrl: string;
  whatDoYouNeed: string;
  screenshotPath?: string;
}

export interface InsertAdminSession {
  expires_at: string;
} 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('Setting up database tables...');

  try {
    // Create users table
    const { error: usersError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          google_id TEXT UNIQUE,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          avatar TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (usersError) {
      console.log('Users table already exists or error:', usersError.message);
    } else {
      console.log('✅ Users table created');
    }

    // Create submissions table
    const { error: submissionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS submissions (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR REFERENCES users(id),
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          project_name TEXT NOT NULL,
          project_summary TEXT NOT NULL,
          site_url TEXT NOT NULL,
          what_do_you_need TEXT NOT NULL DEFAULT '',
          screenshot_path TEXT,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (submissionsError) {
      console.log('Submissions table already exists or error:', submissionsError.message);
    } else {
      console.log('✅ Submissions table created');
    }

    // Create validations table
    const { error: validationsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS validations (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR REFERENCES users(id),
          idea TEXT NOT NULL,
          target_customer TEXT NOT NULL,
          problem_solved TEXT NOT NULL,
          feedback TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (validationsError) {
      console.log('Validations table already exists or error:', validationsError.message);
    } else {
      console.log('✅ Validations table created');
    }

    // Create admin_sessions table
    const { error: adminSessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS admin_sessions (
          id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
          created_at TIMESTAMP DEFAULT NOW(),
          expires_at TIMESTAMP NOT NULL
        );
      `
    });

    if (adminSessionsError) {
      console.log('Admin sessions table already exists or error:', adminSessionsError.message);
    } else {
      console.log('✅ Admin sessions table created');
    }

    console.log('🎉 Database setup completed successfully!');

  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 
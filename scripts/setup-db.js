import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';

// Load environment variables
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function setupDatabase() {
  try {
    console.log('Setting up database tables...');

    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        google_id TEXT UNIQUE,
        email TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create submissions table
    await sql`
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
    `;

    // Create validations table
    await sql`
      CREATE TABLE IF NOT EXISTS validations (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id VARCHAR REFERENCES users(id),
        idea TEXT NOT NULL,
        target_customer TEXT NOT NULL,
        problem_solved TEXT NOT NULL,
        feedback TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // Create admin_sessions table
    await sql`
      CREATE TABLE IF NOT EXISTS admin_sessions (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        created_at TIMESTAMP DEFAULT NOW(),
        expires_at TIMESTAMP NOT NULL
      );
    `;

    // Create link_clicks table
    await sql`
      CREATE TABLE IF NOT EXISTS link_clicks (
        id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
        company TEXT NOT NULL,
        link_type TEXT NOT NULL,
        url TEXT NOT NULL,
        click_count INTEGER NOT NULL DEFAULT 0,
        last_clicked TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ Database tables created successfully!');
    
    // Create indexes for better performance
    console.log('Creating indexes...');
    
    await sql`CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_validations_user_id ON validations(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_validations_created_at ON validations(created_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_link_clicks_company_type ON link_clicks(company, link_type);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_link_clicks_click_count ON link_clicks(click_count DESC);`;
    
    console.log('✅ Indexes created successfully!');
    
    console.log('\n🎉 Database setup completed successfully!');
    console.log('\nTables created:');
    console.log('- users');
    console.log('- submissions');
    console.log('- validations');
    console.log('- admin_sessions');
    console.log('- link_clicks');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

setupDatabase(); 
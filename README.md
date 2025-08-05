# ValidatorAI - Local Development Setup

This is a **ValidatorAI** application that helps entrepreneurs validate their business ideas using AI. The application was originally built on Replit and has been adapted for local development.

## Tech Stack

- **Frontend**: React + TypeScript + Vite + Tailwind CSS + Radix UI
- **Backend**: Express.js + TypeScript + Drizzle ORM + PostgreSQL
- **AI Integration**: OpenAI API for idea validation
- **Authentication**: JWT-based with Google OAuth support
- **Newsletter**: Beehiiv integration for automatic newsletter subscriptions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- OpenAI API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the sample environment files and configure your variables:

```bash
# Backend environment
cp env.example .env

# Frontend environment
cp client/env.example client/.env
```

Edit `.env` and set the following variables:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `OPENAI_API_KEY`: Your OpenAI API key
- `JWT_SECRET`: A secure random string (optional - will be auto-generated)
- `PORT`: Server port (default: 5000)

Edit `client/.env` and set:
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `VITE_BEEHIIV_API_KEY`: Your Beehiiv API key for newsletter subscriptions

### 3. Supabase Setup

#### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up and create a new project
3. Copy your project URL and anon key from Settings → API

#### Step 2: Set Up Google OAuth
1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Set up Google OAuth in Google Cloud Console:
   - Go to https://console.cloud.google.com
   - Create a new project or select existing one
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
   - Set authorized redirect URI to: `https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback`
4. Copy the Client ID and Client Secret to Supabase Google provider settings

#### Step 3: Create Database Tables
Run the SQL commands in Supabase SQL Editor to create the required tables:

```sql
-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  google_id TEXT UNIQUE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  avatar TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create submissions table
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

-- Create validations table
CREATE TABLE IF NOT EXISTS validations (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR REFERENCES users(id),
  idea TEXT NOT NULL,
  target_customer TEXT NOT NULL,
  problem_solved TEXT NOT NULL,
  feedback TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL
);
```

### 4. Database Migration

Run the database migrations to create the required tables:

```bash
npm run db:push
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - TypeScript type checking

## Project Structure

```
val-journey/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── db.ts             # Database connection
│   └── auth.ts           # Authentication
├── shared/               # Shared types and schemas
│   └── schema.ts         # Database schema
└── attached_assets/      # Static assets
```

## Features

- **Idea Validation**: AI-powered business idea analysis
- **User Authentication**: Google OAuth integration
- **Newsletter Integration**: Automatic Beehiiv newsletter subscriptions
- **Admin Panel**: Submission management
- **Responsive Design**: Mobile-friendly interface
- **Real-time Feedback**: Instant validation results

## Newsletter Integration

The application automatically subscribes users to the Beehiiv newsletter when they complete an idea validation. This feature:

- **Automatic Subscription**: Users are subscribed after successful validation
- **User Data**: Uses email and name from Google OAuth profile
- **Fallback Handling**: Uses email prefix if full name is not available
- **Error Handling**: Gracefully handles subscription failures without affecting validation
- **Visual Feedback**: Shows success indicator in the validation results

### Setup

1. Get your Beehiiv API key from your Beehiiv dashboard
2. Add `VITE_BEEHIIV_API_KEY` to your `client/.env` file
3. The publication ID is configured in the code (update if needed)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify your `DATABASE_URL` is correct
   - Ensure PostgreSQL is running
   - Check firewall settings

2. **OpenAI API Error**
   - Verify your `OPENAI_API_KEY` is valid
   - Check your OpenAI account balance

3. **Port Already in Use**
   - Change the `PORT` in your `.env` file
   - Kill processes using port 5000

### Getting Help

If you encounter issues:
1. Check the console for error messages
2. Verify all environment variables are set
3. Ensure all dependencies are installed
4. Check database connectivity

## License

MIT License - see LICENSE file for details 
// Environment validation and security checks
export function validateEnvironment() {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'OPENAI_API_KEY'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Validate SUPABASE_URL format (basic check)
  const supabaseUrl = process.env.SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
    throw new Error('SUPABASE_URL must be a valid HTTPS URL');
  }

  // Validate SUPABASE_ANON_KEY format (basic check)
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  if (supabaseKey && supabaseKey.length < 20) {
    console.warn('SUPABASE_ANON_KEY does not appear to be in expected format');
  }

  // Validate OPENAI_API_KEY format (basic check)
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey && !openaiKey.startsWith('sk-')) {
    console.warn('OPENAI_API_KEY does not appear to be in expected format');
  }

  // Generate JWT_SECRET if not provided
  if (!process.env.JWT_SECRET) {
    process.env.JWT_SECRET = generateSecureSecret();
    console.log('Generated JWT_SECRET for this session');
  }

  console.log('✅ Environment validation passed');
}

import crypto from 'node:crypto';

function generateSecureSecret(): string {
  return crypto.randomBytes(64).toString('hex');
}
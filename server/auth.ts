import { Request, Response, NextFunction } from "express";
import { supabase } from "./supabase";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

async function verifySupabaseToken(token: string): Promise<{ id: string; email: string; name: string } | null> {
  try {
    console.log('Verifying Supabase token...');
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.log('Supabase token verification failed:', error);
      return null;
    }
    
    console.log('Supabase user found:', user.email);

    // Get or create user in our database
    console.log('Looking up user in database:', user.email);
    let dbUser = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    if (!dbUser.data) {
      console.log('User not found in database, creating new user...');
      // Create user if they don't exist
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          email: user.email!,
          name: user.user_metadata?.full_name || user.email!.split('@')[0],
          google_id: user.id
        })
        .select()
        .single();

      if (createError || !newUser) {
        console.error('Failed to create user:', createError);
        return null;
      }
      
      console.log('New user created:', newUser.id);
      dbUser = { data: newUser, error: null, count: null, status: 200, statusText: 'OK' };
    } else {
      console.log('Existing user found:', dbUser.data.id);
    }

    const userInfo = {
      id: dbUser.data.id,
      email: dbUser.data.email,
      name: dbUser.data.name
    };
    console.log('Returning user info:', userInfo);
    return userInfo;
  } catch (error) {
    console.error('Error verifying Supabase token:', error);
    return null;
  }
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = await verifySupabaseToken(token);
  if (!user) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  req.user = user;
  next();
}

export async function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  console.log('optionalAuth middleware called');
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : req.cookies?.auth_token;

  console.log('Auth header:', authHeader ? 'present' : 'missing');
  console.log('Token found:', token ? 'yes' : 'no');

  if (token) {
    const user = await verifySupabaseToken(token);
    if (user) {
      req.user = user;
      console.log('User attached to request:', user.id);
    } else {
      console.log('Failed to verify token');
    }
  } else {
    console.log('No token provided');
  }

  next();
}
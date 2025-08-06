import { supabase } from "./supabase";
import type { User, InsertUser, Validation, InsertValidation, Submission, InsertSubmission, AdminSession, InsertAdminSession } from "./supabase";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  createValidation(insertValidation: InsertValidation, feedback: string, userId?: string): Promise<Validation>;
  getUserValidations(userId: string): Promise<Validation[]>;
  getAllValidations(): Promise<Validation[]>;
  createSubmission(insertSubmission: InsertSubmission, userId?: string): Promise<Submission>;
  getUserSubmissions(userId: string): Promise<Submission[]>;
  getAllSubmissions(): Promise<Submission[]>;
  createAdminSession(insertSession: InsertAdminSession): Promise<AdminSession>;
  getAdminSession(id: string): Promise<AdminSession | undefined>;
  deleteExpiredAdminSessions(): Promise<void>;
}

export class SupabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('google_id', googleId)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert(insertUser)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create user: ${error.message}`);
    return data as User;
  }

  async createValidation(insertValidation: InsertValidation, feedback: string, userId?: string): Promise<Validation> {
    const validationData = {
      idea: insertValidation.idea,
      target_customer: insertValidation.targetCustomer,
      problem_solved: insertValidation.problemSolved,
      feedback,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('validations')
      .insert(validationData)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create validation: ${error.message}`);
    
    // Transform snake_case to camelCase for frontend compatibility
    return {
      id: data.id,
      userId: data.user_id,
      idea: data.idea,
      targetCustomer: data.target_customer,
      problemSolved: data.problem_solved,
      feedback: data.feedback,
      createdAt: data.created_at
    } as unknown as Validation;
  }

  async getUserValidations(userId: string): Promise<Validation[]> {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get user validations: ${error.message}`);
    
    // Transform snake_case to camelCase for frontend compatibility
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      idea: item.idea,
      targetCustomer: item.target_customer,
      problemSolved: item.problem_solved,
      feedback: item.feedback,
      createdAt: item.created_at
    })) as unknown as Validation[];
  }

  async getAllValidations(): Promise<Validation[]> {
    const { data, error } = await supabase
      .from('validations')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get all validations: ${error.message}`);
    
    // Transform snake_case to camelCase for frontend compatibility
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      idea: item.idea,
      targetCustomer: item.target_customer,
      problemSolved: item.problem_solved,
      feedback: item.feedback,
      createdAt: item.created_at
    })) as unknown as Validation[];
  }

  async createSubmission(insertSubmission: InsertSubmission, userId?: string): Promise<Submission> {
    const submissionData = {
      name: insertSubmission.name,
      email: insertSubmission.email,
      project_name: insertSubmission.projectName,
      project_summary: insertSubmission.projectSummary,
      site_url: insertSubmission.siteUrl,
      what_do_you_need: insertSubmission.whatDoYouNeed,
      screenshot_path: insertSubmission.screenshotPath,
      user_id: userId
    };

    const { data, error } = await supabase
      .from('submissions')
      .insert(submissionData)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create submission: ${error.message}`);
    
    // Transform snake_case to camelCase for frontend compatibility
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      email: data.email,
      projectName: data.project_name,
      projectSummary: data.project_summary,
      siteUrl: data.site_url,
      whatDoYouNeed: data.what_do_you_need,
      screenshotPath: data.screenshot_path,
      createdAt: data.created_at
    } as unknown as Submission;
  }

  async getUserSubmissions(userId: string): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get user submissions: ${error.message}`);
    
    // Transform snake_case to camelCase for frontend compatibility
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      email: item.email,
      projectName: item.project_name,
      projectSummary: item.project_summary,
      siteUrl: item.site_url,
      whatDoYouNeed: item.what_do_you_need,
      screenshotPath: item.screenshot_path,
      createdAt: item.created_at
    })) as unknown as Submission[];
  }

  async getAllSubmissions(): Promise<Submission[]> {
    const { data, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Failed to get all submissions: ${error.message}`);
    
    // Transform snake_case to camelCase for frontend compatibility
    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      name: item.name,
      email: item.email,
      projectName: item.project_name,
      projectSummary: item.project_summary,
      siteUrl: item.site_url,
      whatDoYouNeed: item.what_do_you_need,
      screenshotPath: item.screenshot_path,
      createdAt: item.created_at
    })) as unknown as Submission[];
  }

  async createAdminSession(insertSession: InsertAdminSession): Promise<AdminSession> {
    const { data, error } = await supabase
      .from('admin_sessions')
      .insert(insertSession)
      .select()
      .single();
    
    if (error) throw new Error(`Failed to create admin session: ${error.message}`);
    return data as AdminSession;
  }

  async getAdminSession(id: string): Promise<AdminSession | undefined> {
    const { data, error } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error || !data) return undefined;
    return data as AdminSession;
  }

  async deleteExpiredAdminSessions(): Promise<void> {
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('admin_sessions')
      .delete()
      .lt('expires_at', now);
    
    if (error) throw new Error(`Failed to delete expired admin sessions: ${error.message}`);
  }
}

export const storage = new SupabaseStorage(); 
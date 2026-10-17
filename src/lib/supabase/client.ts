/**
 * Supabase Client Initialization
 * 
 * This file initializes the Supabase client with proper configuration
 * for both server-side and client-side usage.
 * 
 * Usage:
 *   - Server-side: import { supabaseClient } from '@/lib/supabase/client'
 *   - Client-side (browser): import { supabaseClient } from '@/lib/supabase/client'
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Environment variable validation
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 'placeholder-service-key';

/**
 * Client-side Supabase client
 * Uses public anon key for safe client-side operations
 */
export const supabaseClient: any = createClient<any>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
    global: {
      headers: {
        // Custom headers can be added here if needed
      },
    },
  }
);

/**
 * Server-side Supabase client
 * Uses service role key for privileged operations
 * Only available in server-side code (API routes, server components)
 */
let supabaseServiceClient: any = null;

export function getSupabaseServiceClient(): any {
  if (typeof window !== 'undefined') {
    throw new Error(
      'Service client should not be used in browser context. ' +
      'Use supabaseClient instead.'
    );
  }

  if (!supabaseServiceClient) {
    supabaseServiceClient = createClient<any>(
      supabaseUrl,
      supabaseServiceKey,
      {
        auth: {
          persistSession: false, // Service client doesn't need sessions
          autoRefreshToken: false,
        },
      }
    );
  }

  return supabaseServiceClient;
}

/**
 * Type-safe database client wrapper
 * Provides better error handling and logging
 */
export class SupabaseClientWrapper {
  private client: any;

  constructor(useServiceKey: boolean = false) {
    if (useServiceKey && typeof window === 'undefined') {
      this.client = getSupabaseServiceClient();
    } else {
      this.client = supabaseClient;
    }
  }

  /**
   * Get reference to underlying client
   */
  getClient() {
    return this.client;
  }

  /**
   * Health check - verify connection
   */
  async healthCheck(): Promise<boolean> {
    try {
      const { error } = await this.client
        .from('survey_responses')
        .select('id')
        .limit(1);

      return !error;
    } catch {
      return false;
    }
  }

  /**
   * Insert survey response with error handling
   */
  async insertResponse(data: any) {
    try {
      const { data: response, error } = await this.client
        .from('survey_responses')
        .insert([data])
        .select()
        .single();

      if (error) {
        throw new Error(`Database insert error: ${error.message}`);
      }

      return { success: true, data: response };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to insert response:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Fetch analytics with error handling
   */
  async getAnalytics(startDate?: Date, endDate?: Date) {
    try {
      let query = this.client.from('analytics_cache').select('*');

      if (startDate) {
        query = query.gte('metric_date', startDate.toISOString().split('T')[0]);
      }

      if (endDate) {
        query = query.lte('metric_date', endDate.toISOString().split('T')[0]);
      }

      const { data, error } = await query.order('metric_date', { ascending: false });

      if (error) {
        throw new Error(`Database query error: ${error.message}`);
      }

      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Failed to fetch analytics:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Log audit action
   */
  async logAuditAction(action: string, details: any) {
    try {
      const { error } = await this.client.from('audit_logs').insert([
        {
          action,
          details,
          status: 'success',
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Failed to log audit action:', error);
      }
    } catch (error) {
      console.error('Error in audit logging:', error);
    }
  }
}

/**
 * Export singleton instances for convenience
 */
export const supabase = {
  client: supabaseClient,
  service: getSupabaseServiceClient,
};

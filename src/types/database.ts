/**
 * Supabase-generated database types — placeholder.
 *
 * Run `npm run db:types` after the Supabase project is set up to overwrite
 * this file with the real schema bindings. Until then, this minimal stub
 * lets the codebase compile.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'visitor' | 'member' | 'stylist' | 'admin';
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'visitor' | 'member' | 'stylist' | 'admin';
          avatar_url?: string | null;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
      };
      stylists: {
        Row: {
          id: string;
          slug: string;
          owner_id: string | null;
          name: string;
          city: string;
          handle: string | null;
          bio: string | null;
          tags: string[];
          booking_url: string | null;
          phone: string | null;
          instagram: string | null;
          tiktok: string | null;
          facebook: string | null;
          website: string | null;
          published: boolean;
          deposit_required: boolean;
          service_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['stylists']['Row'],
          'id' | 'created_at' | 'updated_at' | 'service_count'
        > & { id?: string; service_count?: number };
        Update: Partial<Database['public']['Tables']['stylists']['Insert']>;
      };
      reports: {
        Row: {
          id: string;
          stylist_id: string | null;
          reporter_id: string | null;
          issue_type: string;
          details: string;
          status: 'open' | 'in_review' | 'resolved' | 'rejected';
          resolved_by: string | null;
          resolved_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['reports']['Row'],
          'id' | 'created_at' | 'status' | 'resolved_by' | 'resolved_at'
        > & { id?: string; status?: Database['public']['Tables']['reports']['Row']['status'] };
        Update: Partial<Database['public']['Tables']['reports']['Insert']>;
      };
      suggestions: {
        Row: {
          id: string;
          submitter_id: string | null;
          business_name: string;
          city: string;
          instagram: string | null;
          tiktok: string | null;
          facebook: string | null;
          website: string | null;
          booking_url: string | null;
          phone: string | null;
          styles: string[];
          notes: string | null;
          status: 'pending' | 'approved' | 'rejected';
          reviewed_by: string | null;
          reviewed_at: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['suggestions']['Row'],
          'id' | 'created_at' | 'status' | 'reviewed_by' | 'reviewed_at'
        > & { id?: string };
        Update: Partial<Database['public']['Tables']['suggestions']['Insert']>;
      };
      favorites: {
        Row: {
          user_id: string;
          stylist_id: string;
          created_at: string;
        };
        Insert: { user_id: string; stylist_id: string };
        Update: never;
      };
      admin_actions: {
        Row: {
          id: string;
          admin_id: string;
          action_type: string;
          target_table: string;
          target_id: string;
          metadata: Json;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['admin_actions']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: never;
      };
      events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          properties: Json;
          created_at: string;
        };
        Insert: Omit<
          Database['public']['Tables']['events']['Row'],
          'id' | 'created_at'
        > & { id?: string };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

/**
 * Generated database types — derived from the live Supabase schema via the
 * PostgREST OpenAPI endpoint (project: lrfjtubzddlmswsishdm).
 *
 * Regenerate at any time:
 *   npx supabase gen types typescript --project-id lrfjtubzddlmswsishdm \
 *     > src/types/database.ts
 *
 * Or via the npm script (requires SUPABASE_ACCESS_TOKEN env var):
 *   npm run db:types
 *
 * ⚠️  DO NOT hand-edit the Database type — run the generator instead.
 *     Safe to extend via `types/index.ts` using the exported helpers.
 *
 * IMPORTANT: This file uses `export type Database = { … }` (a type alias),
 * NOT `export interface Database`. The distinction matters: supabase-js v2
 * checks `Database['public'] extends GenericSchema` inside a conditional type
 * on the SupabaseClient class. TypeScript evaluates type-alias conditionals
 * lazily; interface-based types can fail the constraint in TS ≥ 5.7, causing
 * every `.from()` call to infer `never`. Always keep this as a type alias.
 */

// ---------------------------------------------------------------------------
// Primitive JSON type (matches PostgREST / Supabase CLI canonical definition)
// ---------------------------------------------------------------------------

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ---------------------------------------------------------------------------
// Database type alias — evaluated lazily by TypeScript
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      // ── admin_actions ────────────────────────────────────────────────────
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
        Insert: {
          id?: string;
          admin_id: string;
          action_type: string;
          target_table: string;
          target_id: string;
          metadata: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string;
          action_type?: string;
          target_table?: string;
          target_id?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'admin_actions_admin_id_fkey';
            columns: ['admin_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── events ───────────────────────────────────────────────────────────
      events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          properties: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          event_name: string;
          properties: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          event_name?: string;
          properties?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'events_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── favorites ────────────────────────────────────────────────────────
      favorites: {
        Row: {
          user_id: string;
          stylist_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          stylist_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          stylist_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_stylist_id_fkey';
            columns: ['stylist_id'];
            isOneToOne: false;
            referencedRelation: 'stylists';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── profiles ─────────────────────────────────────────────────────────
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
          id?: string;
          email: string;
          full_name?: string | null;
          role?: 'visitor' | 'member' | 'stylist' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'visitor' | 'member' | 'stylist' | 'admin';
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      // ── reports ──────────────────────────────────────────────────────────
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
        Insert: {
          id?: string;
          stylist_id?: string | null;
          reporter_id?: string | null;
          issue_type: string;
          details: string;
          status?: 'open' | 'in_review' | 'resolved' | 'rejected';
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          stylist_id?: string | null;
          reporter_id?: string | null;
          issue_type?: string;
          details?: string;
          status?: 'open' | 'in_review' | 'resolved' | 'rejected';
          resolved_by?: string | null;
          resolved_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_stylist_id_fkey';
            columns: ['stylist_id'];
            isOneToOne: false;
            referencedRelation: 'stylists';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_resolved_by_fkey';
            columns: ['resolved_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── stylists ─────────────────────────────────────────────────────────
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
        Insert: {
          id?: string;
          slug: string;
          owner_id?: string | null;
          name: string;
          city: string;
          handle?: string | null;
          bio?: string | null;
          tags?: string[];
          booking_url?: string | null;
          phone?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          website?: string | null;
          published?: boolean;
          deposit_required?: boolean;
          service_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          owner_id?: string | null;
          name?: string;
          city?: string;
          handle?: string | null;
          bio?: string | null;
          tags?: string[];
          booking_url?: string | null;
          phone?: string | null;
          instagram?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          website?: string | null;
          published?: boolean;
          deposit_required?: boolean;
          service_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stylists_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };

      // ── suggestions ──────────────────────────────────────────────────────
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
        Insert: {
          id?: string;
          submitter_id?: string | null;
          business_name: string;
          city: string;
          instagram?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          website?: string | null;
          booking_url?: string | null;
          phone?: string | null;
          styles?: string[];
          notes?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          submitter_id?: string | null;
          business_name?: string;
          city?: string;
          instagram?: string | null;
          tiktok?: string | null;
          facebook?: string | null;
          website?: string | null;
          booking_url?: string | null;
          phone?: string | null;
          styles?: string[];
          notes?: string | null;
          status?: 'pending' | 'approved' | 'rejected';
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'suggestions_submitter_id_fkey';
            columns: ['submitter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'suggestions_reviewed_by_fkey';
            columns: ['reviewed_by'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };

    Views: Record<string, never>;

    Functions: Record<string, never>;

    Enums: {
      user_role: 'visitor' | 'member' | 'stylist' | 'admin';
      report_status: 'open' | 'in_review' | 'resolved' | 'rejected';
      suggestion_status: 'pending' | 'approved' | 'rejected';
    };

    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ---------------------------------------------------------------------------
// Supabase CLI–style helper types
// (complements the simpler helpers in src/types/index.ts)
// ---------------------------------------------------------------------------

type PublicSchema = Database[Extract<keyof Database, 'public'>];

/** Row type for any public table or view. */
export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] &
        PublicSchema['Views'])
    ? (PublicSchema['Tables'] &
        PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

/** Insert type for any public table. */
export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

/** Update type for any public table. */
export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

/** Enum value type for any public enum. */
export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
    ? PublicSchema['Enums'][PublicEnumNameOrOptions]
    : never;

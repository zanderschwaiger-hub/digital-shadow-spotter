export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_actions: {
        Row: {
          action_type: string
          created_at: string
          id: string
          proposed_payload: Json
          reason: string | null
          resolved_at: string | null
          status: string
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          proposed_payload?: Json
          reason?: string | null
          resolved_at?: string | null
          status?: string
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          proposed_payload?: Json
          reason?: string | null
          resolved_at?: string | null
          status?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          created_at: string
          details: string | null
          id: string
          read_at: string | null
          resolved_at: string | null
          severity: string
          source_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          read_at?: string | null
          resolved_at?: string | null
          severity?: string
          source_type?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          read_at?: string | null
          resolved_at?: string | null
          severity?: string
          source_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          created_at: string
          event_type: string
          id: string
          payload_json: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          payload_json?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          payload_json?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      baseline_artifacts: {
        Row: {
          artifact_type: string
          content_json: Json
          created_at: string
          exported_at: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_type: string
          content_json?: Json
          created_at?: string
          exported_at?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_type?: string
          content_json?: Json
          created_at?: string
          exported_at?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      broker_sites: {
        Row: {
          created_at: string
          date_submitted: string | null
          id: string
          notes: string | null
          site_name: string
          status: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date_submitted?: string | null
          id?: string
          notes?: string | null
          site_name: string
          status?: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          date_submitted?: string | null
          id?: string
          notes?: string | null
          site_name?: string
          status?: string
          url?: string | null
          user_id?: string
        }
        Relationships: []
      }
      governance_pillars: {
        Row: {
          created_at: string
          description: string
          id: string
          minimum_tier: number
          name: string
          pillar_order: number
          questions_json: Json
          steps_json: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          minimum_tier?: number
          name: string
          pillar_order: number
          questions_json?: Json
          steps_json?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          minimum_tier?: number
          name?: string
          pillar_order?: number
          questions_json?: Json
          steps_json?: Json
          updated_at?: string
        }
        Relationships: []
      }
      inventory_accounts: {
        Row: {
          account_name: string
          category: string
          created_at: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          category?: string
          created_at?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inventory_domains: {
        Row: {
          created_at: string
          domain: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          domain: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          domain?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inventory_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          is_primary: boolean
          notes: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_primary?: boolean
          notes?: string | null
          user_id?: string
        }
        Relationships: []
      }
      inventory_phones: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          phone: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          phone: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      inventory_usernames: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          platform: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          platform?: string | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          platform?: string | null
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string
          digest_frequency: string
          email_enabled: boolean
          id: string
          sms_enabled: boolean
          sms_high_only: boolean
          user_id: string
        }
        Insert: {
          created_at?: string
          digest_frequency?: string
          email_enabled?: boolean
          id?: string
          sms_enabled?: boolean
          sms_high_only?: boolean
          user_id: string
        }
        Update: {
          created_at?: string
          digest_frequency?: string
          email_enabled?: boolean
          id?: string
          sms_enabled?: boolean
          sms_high_only?: boolean
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          consent_accepted_at: string | null
          created_at: string
          id: string
          onboarding_completed: boolean
          tier: string
          tier_level: number
          updated_at: string
          user_id: string
        }
        Insert: {
          consent_accepted_at?: string | null
          created_at?: string
          id?: string
          onboarding_completed?: boolean
          tier?: string
          tier_level?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          consent_accepted_at?: string | null
          created_at?: string
          id?: string
          onboarding_completed?: boolean
          tier?: string
          tier_level?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      signals_settings: {
        Row: {
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_check_at: string | null
          next_check_at: string | null
          signal_type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_check_at?: string | null
          next_check_at?: string | null
          signal_type: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_check_at?: string | null
          next_check_at?: string | null
          signal_type?: string
          user_id?: string
        }
        Relationships: []
      }
      task_catalog: {
        Row: {
          blast_radius: string | null
          course_order: number
          dependency_task_ids: string[] | null
          description: string
          effort_minutes: number | null
          id: string
          pillar_id: string | null
          title: string
        }
        Insert: {
          blast_radius?: string | null
          course_order: number
          dependency_task_ids?: string[] | null
          description: string
          effort_minutes?: number | null
          id: string
          pillar_id?: string | null
          title: string
        }
        Update: {
          blast_radius?: string | null
          course_order?: number
          dependency_task_ids?: string[] | null
          description?: string
          effort_minutes?: number | null
          id?: string
          pillar_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_catalog_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "governance_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          priority: number
          sequence_order: number | null
          source_id: string | null
          source_type: string | null
          status: string
          steps_json: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number
          sequence_order?: number | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          steps_json?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: number
          sequence_order?: number | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          steps_json?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_pillar_progress: {
        Row: {
          answers_json: Json | null
          completed_at: string | null
          created_at: string
          decision_log: Json | null
          id: string
          pillar_id: string
          score: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          answers_json?: Json | null
          completed_at?: string | null
          created_at?: string
          decision_log?: Json | null
          id?: string
          pillar_id: string
          score?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          answers_json?: Json | null
          completed_at?: string | null
          created_at?: string
          decision_log?: Json | null
          id?: string
          pillar_id?: string
          score?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_pillar_progress_pillar_id_fkey"
            columns: ["pillar_id"]
            isOneToOne: false
            referencedRelation: "governance_pillars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      user_entitlements: {
        Row: {
          baseline_access: boolean | null
          governance_agent_access: boolean | null
          guided_cleanup_access: boolean | null
          tier_level: number | null
          user_id: string | null
        }
        Insert: {
          baseline_access?: never
          governance_agent_access?: never
          guided_cleanup_access?: never
          tier_level?: number | null
          user_id?: string | null
        }
        Update: {
          baseline_access?: never
          governance_agent_access?: never
          guided_cleanup_access?: never
          tier_level?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_course_tasks: { Args: never; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      campaign_documents: {
        Row: {
          campaign_id: string | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_at: string | null
        }
        Insert: {
          campaign_id?: string | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_at?: string | null
        }
        Update: {
          campaign_id?: string | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_at?: string | null
        }
        Relationships: []
      }
      campaigns: {
        Row: {
          beneficiary_account_name: string | null
          beneficiary_account_no: string | null
          beneficiary_bank_code: string | null
          category: Database["public"]["Enums"]["campaign_category"]
          created_at: string
          description: string
          end_date: string | null
          goal: number
          id: string
          name: string
          org: string
          owner_id: string
          raised: number
          social_link: string | null
          squad_bank: string | null
          squad_customer_id: string | null
          squad_virtual_account_no: string | null
          status: Database["public"]["Enums"]["campaign_status"]
          trust_level: Database["public"]["Enums"]["trust_level"]
          trust_score: number
          updated_at: string
          wallet_address: string | null
        }
        Insert: {
          beneficiary_account_name?: string | null
          beneficiary_account_no?: string | null
          beneficiary_bank_code?: string | null
          category?: Database["public"]["Enums"]["campaign_category"]
          created_at?: string
          description: string
          end_date?: string | null
          goal: number
          id?: string
          name: string
          org: string
          owner_id: string
          raised?: number
          social_link?: string | null
          squad_bank?: string | null
          squad_customer_id?: string | null
          squad_virtual_account_no?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          trust_level?: Database["public"]["Enums"]["trust_level"]
          trust_score?: number
          updated_at?: string
          wallet_address?: string | null
        }
        Update: {
          beneficiary_account_name?: string | null
          beneficiary_account_no?: string | null
          beneficiary_bank_code?: string | null
          category?: Database["public"]["Enums"]["campaign_category"]
          created_at?: string
          description?: string
          end_date?: string | null
          goal?: number
          id?: string
          name?: string
          org?: string
          owner_id?: string
          raised?: number
          social_link?: string | null
          squad_bank?: string | null
          squad_customer_id?: string | null
          squad_virtual_account_no?: string | null
          status?: Database["public"]["Enums"]["campaign_status"]
          trust_level?: Database["public"]["Enums"]["trust_level"]
          trust_score?: number
          updated_at?: string
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ledger_entries: {
        Row: {
          ai_explanation: string | null
          amount: number
          campaign_id: string
          created_at: string
          id: string
          label: string | null
          nip_ref: string | null
          signature: string
          transaction_id: string
          trust_level: Database["public"]["Enums"]["trust_level"]
          trust_score: number | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          ai_explanation?: string | null
          amount: number
          campaign_id: string
          created_at?: string
          id?: string
          label?: string | null
          nip_ref?: string | null
          signature: string
          transaction_id: string
          trust_level: Database["public"]["Enums"]["trust_level"]
          trust_score?: number | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          ai_explanation?: string | null
          amount?: number
          campaign_id?: string
          created_at?: string
          id?: string
          label?: string | null
          nip_ref?: string | null
          signature?: string
          transaction_id?: string
          trust_level?: Database["public"]["Enums"]["trust_level"]
          trust_score?: number | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ledger_entries_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ledger_entries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          ai_explanation: string | null
          amount: number
          campaign_id: string
          created_at: string
          currency: string
          donor_id: string | null
          id: string
          label: string | null
          metadata: Json | null
          signature: string
          squad_ref: string
          squad_verified: boolean
          status: Database["public"]["Enums"]["transaction_status"]
          trust_level: Database["public"]["Enums"]["trust_level"]
          trust_score: number | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Insert: {
          ai_explanation?: string | null
          amount: number
          campaign_id: string
          created_at?: string
          currency?: string
          donor_id?: string | null
          id?: string
          label?: string | null
          metadata?: Json | null
          signature: string
          squad_ref: string
          squad_verified?: boolean
          status?: Database["public"]["Enums"]["transaction_status"]
          trust_level?: Database["public"]["Enums"]["trust_level"]
          trust_score?: number | null
          type: Database["public"]["Enums"]["transaction_type"]
        }
        Update: {
          ai_explanation?: string | null
          amount?: number
          campaign_id?: string
          created_at?: string
          currency?: string
          donor_id?: string | null
          id?: string
          label?: string | null
          metadata?: Json | null
          signature?: string
          squad_ref?: string
          squad_verified?: boolean
          status?: Database["public"]["Enums"]["transaction_status"]
          trust_level?: Database["public"]["Enums"]["trust_level"]
          trust_score?: number | null
          type?: Database["public"]["Enums"]["transaction_type"]
        }
        Relationships: [
          {
            foreignKeyName: "transactions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_campaign_raised: {
        Args: { p_amount: number; p_campaign_id: string }
        Returns: undefined
      }
    }
    Enums: {
      campaign_category:
        | "medical"
        | "education"
        | "relief"
        | "creative"
        | "community"
        | "other"
      campaign_status: "active" | "completed" | "flagged" | "paused"
      transaction_status: "pending" | "confirmed" | "failed" | "flagged"
      transaction_type: "donation" | "withdrawal" | "refund"
      trust_level: "clean" | "watch" | "suspicious"
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
    Enums: {
      campaign_category: [
        "medical",
        "education",
        "relief",
        "creative",
        "community",
        "other",
      ],
      campaign_status: ["active", "completed", "flagged", "paused"],
      transaction_status: ["pending", "confirmed", "failed", "flagged"],
      transaction_type: ["donation", "withdrawal", "refund"],
      trust_level: ["clean", "watch", "suspicious"],
    },
  },
} as const

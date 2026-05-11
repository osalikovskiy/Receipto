export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      claims: {
        Row: {
          bgb_paragraphs: string[] | null
          claim_type: string
          created_at: string
          defect_description: string | null
          id: string
          letter_text: string | null
          product_id: string | null
          resolution_amount: number | null
          resolved_at: string | null
          sent_at: string | null
          status: string
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          bgb_paragraphs?: string[] | null
          claim_type: string
          created_at?: string
          defect_description?: string | null
          id?: string
          letter_text?: string | null
          product_id?: string | null
          resolution_amount?: number | null
          resolved_at?: string | null
          sent_at?: string | null
          status?: string
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          bgb_paragraphs?: string[] | null
          claim_type?: string
          created_at?: string
          defect_description?: string | null
          id?: string
          letter_text?: string | null
          product_id?: string | null
          resolution_amount?: number | null
          resolved_at?: string | null
          sent_at?: string | null
          status?: string
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'claims_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'claims_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      notifications: {
        Row: {
          content: Json | null
          created_at: string
          id: string
          related_id: string | null
          scheduled_for: string
          sent_at: string | null
          type: string
          user_id: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          id?: string
          related_id?: string | null
          scheduled_for: string
          sent_at?: string | null
          type: string
          user_id: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          id?: string
          related_id?: string | null
          scheduled_for?: string
          sent_at?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      products: {
        Row: {
          beweislastumkehr_end: string
          category: string | null
          created_at: string
          id: string
          is_beruflich: boolean
          name: string
          price: number
          quantity: number
          receipt_id: string
          serial_number: string | null
          status: string
          user_id: string
          warranty_end_date: string
          warranty_start_date: string
        }
        Insert: {
          beweislastumkehr_end: string
          category?: string | null
          created_at?: string
          id?: string
          is_beruflich?: boolean
          name: string
          price: number
          quantity?: number
          receipt_id: string
          serial_number?: string | null
          status?: string
          user_id: string
          warranty_end_date: string
          warranty_start_date: string
        }
        Update: {
          beweislastumkehr_end?: string
          category?: string | null
          created_at?: string
          id?: string
          is_beruflich?: boolean
          name?: string
          price?: number
          quantity?: number
          receipt_id?: string
          serial_number?: string | null
          status?: string
          user_id?: string
          warranty_end_date?: string
          warranty_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_receipt_id_fkey'
            columns: ['receipt_id']
            isOneToOne: false
            referencedRelation: 'receipts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'products_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      receipts: {
        Row: {
          created_at: string
          currency: string
          id: string
          image_path: string
          merchant: string | null
          notes: string | null
          ocr_raw: Json | null
          ocr_status: string
          purchase_date: string | null
          total_amount: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          image_path: string
          merchant?: string | null
          notes?: string | null
          ocr_raw?: Json | null
          ocr_status?: string
          purchase_date?: string | null
          total_amount?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          image_path?: string
          merchant?: string | null
          notes?: string | null
          ocr_raw?: Json | null
          ocr_status?: string
          purchase_date?: string | null
          total_amount?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'receipts_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      savings_log: {
        Row: {
          amount: number
          claim_id: string | null
          created_at: string
          id: string
          source_type: string
          user_id: string
        }
        Insert: {
          amount: number
          claim_id?: string | null
          created_at?: string
          id?: string
          source_type: string
          user_id: string
        }
        Update: {
          amount?: number
          claim_id?: string | null
          created_at?: string
          id?: string
          source_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'savings_log_claim_id_fkey'
            columns: ['claim_id']
            isOneToOne: false
            referencedRelation: 'claims'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'savings_log_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions_tracked: {
        Row: {
          amount: number
          billing_cycle: string | null
          cancellation_notice_days: number
          created_at: string
          detected_via: string | null
          has_cancellation_button: boolean
          id: string
          last_charge: string | null
          last_used: string | null
          service_name: string
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle?: string | null
          cancellation_notice_days?: number
          created_at?: string
          detected_via?: string | null
          has_cancellation_button?: boolean
          id?: string
          last_charge?: string | null
          last_used?: string | null
          service_name: string
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string | null
          cancellation_notice_days?: number
          created_at?: string
          detected_via?: string | null
          has_cancellation_button?: boolean
          id?: string
          last_charge?: string | null
          last_used?: string | null
          service_name?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'subscriptions_tracked_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          locale: string
          push_token: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          locale?: string
          push_token?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          locale?: string
          push_token?: string | null
        }
        Relationships: []
      }
      waitlist: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

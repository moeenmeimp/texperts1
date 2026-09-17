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
      banner_ads: {
        Row: {
          accent: string
          ad_type: string
          created_at: string
          cta_text: string
          cta_url: string
          feed_every: number | null
          feed_mode: string
          feed_position: number | null
          html_code: string
          id: string
          image_path: string | null
          is_active: boolean
          page_slug: string | null
          placement: string
          sort_order: number
          subtitle: string
          title: string
        }
        Insert: {
          accent?: string
          ad_type?: string
          created_at?: string
          cta_text?: string
          cta_url?: string
          feed_every?: number | null
          feed_mode?: string
          feed_position?: number | null
          html_code?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          page_slug?: string | null
          placement?: string
          sort_order?: number
          subtitle?: string
          title: string
        }
        Update: {
          accent?: string
          ad_type?: string
          created_at?: string
          cta_text?: string
          cta_url?: string
          feed_every?: number | null
          feed_mode?: string
          feed_position?: number | null
          html_code?: string
          id?: string
          image_path?: string | null
          is_active?: boolean
          page_slug?: string | null
          placement?: string
          sort_order?: number
          subtitle?: string
          title?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          body: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          updated_at: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          updated_at?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          updated_at?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      market_rates: {
        Row: {
          change_pct: number
          id: string
          label: string
          sort_order: number
          symbol: string
          unit: string
          updated_at: string
          value: number
        }
        Insert: {
          change_pct?: number
          id?: string
          label: string
          sort_order?: number
          symbol: string
          unit?: string
          updated_at?: string
          value?: number
        }
        Update: {
          change_pct?: number
          id?: string
          label?: string
          sort_order?: number
          symbol?: string
          unit?: string
          updated_at?: string
          value?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          body: string
          conversation_id: string
          created_at: string
          file_name: string | null
          file_path: string | null
          file_type: string | null
          id: string
          sender_id: string
        }
        Insert: {
          body?: string
          conversation_id: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          conversation_id?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          file_type?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          content_html: string
          created_at: string
          id: string
          is_published: boolean
          page_type: string
          show_in_nav: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          content_html?: string
          created_at?: string
          id?: string
          is_published?: boolean
          page_type?: string
          show_in_nav?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          content_html?: string
          created_at?: string
          id?: string
          is_published?: boolean
          page_type?: string
          show_in_nav?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      poll_options: {
        Row: {
          id: string
          label: string
          poll_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          poll_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          poll_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_id: string
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_id?: string
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          question: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          category: string
          created_at: string
          details: string
          id: string
          image_path: string | null
          is_pinned: boolean
          post_type: string
          quantity: string
          rate: string
          title: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          details?: string
          id?: string
          image_path?: string | null
          is_pinned?: boolean
          post_type?: string
          quantity?: string
          rate?: string
          title: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          details?: string
          id?: string
          image_path?: string | null
          is_pinned?: boolean
          post_type?: string
          quantity?: string
          rate?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_profile_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string
          company_name: string
          created_at: string
          full_name: string
          id: string
          is_blocked: boolean
          updated_at: string
          whatsapp: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string
          company_name?: string
          created_at?: string
          full_name?: string
          id: string
          is_blocked?: boolean
          updated_at?: string
          whatsapp?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string
          company_name?: string
          created_at?: string
          full_name?: string
          id?: string
          is_blocked?: boolean
          updated_at?: string
          whatsapp?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          ads_enabled: boolean
          ads_feed_frequency: number
          brand_name: string
          contact_address: string
          contact_email: string
          contact_phone: string
          footer_text: string
          header_text: string
          id: number
          site_title: string
          theme: string
          updated_at: string
        }
        Insert: {
          ads_enabled?: boolean
          ads_feed_frequency?: number
          brand_name?: string
          contact_address?: string
          contact_email?: string
          contact_phone?: string
          footer_text?: string
          header_text?: string
          id?: number
          site_title?: string
          theme?: string
          updated_at?: string
        }
        Update: {
          ads_enabled?: boolean
          ads_feed_frequency?: number
          brand_name?: string
          contact_address?: string
          contact_email?: string
          contact_phone?: string
          footer_text?: string
          header_text?: string
          id?: number
          site_title?: string
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
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
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const

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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_deliverables: {
        Row: {
          created_at: string
          description: string | null
          file_name: string | null
          file_url: string
          id: string
          order_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url: string
          id?: string
          order_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          file_name?: string | null
          file_url?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_deliverables_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          content: string | null
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean | null
          order_id: string
          sender_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          order_id: string
          sender_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          client_id: string
          completed_at: string | null
          created_at: string
          creator_id: string
          delivery_date: string | null
          id: string
          payment_reference: string | null
          payment_status: string | null
          requirements: string | null
          requirements_file_url: string | null
          status: Database["public"]["Enums"]["order_status"]
          tier_id: string
          updated_at: string
          vyb_id: string
        }
        Insert: {
          amount: number
          client_id: string
          completed_at?: string | null
          created_at?: string
          creator_id: string
          delivery_date?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          requirements?: string | null
          requirements_file_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tier_id: string
          updated_at?: string
          vyb_id: string
        }
        Update: {
          amount?: number
          client_id?: string
          completed_at?: string | null
          created_at?: string
          creator_id?: string
          delivery_date?: string | null
          id?: string
          payment_reference?: string | null
          payment_status?: string | null
          requirements?: string | null
          requirements_file_url?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tier_id?: string
          updated_at?: string
          vyb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "vyb_tiers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vyb_id_fkey"
            columns: ["vyb_id"]
            isOneToOne: false
            referencedRelation: "vybs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          avg_rating: number | null
          bio: string | null
          created_at: string
          creator_level: Database["public"]["Enums"]["creator_level"] | null
          display_name: string | null
          id: string
          is_profile_complete: boolean | null
          location: string | null
          response_time: string | null
          role: Database["public"]["Enums"]["user_role"]
          skills: string[] | null
          total_orders: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string
          creator_level?: Database["public"]["Enums"]["creator_level"] | null
          display_name?: string | null
          id?: string
          is_profile_complete?: boolean | null
          location?: string | null
          response_time?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          total_orders?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          avg_rating?: number | null
          bio?: string | null
          created_at?: string
          creator_level?: Database["public"]["Enums"]["creator_level"] | null
          display_name?: string | null
          id?: string
          is_profile_complete?: boolean | null
          location?: string | null
          response_time?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          skills?: string[] | null
          total_orders?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          client_id: string
          comment: string | null
          created_at: string
          creator_id: string
          id: string
          order_id: string
          rating: number
          vyb_id: string
        }
        Insert: {
          client_id: string
          comment?: string | null
          created_at?: string
          creator_id: string
          id?: string
          order_id: string
          rating: number
          vyb_id: string
        }
        Update: {
          client_id?: string
          comment?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          order_id?: string
          rating?: number
          vyb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_vyb_id_fkey"
            columns: ["vyb_id"]
            isOneToOne: false
            referencedRelation: "vybs"
            referencedColumns: ["id"]
          },
        ]
      }
      vyb_media: {
        Row: {
          created_at: string
          id: string
          media_type: string
          sort_order: number | null
          title: string | null
          url: string
          vyb_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_type?: string
          sort_order?: number | null
          title?: string | null
          url: string
          vyb_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_type?: string
          sort_order?: number | null
          title?: string | null
          url?: string
          vyb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vyb_media_vyb_id_fkey"
            columns: ["vyb_id"]
            isOneToOne: false
            referencedRelation: "vybs"
            referencedColumns: ["id"]
          },
        ]
      }
      vyb_tiers: {
        Row: {
          created_at: string
          delivery_days: number
          description: string | null
          features: string[] | null
          id: string
          name: string
          price: number
          revision_count: number
          vyb_id: string
        }
        Insert: {
          created_at?: string
          delivery_days?: number
          description?: string | null
          features?: string[] | null
          id?: string
          name: string
          price: number
          revision_count?: number
          vyb_id: string
        }
        Update: {
          created_at?: string
          delivery_days?: number
          description?: string | null
          features?: string[] | null
          id?: string
          name?: string
          price?: number
          revision_count?: number
          vyb_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vyb_tiers_vyb_id_fkey"
            columns: ["vyb_id"]
            isOneToOne: false
            referencedRelation: "vybs"
            referencedColumns: ["id"]
          },
        ]
      }
      vybs: {
        Row: {
          avg_rating: number | null
          category_id: string | null
          created_at: string
          creator_id: string
          delivery_time: number | null
          description: string | null
          id: string
          is_published: boolean | null
          revision_count: number | null
          tags: string[] | null
          title: string
          total_orders: number | null
          updated_at: string
        }
        Insert: {
          avg_rating?: number | null
          category_id?: string | null
          created_at?: string
          creator_id: string
          delivery_time?: number | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          revision_count?: number | null
          tags?: string[] | null
          title: string
          total_orders?: number | null
          updated_at?: string
        }
        Update: {
          avg_rating?: number | null
          category_id?: string | null
          created_at?: string
          creator_id?: string
          delivery_time?: number | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          revision_count?: number | null
          tags?: string[] | null
          title?: string
          total_orders?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vybs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vybs_creator_id_fkey"
            columns: ["creator_id"]
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
      [_ in never]: never
    }
    Enums: {
      creator_level: "rising" | "pro" | "expert"
      order_status:
        | "pending"
        | "in_progress"
        | "revision_requested"
        | "delivered"
        | "completed"
        | "cancelled"
      user_role: "creator" | "client" | "both"
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
      creator_level: ["rising", "pro", "expert"],
      order_status: [
        "pending",
        "in_progress",
        "revision_requested",
        "delivered",
        "completed",
        "cancelled",
      ],
      user_role: ["creator", "client", "both"],
    },
  },
} as const

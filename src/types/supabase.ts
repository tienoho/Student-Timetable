export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          grade_level: number | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          grade_level?: number | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          grade_level?: number | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      schedules: {
        Row: {
          color: string | null
          created_at: string | null
          end_time: string
          id: string
          notes: string | null
          start_time: string
          subject_icon: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          end_time: string
          id?: string
          notes?: string | null
          start_time: string
          subject_icon?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          start_time?: string
          subject_icon?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedules_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];

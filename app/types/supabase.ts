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
      games: {
        Row: {
          id: number
          created_at: string
          status: string
        }
        Insert: {
          id?: number
          created_at?: string
          status: string
        }
        Update: {
          id?: number
          created_at?: string
          status?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          id: string
          label: string
          created_at: string
          elo_rating: number | null
        }
        Insert: {
          id?: string
          label: string
          created_at?: string
          elo_rating?: number | null
        }
        Update: {
          id?: string
          label?: string
          created_at?: string
          elo_rating?: number | null
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
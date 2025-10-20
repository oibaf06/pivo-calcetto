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
      matches: {
        Row: {
          id: string
          created_at: string
          home_player: string | null
          away_player: string | null
          home_score: number | null
          away_score: number | null
          status: string
        }
        Insert: {
          id?: string
          created_at?: string
          home_player?: string | null
          away_player?: string | null
          home_score?: number | null
          away_score?: number | null
          status: string
        }
        Update: {
          id?: string
          created_at?: string
          home_player?: string | null
          away_player?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_away_player_fkey"
            columns: ["away_player"]
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_home_player_fkey"
            columns: ["home_player"]
            referencedRelation: "players"
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
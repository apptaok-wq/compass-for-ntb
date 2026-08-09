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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          actor_email: string | null
          actor_id: string | null
          aksi: string
          created_at: string
          detail: Json | null
          entitas: string
          entitas_id: string | null
          id: string
        }
        Insert: {
          actor_email?: string | null
          actor_id?: string | null
          aksi: string
          created_at?: string
          detail?: Json | null
          entitas: string
          entitas_id?: string | null
          id?: string
        }
        Update: {
          actor_email?: string | null
          actor_id?: string | null
          aksi?: string
          created_at?: string
          detail?: Json | null
          entitas?: string
          entitas_id?: string | null
          id?: string
        }
        Relationships: []
      }
      kesejahteraan_agregat: {
        Row: {
          catatan: string | null
          created_at: string
          id: string
          jumlah_kk_desil_1: number
          jumlah_kk_desil_2: number
          jumlah_kk_desil_3: number
          jumlah_kk_miskin_ekstrem: number
          jumlah_kk_total: number
          jumlah_penduduk: number
          periode: string
          sumber_data: string
          updated_at: string
          wilayah_id: string
        }
        Insert: {
          catatan?: string | null
          created_at?: string
          id?: string
          jumlah_kk_desil_1?: number
          jumlah_kk_desil_2?: number
          jumlah_kk_desil_3?: number
          jumlah_kk_miskin_ekstrem?: number
          jumlah_kk_total?: number
          jumlah_penduduk?: number
          periode: string
          sumber_data: string
          updated_at?: string
          wilayah_id: string
        }
        Update: {
          catatan?: string | null
          created_at?: string
          id?: string
          jumlah_kk_desil_1?: number
          jumlah_kk_desil_2?: number
          jumlah_kk_desil_3?: number
          jumlah_kk_miskin_ekstrem?: number
          jumlah_kk_total?: number
          jumlah_penduduk?: number
          periode?: string
          sumber_data?: string
          updated_at?: string
          wilayah_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kesejahteraan_agregat_wilayah_id_fkey"
            columns: ["wilayah_id"]
            isOneToOne: false
            referencedRelation: "wilayah"
            referencedColumns: ["id"]
          },
        ]
      }
      kunjungan_lapangan: {
        Row: {
          created_at: string
          id: string
          petugas_id: string
          tanggal_kunjungan: string
          temuan: string | null
          tindak_lanjut: string | null
          tujuan: string
          updated_at: string
          wilayah_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          petugas_id: string
          tanggal_kunjungan: string
          temuan?: string | null
          tindak_lanjut?: string | null
          tujuan: string
          updated_at?: string
          wilayah_id: string
        }
        Update: {
          created_at?: string
          id?: string
          petugas_id?: string
          tanggal_kunjungan?: string
          temuan?: string | null
          tindak_lanjut?: string | null
          tujuan?: string
          updated_at?: string
          wilayah_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "kunjungan_lapangan_wilayah_id_fkey"
            columns: ["wilayah_id"]
            isOneToOne: false
            referencedRelation: "wilayah"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          instansi: string | null
          is_active: boolean
          jabatan: string | null
          nama_lengkap: string
          updated_at: string
          wilayah_scope_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          instansi?: string | null
          is_active?: boolean
          jabatan?: string | null
          nama_lengkap: string
          updated_at?: string
          wilayah_scope_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          instansi?: string | null
          is_active?: boolean
          jabatan?: string | null
          nama_lengkap?: string
          updated_at?: string
          wilayah_scope_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_wilayah_scope_id_fkey"
            columns: ["wilayah_scope_id"]
            isOneToOne: false
            referencedRelation: "wilayah"
            referencedColumns: ["id"]
          },
        ]
      }
      skor_kerentanan: {
        Row: {
          created_at: string
          dihitung_oleh: string | null
          dihitung_pada: string
          id: string
          komponen: Json
          metode_versi: string
          periode: string
          skor: number
          updated_at: string
          wilayah_id: string
        }
        Insert: {
          created_at?: string
          dihitung_oleh?: string | null
          dihitung_pada?: string
          id?: string
          komponen?: Json
          metode_versi: string
          periode: string
          skor: number
          updated_at?: string
          wilayah_id: string
        }
        Update: {
          created_at?: string
          dihitung_oleh?: string | null
          dihitung_pada?: string
          id?: string
          komponen?: Json
          metode_versi?: string
          periode?: string
          skor?: number
          updated_at?: string
          wilayah_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skor_kerentanan_wilayah_id_fkey"
            columns: ["wilayah_id"]
            isOneToOne: false
            referencedRelation: "wilayah"
            referencedColumns: ["id"]
          },
        ]
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
      web_vitals: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          navigation_type: string | null
          path: string
          rating: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value: number
          navigation_type?: string | null
          path: string
          rating?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          navigation_type?: string | null
          path?: string
          rating?: string | null
        }
        Relationships: []
      }
      wilayah: {
        Row: {
          created_at: string
          geometry: unknown
          id: string
          jenis: Database["public"]["Enums"]["jenis_wilayah"]
          kode_bps: string
          nama: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          geometry?: unknown
          id?: string
          jenis: Database["public"]["Enums"]["jenis_wilayah"]
          kode_bps: string
          nama: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          geometry?: unknown
          id?: string
          jenis?: Database["public"]["Enums"]["jenis_wilayah"]
          kode_bps?: string
          nama?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "wilayah_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "wilayah"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_read_wilayah: { Args: { _wilayah_id: string }; Returns: boolean }
      has_full_wilayah_read: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_active_user: { Args: never; Returns: boolean }
      is_super_admin: { Args: never; Returns: boolean }
      wilayah_in_scope: { Args: { _wilayah_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "super_admin"
        | "bappeda_provinsi"
        | "dinas_sosial"
        | "pemkab_kota"
        | "kominfo"
        | "opd_teknis"
        | "akademisi"
        | "mitra_pembangunan"
      jenis_wilayah: "provinsi" | "kabupaten" | "kota" | "kecamatan" | "desa"
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
      app_role: [
        "super_admin",
        "bappeda_provinsi",
        "dinas_sosial",
        "pemkab_kota",
        "kominfo",
        "opd_teknis",
        "akademisi",
        "mitra_pembangunan",
      ],
      jenis_wilayah: ["provinsi", "kabupaten", "kota", "kecamatan", "desa"],
    },
  },
} as const

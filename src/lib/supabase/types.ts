// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: '14.1'
  }
  public: {
    Tables: {
      codigo_conduta: {
        Row: {
          arquivo_url: string
          created_at: string
          descricao: string | null
          escola_id: string
          id: string
          updated_at: string
        }
        Insert: {
          arquivo_url: string
          created_at?: string
          descricao?: string | null
          escola_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string
          created_at?: string
          descricao?: string | null
          escola_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'codigo_conduta_escola_id_fkey'
            columns: ['escola_id']
            isOneToOne: true
            referencedRelation: 'escolas_instituicoes'
            referencedColumns: ['id']
          },
        ]
      }
      compromisso_alta_gestao: {
        Row: {
          arquivo_url: string
          created_at: string
          descricao: string | null
          escola_id: string
          id: string
          updated_at: string
        }
        Insert: {
          arquivo_url: string
          created_at?: string
          descricao?: string | null
          escola_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          arquivo_url?: string
          created_at?: string
          descricao?: string | null
          escola_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'compromisso_alta_gestao_escola_id_fkey'
            columns: ['escola_id']
            isOneToOne: true
            referencedRelation: 'escolas_instituicoes'
            referencedColumns: ['id']
          },
        ]
      }
      denuncias: {
        Row: {
          anonimo: boolean
          created_at: string
          denunciante_id: string | null
          descricao: string
          escola_id: string
          id: string
          protocolo: string
          status: string
          updated_at: string
        }
        Insert: {
          anonimo?: boolean
          created_at?: string
          denunciante_id?: string | null
          descricao: string
          escola_id: string
          id?: string
          protocolo: string
          status?: string
          updated_at?: string
        }
        Update: {
          anonimo?: boolean
          created_at?: string
          denunciante_id?: string | null
          descricao?: string
          escola_id?: string
          id?: string
          protocolo?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'denuncias_escola_id_fkey'
            columns: ['escola_id']
            isOneToOne: false
            referencedRelation: 'escolas_instituicoes'
            referencedColumns: ['id']
          },
        ]
      }
      escolas_instituicoes: {
        Row: {
          created_at: string
          endereco: string
          id: string
          localizacao: string
          nome_escola: string
          rede_estadual: boolean
          rede_federal: boolean
          rede_municipal: boolean
          rede_particular: boolean
          rede_publica: boolean
          status_adesao: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          endereco?: string
          id?: string
          localizacao: string
          nome_escola: string
          rede_estadual: boolean
          rede_federal: boolean
          rede_municipal: boolean
          rede_particular: boolean
          rede_publica: boolean
          status_adesao?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          endereco?: string
          id?: string
          localizacao?: string
          nome_escola?: string
          rede_estadual?: boolean
          rede_federal?: boolean
          rede_municipal?: boolean
          rede_particular?: boolean
          rede_publica?: boolean
          status_adesao?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios_escola: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          escola_id: string
          id: string
          nome_usuario: string
          perfil: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          escola_id: string
          id: string
          nome_usuario?: string
          perfil: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          escola_id?: string
          id?: string
          nome_usuario?: string
          perfil?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'usuarios_escola_escola_id_fkey'
            columns: ['escola_id']
            isOneToOne: false
            referencedRelation: 'escolas_instituicoes'
            referencedColumns: ['id']
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
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
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

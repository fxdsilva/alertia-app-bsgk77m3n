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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_notification_settings: {
        Row: {
          frequency: string
          settings: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          frequency?: string
          settings?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          frequency?: string
          settings?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_settings: {
        Row: {
          created_at: string
          key: string
          settings: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          key: string
          settings?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          key?: string
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      analyst_assignments: {
        Row: {
          analyst_id: string
          created_at: string | null
          id: string
          permissions: Json | null
          school_id: string
          updated_at: string | null
        }
        Insert: {
          analyst_id: string
          created_at?: string | null
          id?: string
          permissions?: Json | null
          school_id: string
          updated_at?: string | null
        }
        Update: {
          analyst_id?: string
          created_at?: string | null
          id?: string
          permissions?: Json | null
          school_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analyst_assignments_analyst_id_fkey"
            columns: ["analyst_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analyst_assignments_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      auditorias: {
        Row: {
          analista_id: string | null
          created_at: string
          data_auditoria: string
          escola_id: string
          id: string
          pendencias: number | null
          responsavel: string
          status: string
          tipo: string
          updated_at: string
        }
        Insert: {
          analista_id?: string | null
          created_at?: string
          data_auditoria: string
          escola_id: string
          id?: string
          pendencias?: number | null
          responsavel: string
          status: string
          tipo: string
          updated_at?: string
        }
        Update: {
          analista_id?: string | null
          created_at?: string
          data_auditoria?: string
          escola_id?: string
          id?: string
          pendencias?: number | null
          responsavel?: string
          status?: string
          tipo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "auditorias_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditorias_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "auditorias_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "status_auditoria"
            referencedColumns: ["id"]
          },
        ]
      }
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
            foreignKeyName: "codigo_conduta_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: true
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_task_evidences: {
        Row: {
          created_at: string
          description: string | null
          id: string
          task_id: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          task_id: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          task_id?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_task_evidences_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "compliance_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_task_evidences_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_tasks: {
        Row: {
          analista_id: string
          correction_notes: string | null
          created_at: string | null
          data_conclusao: string | null
          descricao: string | null
          diretor_id: string
          escola_id: string | null
          gestor_escolar_id: string | null
          guideline: string | null
          id: string
          institutional_docs_auth: boolean | null
          nivel_risco: string | null
          pillar: string | null
          prazo: string | null
          proposed_complaint_status: string | null
          referencia_id: string | null
          response_text: string | null
          school_manager_access_config: Json | null
          secondary_analyst_id: string | null
          status: string | null
          tipo_modulo: string
          updated_at: string | null
        }
        Insert: {
          analista_id: string
          correction_notes?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          descricao?: string | null
          diretor_id: string
          escola_id?: string | null
          gestor_escolar_id?: string | null
          guideline?: string | null
          id?: string
          institutional_docs_auth?: boolean | null
          nivel_risco?: string | null
          pillar?: string | null
          prazo?: string | null
          proposed_complaint_status?: string | null
          referencia_id?: string | null
          response_text?: string | null
          school_manager_access_config?: Json | null
          secondary_analyst_id?: string | null
          status?: string | null
          tipo_modulo: string
          updated_at?: string | null
        }
        Update: {
          analista_id?: string
          correction_notes?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          descricao?: string | null
          diretor_id?: string
          escola_id?: string | null
          gestor_escolar_id?: string | null
          guideline?: string | null
          id?: string
          institutional_docs_auth?: boolean | null
          nivel_risco?: string | null
          pillar?: string | null
          prazo?: string | null
          proposed_complaint_status?: string | null
          referencia_id?: string | null
          response_text?: string | null
          school_manager_access_config?: Json | null
          secondary_analyst_id?: string | null
          status?: string | null
          tipo_modulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_tasks_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_tasks_diretor_id_fkey"
            columns: ["diretor_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_tasks_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_tasks_gestor_escolar_id_fkey"
            columns: ["gestor_escolar_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_tasks_secondary_analyst_id_fkey"
            columns: ["secondary_analyst_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_workflow_logs: {
        Row: {
          changed_by: string | null
          comments: string | null
          complaint_id: string
          created_at: string | null
          id: string
          new_status: string
          previous_status: string | null
        }
        Insert: {
          changed_by?: string | null
          comments?: string | null
          complaint_id: string
          created_at?: string | null
          id?: string
          new_status: string
          previous_status?: string | null
        }
        Update: {
          changed_by?: string | null
          comments?: string | null
          complaint_id?: string
          created_at?: string | null
          id?: string
          new_status?: string
          previous_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_workflow_logs_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_workflow_logs_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
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
            foreignKeyName: "compromisso_alta_gestao_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: true
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      controles_internos: {
        Row: {
          analista_id: string | null
          created_at: string | null
          data_teste: string | null
          descricao: string | null
          id: string
          plano_acao: string | null
          resultado_teste: string | null
          status: string | null
          titulo: string
        }
        Insert: {
          analista_id?: string | null
          created_at?: string | null
          data_teste?: string | null
          descricao?: string | null
          id?: string
          plano_acao?: string | null
          resultado_teste?: string | null
          status?: string | null
          titulo: string
        }
        Update: {
          analista_id?: string | null
          created_at?: string | null
          data_teste?: string | null
          descricao?: string | null
          id?: string
          plano_acao?: string | null
          resultado_teste?: string | null
          status?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "controles_internos_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
        ]
      }
      denuncias: {
        Row: {
          analista_1_id: string | null
          analista_2_id: string | null
          analista_3_id: string | null
          analista_id: string | null
          anonimo: boolean
          autorizado_gestao: boolean | null
          categoria: string[] | null
          created_at: string
          denunciante_id: string | null
          descricao: string
          diretor_id: string | null
          envolvidos_detalhes: Json | null
          escola_id: string | null
          evidencias_urls: string[] | null
          gravidade: string | null
          id: string
          parecer_1: string | null
          protocolo: string
          relatorio_2: string | null
          relatorio_3: string | null
          status: string
          tipo_resolucao: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analista_1_id?: string | null
          analista_2_id?: string | null
          analista_3_id?: string | null
          analista_id?: string | null
          anonimo?: boolean
          autorizado_gestao?: boolean | null
          categoria?: string[] | null
          created_at?: string
          denunciante_id?: string | null
          descricao: string
          diretor_id?: string | null
          envolvidos_detalhes?: Json | null
          escola_id?: string | null
          evidencias_urls?: string[] | null
          gravidade?: string | null
          id?: string
          parecer_1?: string | null
          protocolo?: string
          relatorio_2?: string | null
          relatorio_3?: string | null
          status?: string
          tipo_resolucao?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analista_1_id?: string | null
          analista_2_id?: string | null
          analista_3_id?: string | null
          analista_id?: string | null
          anonimo?: boolean
          autorizado_gestao?: boolean | null
          categoria?: string[] | null
          created_at?: string
          denunciante_id?: string | null
          descricao?: string
          diretor_id?: string | null
          envolvidos_detalhes?: Json | null
          escola_id?: string | null
          evidencias_urls?: string[] | null
          gravidade?: string | null
          id?: string
          parecer_1?: string | null
          protocolo?: string
          relatorio_2?: string | null
          relatorio_3?: string | null
          status?: string
          tipo_resolucao?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "denuncias_analista_1_id_fkey"
            columns: ["analista_1_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_analista_2_id_fkey"
            columns: ["analista_2_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_analista_3_id_fkey"
            columns: ["analista_3_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_diretor_id_fkey"
            columns: ["diretor_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "denuncias_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "status_denuncia"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence: {
        Row: {
          analista_id: string | null
          created_at: string
          data_analise: string | null
          escola_id: string
          fornecedor: string
          id: string
          natureza_risco: string | null
          nivel_risco: string | null
          perfil_analisado: string | null
          resumo_evidencias: string | null
          status: string
          tipo_servico: string | null
        }
        Insert: {
          analista_id?: string | null
          created_at?: string
          data_analise?: string | null
          escola_id: string
          fornecedor: string
          id?: string
          natureza_risco?: string | null
          nivel_risco?: string | null
          perfil_analisado?: string | null
          resumo_evidencias?: string | null
          status: string
          tipo_servico?: string | null
        }
        Update: {
          analista_id?: string | null
          created_at?: string
          data_analise?: string | null
          escola_id?: string
          fornecedor?: string
          id?: string
          natureza_risco?: string | null
          nivel_risco?: string | null
          perfil_analisado?: string | null
          resumo_evidencias?: string | null
          status?: string
          tipo_servico?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "due_diligence_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "due_diligence_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "due_diligence_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "status_due_diligence"
            referencedColumns: ["id"]
          },
        ]
      }
      escolas_instituicoes: {
        Row: {
          ativo: boolean
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
          ativo?: boolean
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
          ativo?: boolean
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
      historico_permissoes: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          new_permissions: Json | null
          previous_permissions: Json | null
          target_user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          new_permissions?: Json | null
          previous_permissions?: Json | null
          target_user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          new_permissions?: Json | null
          previous_permissions?: Json | null
          target_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "historico_permissoes_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
        ]
      }
      investigacoes: {
        Row: {
          analista_id: string | null
          created_at: string | null
          data_conclusao: string | null
          data_inicio: string | null
          denuncia_id: string | null
          escola_id: string
          evidencias_urls: string[] | null
          id: string
          responsavel_id: string | null
          resultado: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          analista_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          denuncia_id?: string | null
          escola_id: string
          evidencias_urls?: string[] | null
          id?: string
          responsavel_id?: string | null
          resultado?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          analista_id?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          denuncia_id?: string | null
          escola_id?: string
          evidencias_urls?: string[] | null
          id?: string
          responsavel_id?: string | null
          resultado?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investigacoes_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigacoes_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigacoes_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigacoes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investigacoes_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "status_investigacao"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_sistema: {
        Row: {
          action_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          table_affected: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          table_affected?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          table_affected?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      matriz_riscos: {
        Row: {
          analista_id: string | null
          created_at: string | null
          escola_id: string | null
          id: string
          impacto: string | null
          nivel_risco_calculado: string | null
          plano_mitigacao: string | null
          probabilidade: string | null
          risco: string
        }
        Insert: {
          analista_id?: string | null
          created_at?: string | null
          escola_id?: string | null
          id?: string
          impacto?: string | null
          nivel_risco_calculado?: string | null
          plano_mitigacao?: string | null
          probabilidade?: string | null
          risco: string
        }
        Update: {
          analista_id?: string | null
          created_at?: string | null
          escola_id?: string | null
          id?: string
          impacto?: string | null
          nivel_risco_calculado?: string | null
          plano_mitigacao?: string | null
          probabilidade?: string | null
          risco?: string
        }
        Relationships: [
          {
            foreignKeyName: "matriz_riscos_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matriz_riscos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      mediacoes: {
        Row: {
          analista_id: string | null
          caso: string
          created_at: string
          data_conclusao: string | null
          data_inicio: string
          escola_id: string
          id: string
          partes_envolvidas: string
          status: string
        }
        Insert: {
          analista_id?: string | null
          caso: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          escola_id: string
          id?: string
          partes_envolvidas: string
          status: string
        }
        Update: {
          analista_id?: string | null
          caso?: string
          created_at?: string
          data_conclusao?: string | null
          data_inicio?: string
          escola_id?: string
          id?: string
          partes_envolvidas?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mediacoes_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mediacoes_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mediacoes_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "status_mediacao"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      processos_disciplinares: {
        Row: {
          analista_id: string | null
          created_at: string
          data_abertura: string | null
          decisao: string | null
          descricao: string | null
          escola_id: string
          evidencias_urls: string[] | null
          id: string
          status: string
          titulo: string
        }
        Insert: {
          analista_id?: string | null
          created_at?: string
          data_abertura?: string | null
          decisao?: string | null
          descricao?: string | null
          escola_id: string
          evidencias_urls?: string[] | null
          id?: string
          status: string
          titulo: string
        }
        Update: {
          analista_id?: string | null
          created_at?: string
          data_abertura?: string | null
          decisao?: string | null
          descricao?: string | null
          escola_id?: string
          evidencias_urls?: string[] | null
          id?: string
          status?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_disciplinares_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_disciplinares_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_disciplinares_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "status_processo_disciplinar"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_consolidados: {
        Row: {
          ano: number
          arquivo_url: string
          created_at: string
          escola_id: string
          id: string
          updated_at: string
        }
        Insert: {
          ano: number
          arquivo_url: string
          created_at?: string
          escola_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          ano?: number
          arquivo_url?: string
          created_at?: string
          escola_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_consolidados_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      relatorios_ia: {
        Row: {
          conteudo_json: Json
          created_at: string
          data_geracao: string
          escola_id: string
          id: string
          tipo: string
          titulo: string
        }
        Insert: {
          conteudo_json?: Json
          created_at?: string
          data_geracao?: string
          escola_id: string
          id?: string
          tipo: string
          titulo: string
        }
        Update: {
          conteudo_json?: Json
          created_at?: string
          data_geracao?: string
          escola_id?: string
          id?: string
          tipo?: string
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "relatorios_ia_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      status_auditoria: {
        Row: {
          created_at: string
          id: string
          nome_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_denuncia: {
        Row: {
          created_at: string
          id: string
          nome_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_due_diligence: {
        Row: {
          created_at: string
          id: string
          nome_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_investigacao: {
        Row: {
          created_at: string
          id: string
          nome_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_mediacao: {
        Row: {
          created_at: string
          id: string
          nome_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_processo_disciplinar: {
        Row: {
          created_at: string
          id: string
          nome_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      status_treinamento_conclusao: {
        Row: {
          created_at: string
          id: string
          nome_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          nome_status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          nome_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      treinamentos: {
        Row: {
          ativo: boolean | null
          conteudo_url: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          escola_id: string
          id: string
          obrigatorio: boolean | null
          questoes: Json | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          conteudo_url?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          escola_id: string
          id?: string
          obrigatorio?: boolean | null
          questoes?: Json | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          conteudo_url?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          escola_id?: string
          id?: string
          obrigatorio?: boolean | null
          questoes?: Json | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "treinamentos_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamentos_conclusoes: {
        Row: {
          avaliacao: number | null
          comentario: string | null
          created_at: string | null
          data_conclusao: string | null
          id: string
          progresso: number | null
          status: string | null
          treinamento_id: string
          updated_at: string | null
          usuario_id: string
        }
        Insert: {
          avaliacao?: number | null
          comentario?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          id?: string
          progresso?: number | null
          status?: string | null
          treinamento_id: string
          updated_at?: string | null
          usuario_id: string
        }
        Update: {
          avaliacao?: number | null
          comentario?: string | null
          created_at?: string | null
          data_conclusao?: string | null
          id?: string
          progresso?: number | null
          status?: string | null
          treinamento_id?: string
          updated_at?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treinamentos_conclusoes_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "status_treinamento_conclusao"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamentos_conclusoes_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamentos_conclusoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios_admin_master: {
        Row: {
          ativo: boolean
          created_at: string
          email: string
          id: string
          nome: string | null
          senha_hash: string
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          email: string
          id?: string
          nome?: string | null
          senha_hash: string
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          email?: string
          id?: string
          nome?: string | null
          senha_hash?: string
          updated_at?: string
        }
        Relationships: []
      }
      usuarios_escola: {
        Row: {
          ativo: boolean
          cargo: string | null
          created_at: string
          departamento: string | null
          email: string
          escola_id: string | null
          id: string
          nome_usuario: string
          perfil: string
          permissoes: Json | null
          updated_at: string
        }
        Insert: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          departamento?: string | null
          email: string
          escola_id?: string | null
          id: string
          nome_usuario?: string
          perfil: string
          permissoes?: Json | null
          updated_at?: string
        }
        Update: {
          ativo?: boolean
          cargo?: string | null
          created_at?: string
          departamento?: string | null
          email?: string
          escola_id?: string | null
          id?: string
          nome_usuario?: string
          perfil?: string
          permissoes?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_escola_escola_id_fkey"
            columns: ["escola_id"]
            isOneToOne: false
            referencedRelation: "escolas_instituicoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_task_proposal: {
        Args: { p_approve: boolean; p_task_id: string }
        Returns: undefined
      }
      check_is_admin_master: { Args: never; Returns: boolean }
      check_is_operational: { Args: never; Returns: boolean }
      check_is_school_manager: {
        Args: { target_escola_id: string }
        Returns: boolean
      }
      current_user_has_permission: {
        Args: { perm_key: string }
        Returns: boolean
      }
      get_complaint_by_protocol: {
        Args: { protocol_query: string }
        Returns: {
          status: string
          updated_at: string
        }[]
      }
      get_user_escola_id: { Args: { user_id: string }; Returns: string }
      is_compliance_analyst: { Args: never; Returns: boolean }
      is_compliance_director: { Args: never; Returns: boolean }
      is_compliance_member: { Args: never; Returns: boolean }
      is_user_member_of_escola: {
        Args: { p_escola_id: string }
        Returns: boolean
      }
      update_updated_at: {
        Args: { p_row_id: string; p_table_name: string }
        Returns: undefined
      }
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


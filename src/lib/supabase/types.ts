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
      audit_findings: {
        Row: {
          audit_id: string
          created_at: string | null
          description: string
          id: string
          recommendation: string | null
          severity: string
          status: string
          updated_at: string | null
        }
        Insert: {
          audit_id: string
          created_at?: string | null
          description: string
          id?: string
          recommendation?: string | null
          severity: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          audit_id?: string
          created_at?: string | null
          description?: string
          id?: string
          recommendation?: string | null
          severity?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "auditorias"
            referencedColumns: ["id"]
          },
        ]
      }
      auditorias: {
        Row: {
          analista_id: string | null
          created_at: string
          data_auditoria: string
          denuncia_id: string | null
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
          denuncia_id?: string | null
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
          denuncia_id?: string | null
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
            foreignKeyName: "auditorias_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
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
          denuncia_id: string | null
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
          denuncia_id?: string | null
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
          denuncia_id?: string | null
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
          {
            foreignKeyName: "controles_internos_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
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
          denunciante_email: string | null
          denunciante_id: string | null
          denunciante_nome: string | null
          denunciante_telefone: string | null
          denunciante_vinculo: string | null
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
          denunciante_email?: string | null
          denunciante_id?: string | null
          denunciante_nome?: string | null
          denunciante_telefone?: string | null
          denunciante_vinculo?: string | null
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
          denunciante_email?: string | null
          denunciante_id?: string | null
          denunciante_nome?: string | null
          denunciante_telefone?: string | null
          denunciante_vinculo?: string | null
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
          denuncia_id: string | null
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
          denuncia_id?: string | null
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
          denuncia_id?: string | null
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
            foreignKeyName: "matriz_riscos_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
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
          denuncia_id: string | null
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
          denuncia_id?: string | null
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
          denuncia_id?: string | null
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
            foreignKeyName: "mediacoes_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
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
          denuncia_id: string | null
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
          denuncia_id?: string | null
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
          denuncia_id?: string | null
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
            foreignKeyName: "processos_disciplinares_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
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
      support_tickets: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
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
      workflow_analistas: {
        Row: {
          analista_id: string
          created_at: string
          denuncia_id: string
          fase: number
          id: string
        }
        Insert: {
          analista_id: string
          created_at?: string
          denuncia_id: string
          fase: number
          id?: string
        }
        Update: {
          analista_id?: string
          created_at?: string
          denuncia_id?: string
          fase?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_analistas_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_analistas_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_pareceres: {
        Row: {
          analista_id: string
          conclusao: string
          created_at: string
          denuncia_id: string
          fase: number
          id: string
          parecer_texto: string | null
          updated_at: string
        }
        Insert: {
          analista_id: string
          conclusao: string
          created_at?: string
          denuncia_id: string
          fase: number
          id?: string
          parecer_texto?: string | null
          updated_at?: string
        }
        Update: {
          analista_id?: string
          conclusao?: string
          created_at?: string
          denuncia_id?: string
          fase?: number
          id?: string
          parecer_texto?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_pareceres_analista_id_fkey"
            columns: ["analista_id"]
            isOneToOne: false
            referencedRelation: "usuarios_escola"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_pareceres_denuncia_id_fkey"
            columns: ["denuncia_id"]
            isOneToOne: false
            referencedRelation: "denuncias"
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
      delete_denuncia: { Args: { p_denuncia_id: string }; Returns: undefined }
      get_auth_user_id: { Args: never; Returns: string }
      get_complaint_by_protocol: {
        Args: { protocol_query: string }
        Returns: {
          status: string
          updated_at: string
        }[]
      }
      get_complaint_tracking_details: {
        Args: { protocol_query: string }
        Returns: Json
      }
      get_user_escola_id: { Args: { user_id: string }; Returns: string }
      get_user_id_by_email: { Args: { p_email: string }; Returns: string }
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


// ====== DATABASE EXTENDED CONTEXT (auto-generated) ======
// This section contains actual PostgreSQL column types, constraints, RLS policies,
// functions, triggers, indexes and materialized views not present in the type definitions above.
// IMPORTANT: The TypeScript types above map UUID, TEXT, VARCHAR all to "string".
// Use the COLUMN TYPES section below to know the real PostgreSQL type for each column.
// Always use the correct PostgreSQL type when writing SQL migrations.

// --- COLUMN TYPES (actual PostgreSQL types) ---
// Use this to know the real database type when writing migrations.
// "string" in TypeScript types above may be uuid, text, varchar, timestamptz, etc.
// Table: admin_notification_settings
//   user_id: uuid (not null)
//   settings: jsonb (not null, default: '{}'::jsonb)
//   frequency: text (not null, default: 'immediate'::text)
//   updated_at: timestamp with time zone (not null, default: now())
// Table: admin_settings
//   key: text (not null)
//   settings: jsonb (not null, default: '{}'::jsonb)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: analyst_assignments
//   id: uuid (not null, default: gen_random_uuid())
//   analyst_id: uuid (not null)
//   school_id: uuid (not null)
//   permissions: jsonb (nullable, default: '{"codigo_conduta": false, "compromisso_alta_gestao": false, "relatorios_consolidados": false}'::jsonb)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: audit_findings
//   id: uuid (not null, default: gen_random_uuid())
//   audit_id: uuid (not null)
//   description: text (not null)
//   recommendation: text (nullable)
//   severity: text (not null)
//   status: text (not null, default: 'Pendente'::text)
//   created_at: timestamp with time zone (nullable, default: now())
//   updated_at: timestamp with time zone (nullable, default: now())
// Table: auditorias
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   data_auditoria: date (not null)
//   tipo: text (not null)
//   responsavel: text (not null)
//   status: text (not null)
//   pendencias: integer (nullable, default: 0)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   analista_id: uuid (nullable)
//   denuncia_id: uuid (nullable)
// Table: codigo_conduta
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   arquivo_url: text (not null)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: compliance_task_evidences
//   id: uuid (not null, default: gen_random_uuid())
//   task_id: uuid (not null)
//   url: text (not null)
//   description: text (nullable)
//   uploaded_by: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: compliance_tasks
//   id: uuid (not null, default: gen_random_uuid())
//   analista_id: uuid (not null)
//   diretor_id: uuid (not null)
//   tipo_modulo: text (not null)
//   referencia_id: uuid (nullable)
//   prazo: timestamp with time zone (nullable)
//   nivel_risco: text (nullable)
//   status: text (nullable, default: 'Pendente'::text)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   updated_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   pillar: text (nullable)
//   secondary_analyst_id: uuid (nullable)
//   guideline: text (nullable)
//   correction_notes: text (nullable)
//   data_conclusao: timestamp with time zone (nullable)
//   response_text: text (nullable)
//   escola_id: uuid (nullable)
//   proposed_complaint_status: text (nullable)
//   school_manager_access_config: jsonb (nullable)
//   gestor_escolar_id: uuid (nullable)
//   institutional_docs_auth: boolean (nullable, default: false)
// Table: compliance_workflow_logs
//   id: uuid (not null, default: gen_random_uuid())
//   complaint_id: uuid (not null)
//   previous_status: text (nullable)
//   new_status: text (not null)
//   changed_by: uuid (nullable)
//   comments: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: compromisso_alta_gestao
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   arquivo_url: text (not null)
//   descricao: text (nullable)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: controles_internos
//   id: uuid (not null, default: gen_random_uuid())
//   titulo: text (not null)
//   descricao: text (nullable)
//   status: text (nullable, default: 'Ativo'::text)
//   data_teste: timestamp with time zone (nullable)
//   resultado_teste: text (nullable)
//   plano_acao: text (nullable)
//   analista_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   denuncia_id: uuid (nullable)
// Table: denuncias
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (nullable)
//   protocolo: text (not null, default: upper("substring"(encode(gen_random_bytes(6), 'hex'::text), 1, 10)))
//   descricao: text (not null)
//   status: text (not null, default: 'pendente'::text)
//   anonimo: boolean (not null, default: true)
//   denunciante_id: uuid (nullable)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   categoria: _text (nullable)
//   gravidade: text (nullable, default: 'Baixa'::text)
//   user_id: uuid (nullable)
//   evidencias_urls: _text (nullable, default: ARRAY[]::text[])
//   envolvidos_detalhes: jsonb (nullable)
//   analista_id: uuid (nullable)
//   autorizado_gestao: boolean (nullable, default: false)
//   analista_1_id: uuid (nullable)
//   analista_2_id: uuid (nullable)
//   analista_3_id: uuid (nullable)
//   diretor_id: uuid (nullable)
//   parecer_1: text (nullable)
//   relatorio_2: text (nullable)
//   relatorio_3: text (nullable)
//   tipo_resolucao: text (nullable)
//   denunciante_nome: text (nullable)
//   denunciante_email: text (nullable)
//   denunciante_telefone: text (nullable)
//   denunciante_vinculo: text (nullable)
// Table: due_diligence
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   fornecedor: text (not null)
//   tipo_servico: text (nullable)
//   status: text (not null)
//   nivel_risco: text (nullable)
//   data_analise: date (nullable, default: CURRENT_DATE)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   natureza_risco: text (nullable)
//   perfil_analisado: text (nullable)
//   resumo_evidencias: text (nullable)
//   analista_id: uuid (nullable)
// Table: escolas_instituicoes
//   id: uuid (not null, default: gen_random_uuid())
//   nome_escola: text (not null)
//   rede_publica: boolean (not null)
//   rede_municipal: boolean (not null)
//   rede_estadual: boolean (not null)
//   rede_federal: boolean (not null)
//   rede_particular: boolean (not null)
//   localizacao: text (not null)
//   endereco: text (not null, default: 'Sem dados'::text)
//   status_adesao: text (not null, default: 'inativo'::text)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   ativo: boolean (not null, default: true)
// Table: historico_permissoes
//   id: uuid (not null, default: gen_random_uuid())
//   admin_id: uuid (not null)
//   target_user_id: uuid (not null)
//   previous_permissions: jsonb (nullable)
//   new_permissions: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: investigacoes
//   id: uuid (not null, default: gen_random_uuid())
//   denuncia_id: uuid (nullable)
//   escola_id: uuid (not null)
//   responsavel_id: uuid (nullable)
//   status: text (not null, default: 'em_andamento'::text)
//   resultado: text (nullable)
//   data_inicio: timestamp with time zone (nullable, default: now())
//   data_conclusao: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (nullable, default: timezone('utc'::text, now()))
//   evidencias_urls: _text (nullable, default: '{}'::text[])
//   analista_id: uuid (nullable)
// Table: logs_sistema
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (nullable)
//   action_type: text (not null)
//   description: text (nullable)
//   table_affected: text (nullable)
//   metadata: jsonb (nullable)
//   created_at: timestamp with time zone (not null, default: now())
// Table: matriz_riscos
//   id: uuid (not null, default: gen_random_uuid())
//   risco: text (not null)
//   impacto: text (nullable)
//   probabilidade: text (nullable)
//   nivel_risco_calculado: text (nullable)
//   plano_mitigacao: text (nullable)
//   analista_id: uuid (nullable)
//   created_at: timestamp with time zone (nullable, default: CURRENT_TIMESTAMP)
//   escola_id: uuid (nullable)
//   denuncia_id: uuid (nullable)
// Table: mediacoes
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   caso: text (not null)
//   partes_envolvidas: text (not null)
//   status: text (not null)
//   data_inicio: date (not null, default: CURRENT_DATE)
//   data_conclusao: date (nullable)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   analista_id: uuid (nullable)
//   denuncia_id: uuid (nullable)
// Table: notifications
//   id: uuid (not null, default: gen_random_uuid())
//   user_id: uuid (not null)
//   title: text (not null)
//   message: text (not null)
//   read: boolean (nullable, default: false)
//   type: text (nullable, default: 'info'::text)
//   link: text (nullable)
//   created_at: timestamp with time zone (nullable, default: now())
// Table: processos_disciplinares
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   titulo: text (not null)
//   descricao: text (nullable)
//   status: text (not null)
//   data_abertura: date (nullable, default: CURRENT_DATE)
//   decisao: text (nullable)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   evidencias_urls: _text (nullable, default: '{}'::text[])
//   analista_id: uuid (nullable)
//   denuncia_id: uuid (nullable)
// Table: relatorios_consolidados
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   arquivo_url: text (not null)
//   ano: integer (not null)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())
// Table: relatorios_ia
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   titulo: text (not null)
//   tipo: text (not null)
//   conteudo_json: jsonb (not null, default: '{}'::jsonb)
//   data_geracao: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: status_auditoria
//   id: text (not null)
//   nome_status: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: status_denuncia
//   id: text (not null)
//   nome_status: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: status_due_diligence
//   id: text (not null)
//   nome_status: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: status_investigacao
//   id: text (not null)
//   nome_status: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: status_mediacao
//   id: text (not null)
//   nome_status: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: status_processo_disciplinar
//   id: text (not null)
//   nome_status: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: status_treinamento_conclusao
//   id: text (not null)
//   nome_status: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: support_tickets
//   id: uuid (not null, default: gen_random_uuid())
//   name: text (not null)
//   email: text (not null)
//   subject: text (not null)
//   message: text (not null)
//   status: text (not null, default: 'pendente'::text)
//   created_at: timestamp with time zone (not null, default: now())
// Table: treinamentos
//   id: uuid (not null, default: gen_random_uuid())
//   escola_id: uuid (not null)
//   titulo: text (not null)
//   descricao: text (nullable)
//   conteudo_url: text (nullable)
//   obrigatorio: boolean (nullable, default: false)
//   created_at: timestamp with time zone (nullable, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (nullable, default: timezone('utc'::text, now()))
//   data_inicio: timestamp with time zone (nullable)
//   data_fim: timestamp with time zone (nullable)
//   ativo: boolean (nullable, default: true)
//   questoes: jsonb (nullable, default: '[]'::jsonb)
// Table: treinamentos_conclusoes
//   id: uuid (not null, default: gen_random_uuid())
//   treinamento_id: uuid (not null)
//   usuario_id: uuid (not null)
//   status: text (nullable, default: 'nao_iniciado'::text)
//   progresso: integer (nullable, default: 0)
//   data_conclusao: timestamp with time zone (nullable)
//   created_at: timestamp with time zone (nullable, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (nullable, default: timezone('utc'::text, now()))
//   avaliacao: integer (nullable)
//   comentario: text (nullable)
// Table: usuarios_admin_master
//   id: uuid (not null, default: gen_random_uuid())
//   nome: text (nullable)
//   email: text (not null)
//   senha_hash: text (not null)
//   ativo: boolean (not null, default: true)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
// Table: usuarios_escola
//   id: uuid (not null)
//   escola_id: uuid (nullable)
//   perfil: text (not null)
//   created_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   updated_at: timestamp with time zone (not null, default: timezone('utc'::text, now()))
//   nome_usuario: text (not null, default: 'Usuário'::text)
//   email: text (not null)
//   ativo: boolean (not null, default: true)
//   cargo: text (nullable)
//   departamento: text (nullable)
//   permissoes: jsonb (nullable, default: '{"read": true, "write": false, "delete": false, "reports": false}'::jsonb)
// Table: workflow_analistas
//   id: uuid (not null, default: gen_random_uuid())
//   denuncia_id: uuid (not null)
//   analista_id: uuid (not null)
//   fase: integer (not null)
//   created_at: timestamp with time zone (not null, default: now())
// Table: workflow_pareceres
//   id: uuid (not null, default: gen_random_uuid())
//   denuncia_id: uuid (not null)
//   analista_id: uuid (not null)
//   fase: integer (not null)
//   conclusao: text (not null)
//   parecer_texto: text (nullable)
//   created_at: timestamp with time zone (not null, default: now())
//   updated_at: timestamp with time zone (not null, default: now())

// --- CONSTRAINTS ---
// Table: admin_notification_settings
//   PRIMARY KEY admin_notification_settings_pkey: PRIMARY KEY (user_id)
//   FOREIGN KEY admin_notification_settings_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: admin_settings
//   PRIMARY KEY admin_settings_pkey: PRIMARY KEY (key)
// Table: analyst_assignments
//   FOREIGN KEY analyst_assignments_analyst_id_fkey: FOREIGN KEY (analyst_id) REFERENCES usuarios_escola(id) ON DELETE CASCADE
//   UNIQUE analyst_assignments_analyst_id_school_id_key: UNIQUE (analyst_id, school_id)
//   PRIMARY KEY analyst_assignments_pkey: PRIMARY KEY (id)
//   FOREIGN KEY analyst_assignments_school_id_fkey: FOREIGN KEY (school_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
// Table: audit_findings
//   FOREIGN KEY audit_findings_audit_id_fkey: FOREIGN KEY (audit_id) REFERENCES auditorias(id) ON DELETE CASCADE
//   PRIMARY KEY audit_findings_pkey: PRIMARY KEY (id)
//   CHECK audit_findings_severity_check: CHECK ((severity = ANY (ARRAY['Alta'::text, 'Média'::text, 'Baixa'::text])))
//   CHECK audit_findings_status_check: CHECK ((status = ANY (ARRAY['Pendente'::text, 'Resolvido'::text])))
// Table: auditorias
//   FOREIGN KEY auditorias_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY auditorias_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
//   FOREIGN KEY auditorias_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id)
//   PRIMARY KEY auditorias_pkey: PRIMARY KEY (id)
//   FOREIGN KEY auditorias_status_fkey: FOREIGN KEY (status) REFERENCES status_auditoria(id)
// Table: codigo_conduta
//   FOREIGN KEY codigo_conduta_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
//   UNIQUE codigo_conduta_escola_unique: UNIQUE (escola_id)
//   PRIMARY KEY codigo_conduta_pkey: PRIMARY KEY (id)
// Table: compliance_task_evidences
//   PRIMARY KEY compliance_task_evidences_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compliance_task_evidences_task_id_fkey: FOREIGN KEY (task_id) REFERENCES compliance_tasks(id) ON DELETE CASCADE
//   FOREIGN KEY compliance_task_evidences_uploaded_by_fkey: FOREIGN KEY (uploaded_by) REFERENCES usuarios_escola(id)
// Table: compliance_tasks
//   FOREIGN KEY compliance_tasks_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id) ON DELETE CASCADE
//   FOREIGN KEY compliance_tasks_diretor_id_fkey: FOREIGN KEY (diretor_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY compliance_tasks_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id)
//   FOREIGN KEY compliance_tasks_gestor_escolar_id_fkey: FOREIGN KEY (gestor_escolar_id) REFERENCES usuarios_escola(id)
//   CHECK compliance_tasks_nivel_risco_check: CHECK ((nivel_risco = ANY (ARRAY['Baixo'::text, 'Médio'::text, 'Alto'::text, 'Crítico'::text])))
//   PRIMARY KEY compliance_tasks_pkey: PRIMARY KEY (id)
//   FOREIGN KEY compliance_tasks_secondary_analyst_id_fkey: FOREIGN KEY (secondary_analyst_id) REFERENCES usuarios_escola(id)
//   CHECK compliance_tasks_tipo_modulo_check: CHECK ((tipo_modulo = ANY (ARRAY['compromisso'::text, 'codigo_conduta'::text, 'treinamentos'::text, 'auditoria'::text, 'riscos'::text, 'controles_internos'::text, 'consolidacao'::text, 'denuncias'::text, 'documentacao'::text])))
// Table: compliance_workflow_logs
//   FOREIGN KEY compliance_workflow_logs_changed_by_fkey: FOREIGN KEY (changed_by) REFERENCES usuarios_escola(id)
//   FOREIGN KEY compliance_workflow_logs_complaint_id_fkey: FOREIGN KEY (complaint_id) REFERENCES denuncias(id) ON DELETE CASCADE
//   PRIMARY KEY compliance_workflow_logs_pkey: PRIMARY KEY (id)
// Table: compromisso_alta_gestao
//   FOREIGN KEY compromisso_alta_gestao_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
//   PRIMARY KEY compromisso_alta_gestao_pkey: PRIMARY KEY (id)
//   UNIQUE compromisso_escola_unique: UNIQUE (escola_id)
// Table: controles_internos
//   FOREIGN KEY controles_internos_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY controles_internos_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
//   PRIMARY KEY controles_internos_pkey: PRIMARY KEY (id)
// Table: denuncias
//   CHECK anonymous_check: CHECK ((((anonimo IS TRUE) AND (denunciante_id IS NULL)) OR (anonimo IS FALSE)))
//   FOREIGN KEY denuncias_analista_1_id_fkey: FOREIGN KEY (analista_1_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY denuncias_analista_2_id_fkey: FOREIGN KEY (analista_2_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY denuncias_analista_3_id_fkey: FOREIGN KEY (analista_3_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY denuncias_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY denuncias_denunciante_id_fkey: FOREIGN KEY (denunciante_id) REFERENCES auth.users(id) ON DELETE SET NULL
//   FOREIGN KEY denuncias_diretor_id_fkey: FOREIGN KEY (diretor_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY denuncias_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
//   PRIMARY KEY denuncias_pkey: PRIMARY KEY (id)
//   UNIQUE denuncias_protocolo_key: UNIQUE (protocolo)
//   FOREIGN KEY denuncias_status_fkey: FOREIGN KEY (status) REFERENCES status_denuncia(id)
// Table: due_diligence
//   FOREIGN KEY due_diligence_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY due_diligence_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id)
//   CHECK due_diligence_nivel_risco_check: CHECK ((nivel_risco = ANY (ARRAY['baixo'::text, 'medio'::text, 'alto'::text, 'critico'::text])))
//   PRIMARY KEY due_diligence_pkey: PRIMARY KEY (id)
//   FOREIGN KEY due_diligence_status_fkey: FOREIGN KEY (status) REFERENCES status_due_diligence(id)
// Table: escolas_instituicoes
//   CHECK escolas_instituicoes_localizacao_check: CHECK ((localizacao = ANY (ARRAY['Urbana'::text, 'Rural'::text])))
//   UNIQUE escolas_instituicoes_nome_escola_key: UNIQUE (nome_escola)
//   PRIMARY KEY escolas_instituicoes_pkey: PRIMARY KEY (id)
//   CHECK escolas_instituicoes_status_adesao_check: CHECK ((status_adesao = ANY (ARRAY['ativo'::text, 'inativo'::text])))
//   CHECK one_network_type_true: CHECK ((((( CASE     WHEN rede_municipal THEN 1     ELSE 0 END + CASE     WHEN rede_estadual THEN 1     ELSE 0 END) + CASE     WHEN rede_federal THEN 1     ELSE 0 END) + CASE     WHEN rede_particular THEN 1     ELSE 0 END) = 1))
//   CHECK public_network_logic: CHECK (((rede_particular AND (NOT rede_publica)) OR ((rede_municipal OR rede_estadual OR rede_federal) AND rede_publica)))
// Table: historico_permissoes
//   FOREIGN KEY historico_permissoes_admin_id_fkey: FOREIGN KEY (admin_id) REFERENCES auth.users(id)
//   PRIMARY KEY historico_permissoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY historico_permissoes_target_user_id_fkey: FOREIGN KEY (target_user_id) REFERENCES usuarios_escola(id) ON DELETE CASCADE
// Table: investigacoes
//   FOREIGN KEY investigacoes_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY investigacoes_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id) ON DELETE CASCADE
//   FOREIGN KEY investigacoes_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
//   PRIMARY KEY investigacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY investigacoes_responsavel_id_fkey: FOREIGN KEY (responsavel_id) REFERENCES usuarios_escola(id) ON DELETE SET NULL
//   CHECK investigacoes_status_check: CHECK ((status = ANY (ARRAY['em_andamento'::text, 'concluida'::text, 'pausada'::text, 'arquivada'::text])))
//   FOREIGN KEY investigacoes_status_fkey: FOREIGN KEY (status) REFERENCES status_investigacao(id)
// Table: logs_sistema
//   PRIMARY KEY logs_sistema_pkey: PRIMARY KEY (id)
//   FOREIGN KEY logs_sistema_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id)
// Table: matriz_riscos
//   FOREIGN KEY matriz_riscos_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY matriz_riscos_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
//   FOREIGN KEY matriz_riscos_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id)
//   PRIMARY KEY matriz_riscos_pkey: PRIMARY KEY (id)
// Table: mediacoes
//   FOREIGN KEY mediacoes_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY mediacoes_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
//   FOREIGN KEY mediacoes_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id)
//   PRIMARY KEY mediacoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY mediacoes_status_fkey: FOREIGN KEY (status) REFERENCES status_mediacao(id)
// Table: notifications
//   PRIMARY KEY notifications_pkey: PRIMARY KEY (id)
//   FOREIGN KEY notifications_user_id_fkey: FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
// Table: processos_disciplinares
//   FOREIGN KEY processos_disciplinares_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id)
//   FOREIGN KEY processos_disciplinares_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id)
//   FOREIGN KEY processos_disciplinares_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id)
//   PRIMARY KEY processos_disciplinares_pkey: PRIMARY KEY (id)
//   FOREIGN KEY processos_disciplinares_status_fkey: FOREIGN KEY (status) REFERENCES status_processo_disciplinar(id)
// Table: relatorios_consolidados
//   UNIQUE relatorios_consolidados_escola_ano_unique: UNIQUE (escola_id, ano)
//   FOREIGN KEY relatorios_consolidados_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
//   PRIMARY KEY relatorios_consolidados_pkey: PRIMARY KEY (id)
// Table: relatorios_ia
//   FOREIGN KEY relatorios_ia_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id)
//   PRIMARY KEY relatorios_ia_pkey: PRIMARY KEY (id)
// Table: status_auditoria
//   PRIMARY KEY status_auditoria_pkey: PRIMARY KEY (id)
// Table: status_denuncia
//   PRIMARY KEY status_denuncia_pkey: PRIMARY KEY (id)
// Table: status_due_diligence
//   PRIMARY KEY status_due_diligence_pkey: PRIMARY KEY (id)
// Table: status_investigacao
//   PRIMARY KEY status_investigacao_pkey: PRIMARY KEY (id)
// Table: status_mediacao
//   PRIMARY KEY status_mediacao_pkey: PRIMARY KEY (id)
// Table: status_processo_disciplinar
//   PRIMARY KEY status_processo_disciplinar_pkey: PRIMARY KEY (id)
// Table: status_treinamento_conclusao
//   PRIMARY KEY status_treinamento_conclusao_pkey: PRIMARY KEY (id)
// Table: support_tickets
//   PRIMARY KEY support_tickets_pkey: PRIMARY KEY (id)
// Table: treinamentos
//   FOREIGN KEY treinamentos_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
//   PRIMARY KEY treinamentos_pkey: PRIMARY KEY (id)
// Table: treinamentos_conclusoes
//   CHECK treinamentos_conclusoes_avaliacao_check: CHECK (((avaliacao >= 1) AND (avaliacao <= 5)))
//   PRIMARY KEY treinamentos_conclusoes_pkey: PRIMARY KEY (id)
//   FOREIGN KEY treinamentos_conclusoes_status_fkey: FOREIGN KEY (status) REFERENCES status_treinamento_conclusao(id)
//   FOREIGN KEY treinamentos_conclusoes_treinamento_id_fkey: FOREIGN KEY (treinamento_id) REFERENCES treinamentos(id) ON DELETE CASCADE
//   UNIQUE treinamentos_conclusoes_treinamento_id_usuario_id_key: UNIQUE (treinamento_id, usuario_id)
//   FOREIGN KEY treinamentos_conclusoes_usuario_id_fkey: FOREIGN KEY (usuario_id) REFERENCES usuarios_escola(id) ON DELETE CASCADE
// Table: usuarios_admin_master
//   UNIQUE usuarios_admin_master_email_key: UNIQUE (email)
//   PRIMARY KEY usuarios_admin_master_pkey: PRIMARY KEY (id)
// Table: usuarios_escola
//   UNIQUE usuarios_escola_email_key: UNIQUE (email)
//   FOREIGN KEY usuarios_escola_escola_id_fkey: FOREIGN KEY (escola_id) REFERENCES escolas_instituicoes(id) ON DELETE CASCADE
//   FOREIGN KEY usuarios_escola_id_fkey: FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
//   CHECK usuarios_escola_perfil_check: CHECK ((perfil = ANY (ARRAY['publico_externo'::text, 'colaborador'::text, 'professor'::text, 'senior'::text, 'operacional'::text, 'SECRETARIA DE EDUCAÇÃO'::text, 'gestao_escola'::text, 'ANALISTA_COMPLIANCE'::text, 'DIRETOR_COMPLIANCE'::text])))
//   PRIMARY KEY usuarios_escola_pkey: PRIMARY KEY (id)
// Table: workflow_analistas
//   FOREIGN KEY workflow_analistas_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id) ON DELETE CASCADE
//   UNIQUE workflow_analistas_denuncia_id_analista_id_fase_key: UNIQUE (denuncia_id, analista_id, fase)
//   FOREIGN KEY workflow_analistas_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id) ON DELETE CASCADE
//   PRIMARY KEY workflow_analistas_pkey: PRIMARY KEY (id)
// Table: workflow_pareceres
//   FOREIGN KEY workflow_pareceres_analista_id_fkey: FOREIGN KEY (analista_id) REFERENCES usuarios_escola(id) ON DELETE CASCADE
//   CHECK workflow_pareceres_conclusao_check: CHECK ((conclusao = ANY (ARRAY['Procedente'::text, 'Improcedente'::text, 'Necessita mais análise'::text])))
//   UNIQUE workflow_pareceres_denuncia_id_analista_id_fase_key: UNIQUE (denuncia_id, analista_id, fase)
//   FOREIGN KEY workflow_pareceres_denuncia_id_fkey: FOREIGN KEY (denuncia_id) REFERENCES denuncias(id) ON DELETE CASCADE
//   PRIMARY KEY workflow_pareceres_pkey: PRIMARY KEY (id)

// --- ROW LEVEL SECURITY POLICIES ---
// Table: admin_notification_settings
//   Policy "Users can manage their own notification settings" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = user_id)
//     WITH CHECK: (auth.uid() = user_id)
// Table: admin_settings
//   Policy "Allow public read access to support settings" (SELECT, PERMISSIVE) roles={anon}
//     USING: (key = ANY (ARRAY['support_contact_info'::text, 'support_faqs'::text, 'external_official_channels'::text]))
//   Policy "Enable all access for authenticated users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Enable read access for anon users" (SELECT, PERMISSIVE) roles={anon}
//     USING: true
//   Policy "Enable read access for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: analyst_assignments
//   Policy "Analysts can view their assignments" (SELECT, PERMISSIVE) roles={public}
//     USING: (analyst_id = auth.uid())
//   Policy "Director can manage assignments" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = 'DIRETOR_COMPLIANCE'::text))))
//   Policy "School Managers can view their assignments" (SELECT, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = 'gestao_escola'::text) AND (usuarios_escola.escola_id = analyst_assignments.school_id))))
// Table: audit_findings
//   Policy "Allow all for analysts and admins" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow read for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: auditorias
//   Policy "Analysts can manage assigned audits" (ALL, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['senior'::text, 'operacional'::text]))))))
//   Policy "Compliance can insert auditorias" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "School Management view audits" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() IN ( SELECT usuarios_escola.id    FROM usuarios_escola   WHERE ((usuarios_escola.escola_id = auditorias.escola_id) AND (usuarios_escola.perfil = 'gestao_escola'::text))))
//   Policy "Users can view their school audits" (SELECT, PERMISSIVE) roles={public}
//     USING: ((escola_id IN ( SELECT usuarios_escola.escola_id    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid()))) OR ( SELECT check_is_admin_master() AS check_is_admin_master))
// Table: codigo_conduta
//   Policy "Admin Master can delete codigo_conduta" (DELETE, PERMISSIVE) roles={public}
//     USING: check_is_admin_master()
//   Policy "Admin Master can insert codigo_conduta" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: check_is_admin_master()
//   Policy "Admin Master can update codigo_conduta" (UPDATE, PERMISSIVE) roles={public}
//     USING: check_is_admin_master()
//   Policy "Admin full access codigo_conduta" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = 'administrador'::text) AND (ue.escola_id = codigo_conduta.escola_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = 'administrador'::text) AND (ue.escola_id = codigo_conduta.escola_id))))
//   Policy "Analistas can manage code of conduct" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = codigo_conduta.escola_id) AND (usuarios_escola.perfil = 'analista_de_compliance'::text) AND (usuarios_escola.ativo = true))))
//   Policy "Analysts View Code of Conduct" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM compliance_tasks   WHERE ((compliance_tasks.escola_id = codigo_conduta.escola_id) AND (compliance_tasks.analista_id = auth.uid()) AND (compliance_tasks.institutional_docs_auth = true)))) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'senior'::text, 'gestao_escola'::text]))))))
//   Policy "Gestores can manage codigo_conduta" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.escola_id = codigo_conduta.escola_id) AND (ue.perfil = ANY (ARRAY['gestao_escola'::text, 'gestor'::text, 'alta_gestao'::text, 'admin_gestor'::text, 'administrador'::text, 'senior'::text])))))
//   Policy "Public Read Codigo" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
//   Policy "Public read access for codigo_conduta" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "allow_public_read_codigo_conduta" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
// Table: compliance_task_evidences
//   Policy "Analyst insert evidences for assigned tasks" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM compliance_tasks t   WHERE ((t.id = compliance_task_evidences.task_id) AND ((t.analista_id = auth.uid()) OR (t.secondary_analyst_id = auth.uid())))))
//   Policy "Analyst view evidences for assigned tasks" (SELECT, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM compliance_tasks t   WHERE ((t.id = compliance_task_evidences.task_id) AND ((t.analista_id = auth.uid()) OR (t.secondary_analyst_id = auth.uid())))))
//   Policy "Creator delete evidences" (DELETE, PERMISSIVE) roles={public}
//     USING: (uploaded_by = auth.uid())
//   Policy "Director view all evidences" (SELECT, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = 'DIRETOR_COMPLIANCE'::text))))
// Table: compliance_tasks
//   Policy "Analyst update assigned tasks" (UPDATE, PERMISSIVE) roles={public}
//     USING: (is_compliance_analyst() AND ((analista_id = auth.uid()) OR (secondary_analyst_id = auth.uid())))
//     WITH CHECK: (is_compliance_analyst() AND ((analista_id = auth.uid()) OR (secondary_analyst_id = auth.uid())))
//   Policy "Analyst view assigned tasks" (SELECT, PERMISSIVE) roles={public}
//     USING: (is_compliance_analyst() AND ((analista_id = auth.uid()) OR (secondary_analyst_id = auth.uid())))
//   Policy "Analysts Read Assigned Tasks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((analista_id = auth.uid()) OR (secondary_analyst_id = auth.uid()))
//   Policy "Analysts can update assigned tasks" (UPDATE, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (secondary_analyst_id = auth.uid()))
//   Policy "Analysts can update assigned tasks status" (UPDATE, PERMISSIVE) roles={public}
//     USING: (analista_id = auth.uid())
//     WITH CHECK: (analista_id = auth.uid())
//   Policy "Analysts can view assigned tasks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((analista_id = auth.uid()) OR (secondary_analyst_id = auth.uid()))
//   Policy "Director Compliance Manage Tasks" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = 'DIRETOR_COMPLIANCE'::text))))
//   Policy "Director Manage Tasks" (ALL, PERMISSIVE) roles={authenticated}
//     USING: is_compliance_director()
//   Policy "Director full access tasks" (ALL, PERMISSIVE) roles={public}
//     USING: is_compliance_director()
//   Policy "Directors can manage all tasks" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = 'DIRETOR_COMPLIANCE'::text))))
//   Policy "Directors can manage tasks" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = 'DIRETOR_COMPLIANCE'::text))))
//   Policy "School Managers Read Authorized Tasks" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (gestor_escolar_id = auth.uid())
// Table: compliance_workflow_logs
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
// Table: compromisso_alta_gestao
//   Policy "Admin Master can delete compromisso" (DELETE, PERMISSIVE) roles={public}
//     USING: check_is_admin_master()
//   Policy "Admin Master can insert compromisso" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: check_is_admin_master()
//   Policy "Admin Master can update compromisso" (UPDATE, PERMISSIVE) roles={public}
//     USING: check_is_admin_master()
//   Policy "Admin full access compromisso_alta_gestao" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = 'administrador'::text) AND (ue.escola_id = compromisso_alta_gestao.escola_id))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = 'administrador'::text) AND (ue.escola_id = compromisso_alta_gestao.escola_id))))
//   Policy "Analistas can manage commitment" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = compromisso_alta_gestao.escola_id) AND (usuarios_escola.perfil = 'analista_de_compliance'::text) AND (usuarios_escola.ativo = true))))
//   Policy "Analysts View Commitment" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM compliance_tasks   WHERE ((compliance_tasks.escola_id = compromisso_alta_gestao.escola_id) AND (compliance_tasks.analista_id = auth.uid()) AND (compliance_tasks.institutional_docs_auth = true)))) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'senior'::text, 'gestao_escola'::text]))))))
//   Policy "Gestores can manage compromisso_alta_gestao" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.escola_id = compromisso_alta_gestao.escola_id) AND (ue.perfil = ANY (ARRAY['gestao_escola'::text, 'gestor'::text, 'alta_gestao'::text, 'admin_gestor'::text, 'administrador'::text, 'senior'::text])))))
//   Policy "Public Read Compromisso" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
//   Policy "Public read access for compromisso_alta_gestao" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "allow_public_read_compromisso" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
// Table: controles_internos
//   Policy "Analysts can manage assigned controls" (ALL, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['senior'::text, 'operacional'::text]))))))
//   Policy "Directors and Analysts can access Internal Controls" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['DIRETOR DE COMPLIANCE'::text, 'analista_de_compliance'::text])) AND (usuarios_escola.ativo = true))))
// Table: denuncias
//   Policy "Compliance members can update complaints" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Compliance members can view all complaints" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text])))))
//   Policy "Public Insert Complaint" (INSERT, PERMISSIVE) roles={anon,authenticated}
//     WITH CHECK: true
//   Policy "Senior can delete complaints" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = 'senior'::text))))
//   Policy "Senior can view all complaints" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Users can view their own complaints" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (user_id = auth.uid())
//   Policy "insert_anonymous_denuncia_anon" (INSERT, PERMISSIVE) roles={anon}
//     WITH CHECK: (((anonimo IS TRUE) OR ((denunciante_id IS NULL) AND (user_id IS NULL))) AND (protocolo IS NOT NULL) AND (denunciante_nome IS NULL) AND (denunciante_email IS NULL) AND (denunciante_telefone IS NULL))
//   Policy "insert_anonymous_denuncia_auth" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (((anonimo IS TRUE) OR ((denunciante_id IS NULL) AND (user_id IS NULL))) AND (protocolo IS NOT NULL) AND (denunciante_nome IS NULL) AND (denunciante_email IS NULL) AND (denunciante_telefone IS NULL))
// Table: due_diligence
//   Policy "Analistas can manage due diligence" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = due_diligence.escola_id) AND (usuarios_escola.perfil = 'analista_de_compliance'::text) AND (usuarios_escola.ativo = true))))
//   Policy "Analysts can manage assigned due diligence" (ALL, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['senior'::text, 'operacional'::text]))))))
//   Policy "Users can view their school due diligence" (SELECT, PERMISSIVE) roles={public}
//     USING: ((escola_id IN ( SELECT usuarios_escola.escola_id    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid()))) OR ( SELECT check_is_admin_master() AS check_is_admin_master))
// Table: escolas_instituicoes
//   Policy "Admin Manage Schools" (ALL, PERMISSIVE) roles={authenticated}
//     USING: (check_is_admin_master() OR (( SELECT usuarios_escola.perfil    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid())) = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'senior'::text])))
//   Policy "Admin Master Full Access Schools" (ALL, PERMISSIVE) roles={authenticated}
//     USING: check_is_admin_master()
//     WITH CHECK: check_is_admin_master()
//   Policy "Allow public read schools" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: (ativo = true)
//   Policy "Authenticated can view all schools" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Compliance Global View Schools" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_compliance_member()
//   Policy "Director View Schools" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_compliance_director()
//   Policy "Directors can view all schools" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = 'DIRETOR_COMPLIANCE'::text))))
//   Policy "Global Read Access for Admin and Compliance" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (check_is_admin_master() OR is_compliance_director())
//   Policy "Operational can view all schools" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: check_is_operational()
//   Policy "Public Read Active Schools" (SELECT, PERMISSIVE) roles={anon}
//     USING: (ativo = true)
//   Policy "Public View Active Schools" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: (ativo = true)
//   Policy "Public can view active schools" (SELECT, PERMISSIVE) roles={anon}
//     USING: (ativo = true)
//   Policy "Public read active schools" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: (ativo = true)
//   Policy "School Staff View Own" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id IN ( SELECT usuarios_escola.escola_id    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid())))
//   Policy "School Users Read Own School" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id IN ( SELECT usuarios_escola.escola_id    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid())))
//   Policy "Standard Users View Own School" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = get_user_escola_id(auth.uid()))
//   Policy "allow_select_escolas_for_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((ativo = true) OR (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = ( SELECT auth.uid() AS uid)) AND (ue.escola_id = escolas_instituicoes.id)))) OR ( SELECT check_is_admin_master() AS check_is_admin_master) OR ( SELECT is_compliance_director() AS is_compliance_director))
//   Policy "authenticated_select_escolas_all" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "escolas_delete_admin_master" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_admin_master uam   WHERE ((uam.id = ( SELECT auth.uid() AS uid)) AND (uam.ativo = true))))
//   Policy "escolas_insert_authenticated" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: is_user_member_of_escola(id)
//   Policy "escolas_instituicoes_access" (ALL, PERMISSIVE) roles={authenticated}
//     USING: ((EXISTS ( SELECT 1    FROM usuarios_escola udc   WHERE ((udc.id = ( SELECT auth.uid() AS uid)) AND (udc.perfil = 'DIRETOR_COMPLIANCE'::text)))) OR (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = ( SELECT auth.uid() AS uid)) AND (ue.escola_id = escolas_instituicoes.id)))))
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM usuarios_escola udc   WHERE ((udc.id = ( SELECT auth.uid() AS uid)) AND (udc.perfil = 'DIRETOR_COMPLIANCE'::text)))) OR (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = ( SELECT auth.uid() AS uid)) AND (ue.escola_id = escolas_instituicoes.id)))))
//   Policy "escolas_public_select_anon" (SELECT, PERMISSIVE) roles={anon}
//     USING: (ativo = true)
//   Policy "escolas_select_authenticated" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((ativo = true) OR is_user_member_of_escola(id))
//   Policy "escolas_update_authenticated" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (is_user_member_of_escola(id) OR (EXISTS ( SELECT 1    FROM usuarios_admin_master uam   WHERE ((uam.id = ( SELECT auth.uid() AS uid)) AND (uam.ativo = true)))))
//     WITH CHECK: (is_user_member_of_escola(id) OR (EXISTS ( SELECT 1    FROM usuarios_admin_master uam   WHERE ((uam.id = ( SELECT auth.uid() AS uid)) AND (uam.ativo = true)))))
// Table: historico_permissoes
//   Policy "Admin Master can view permission history" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: check_is_admin_master()
//   Policy "Admins can insert permission history" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = admin_id)
// Table: investigacoes
//   Policy "Analistas can manage investigations" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = investigacoes.escola_id) AND (usuarios_escola.perfil = 'analista_de_compliance'::text) AND (usuarios_escola.ativo = true))))
//   Policy "Analyst Update Investigations" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (analista_id = auth.uid())
//   Policy "Analyst View Investigations" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'senior'::text]))))))
//   Policy "Analysts can manage assigned investigations" (ALL, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['senior'::text, 'operacional'::text]))))))
//   Policy "Compliance can insert investigacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Compliance can update investigacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Gestores can manage investigacoes of their school" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = investigacoes.escola_id) AND (usuarios_escola.perfil = ANY (ARRAY['gestor'::text, 'alta_gestao'::text, 'admin_gestor'::text, 'senior'::text, 'administrador'::text])))))
//   Policy "Gestores can view investigacoes of their school" (SELECT, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = investigacoes.escola_id) AND (usuarios_escola.perfil = ANY (ARRAY['gestor'::text, 'alta_gestao'::text, 'admin_gestor'::text, 'senior'::text, 'administrador'::text])))))
//   Policy "Operational can insert investigacoes" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: check_is_operational()
//   Policy "Operational can update investigacoes" (UPDATE, PERMISSIVE) roles={public}
//     USING: check_is_operational()
//   Policy "Operational can view all investigacoes" (SELECT, PERMISSIVE) roles={public}
//     USING: check_is_operational()
// Table: logs_sistema
//   Policy "Admin Master view all logs" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: check_is_admin_master()
//   Policy "Authenticated users can insert logs" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (auth.uid() = user_id)
//   Policy "Compliance can update logs" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Enable insert for authenticated users" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: true
//   Policy "Enable read access for authenticated users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Operational can insert logs" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: check_is_operational()
// Table: matriz_riscos
//   Policy "Analysts can manage assigned risks" (ALL, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['senior'::text, 'operacional'::text]))))))
//   Policy "Directors and Analysts can access Risk Matrix" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['DIRETOR DE COMPLIANCE'::text, 'analista_de_compliance'::text])) AND (usuarios_escola.ativo = true))))
// Table: mediacoes
//   Policy "Analistas can manage mediations" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = mediacoes.escola_id) AND (usuarios_escola.perfil = 'analista_de_compliance'::text) AND (usuarios_escola.ativo = true))))
//   Policy "Analysts can manage assigned mediations" (ALL, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['senior'::text, 'operacional'::text]))))))
//   Policy "Compliance can insert mediacoes" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Compliance can update mediacoes" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Operational can update mediacoes" (UPDATE, PERMISSIVE) roles={public}
//     USING: check_is_operational()
//   Policy "Operational can view all mediacoes" (SELECT, PERMISSIVE) roles={public}
//     USING: check_is_operational()
//   Policy "Users can view their school mediations" (SELECT, PERMISSIVE) roles={public}
//     USING: ((escola_id IN ( SELECT usuarios_escola.escola_id    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid()))) OR ( SELECT check_is_admin_master() AS check_is_admin_master))
// Table: notifications
//   Policy "Users can update their own notifications" (UPDATE, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
//   Policy "Users can view their own notifications" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = user_id)
// Table: processos_disciplinares
//   Policy "Analysts can manage assigned disciplinary" (ALL, PERMISSIVE) roles={public}
//     USING: ((analista_id = auth.uid()) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['senior'::text, 'operacional'::text]))))))
//   Policy "Compliance can insert processos" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Compliance can update processos" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Users can view their school disciplinary processes" (SELECT, PERMISSIVE) roles={public}
//     USING: ((escola_id IN ( SELECT usuarios_escola.escola_id    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid()))) OR ( SELECT check_is_admin_master() AS check_is_admin_master))
// Table: relatorios_consolidados
//   Policy "Analysts Insert Consolidated Reports" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: ((EXISTS ( SELECT 1    FROM compliance_tasks   WHERE ((compliance_tasks.escola_id = relatorios_consolidados.escola_id) AND (compliance_tasks.analista_id = auth.uid()) AND (compliance_tasks.tipo_modulo = 'consolidacao'::text)))) OR (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'senior'::text]))))))
//   Policy "Public read access for relatorios_consolidados" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "allow_public_read_relatorios" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
// Table: relatorios_ia
//   Policy "Users can view their school AI reports" (SELECT, PERMISSIVE) roles={public}
//     USING: ((escola_id IN ( SELECT usuarios_escola.escola_id    FROM usuarios_escola   WHERE (usuarios_escola.id = auth.uid()))) OR ( SELECT check_is_admin_master() AS check_is_admin_master))
// Table: status_auditoria
//   Policy "Public read status_auditoria" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: status_denuncia
//   Policy "Authenticated users can read status_denuncia" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Compliance can insert status_denuncia" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['DIRETOR_COMPLIANCE'::text, 'ANALISTA_COMPLIANCE'::text, 'senior'::text, 'administrador'::text, 'admin_gestor'::text])))))
//   Policy "Enable read access for all users" (SELECT, PERMISSIVE) roles={public}
//     USING: true
//   Policy "Public Read Status" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
//   Policy "Public read access status_denuncia" (SELECT, PERMISSIVE) roles={anon,authenticated}
//     USING: true
//   Policy "Public read status_denuncia" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: status_due_diligence
//   Policy "Public read status_due_diligence" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: status_investigacao
//   Policy "Public read status_investigacao" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: status_mediacao
//   Policy "Public read status_mediacao" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: status_processo_disciplinar
//   Policy "Public read status_processo_disciplinar" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: status_treinamento_conclusao
//   Policy "Public read status_treinamento_conclusao" (SELECT, PERMISSIVE) roles={public}
//     USING: true
// Table: support_tickets
//   Policy "Allow authenticated to read support tickets" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow authenticated to update support tickets" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: true
//   Policy "Allow public to insert support tickets" (INSERT, PERMISSIVE) roles={public}
//     WITH CHECK: true
// Table: treinamentos
//   Policy "Analistas can manage trainings" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = treinamentos.escola_id) AND (usuarios_escola.perfil = 'analista_de_compliance'::text) AND (usuarios_escola.ativo = true))))
//   Policy "Compliance Team can manage trainings" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.perfil = ANY (ARRAY['ANALISTA_COMPLIANCE'::text, 'operacional'::text, 'senior'::text, 'DIRETOR_COMPLIANCE'::text])) AND (usuarios_escola.ativo = true))))
//   Policy "Gestores can manage treinamentos" (ALL, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola ue   WHERE ((ue.id = auth.uid()) AND (ue.escola_id = treinamentos.escola_id) AND (ue.perfil = ANY (ARRAY['gestao_escola'::text, 'gestor'::text, 'alta_gestao'::text, 'admin_gestor'::text, 'administrador'::text, 'senior'::text])))))
//   Policy "Operational can manage treinamentos" (ALL, PERMISSIVE) roles={public}
//     USING: check_is_operational()
//   Policy "Operational can view all treinamentos" (SELECT, PERMISSIVE) roles={public}
//     USING: check_is_operational()
//   Policy "Users can view treinamentos of their school" (SELECT, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM usuarios_escola   WHERE ((usuarios_escola.id = auth.uid()) AND (usuarios_escola.escola_id = treinamentos.escola_id))))
// Table: treinamentos_conclusoes
//   Policy "Authenticated users can view completed trainings of their schoo" (SELECT, PERMISSIVE) roles={public}
//     USING: ((status = 'concluido'::text) AND (EXISTS ( SELECT 1    FROM (treinamentos t      JOIN usuarios_escola ue ON ((ue.escola_id = t.escola_id)))   WHERE ((t.id = treinamentos_conclusoes.treinamento_id) AND (ue.id = auth.uid())))))
//   Policy "Gestores can view all training progress of their school" (SELECT, PERMISSIVE) roles={public}
//     USING: (EXISTS ( SELECT 1    FROM (treinamentos t      JOIN usuarios_escola ue ON ((ue.escola_id = t.escola_id)))   WHERE ((t.id = treinamentos_conclusoes.treinamento_id) AND (ue.id = auth.uid()) AND (ue.perfil = ANY (ARRAY['gestor'::text, 'alta_gestao'::text, 'admin_gestor'::text, 'senior'::text, 'administrador'::text])))))
//   Policy "Operational can view all treinamentos_conclusoes" (SELECT, PERMISSIVE) roles={public}
//     USING: check_is_operational()
//   Policy "Users can view and update their own training progress" (ALL, PERMISSIVE) roles={public}
//     USING: (usuario_id = auth.uid())
// Table: usuarios_admin_master
//   Policy "Admin Master can update admin masters" (UPDATE, PERMISSIVE) roles={public}
//     USING: check_is_admin_master()
//   Policy "Admin Master can view all admin masters" (SELECT, PERMISSIVE) roles={public}
//     USING: check_is_admin_master()
//   Policy "Admin Master view self" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//   Policy "Admin Masters can manage admin masters" (ALL, PERMISSIVE) roles={authenticated}
//     USING: check_is_admin_master()
//     WITH CHECK: check_is_admin_master()
//   Policy "Users can view own admin master profile" (SELECT, PERMISSIVE) roles={public}
//     USING: (auth.uid() = id)
// Table: usuarios_escola
//   Policy "Admin Master Full Access Users" (ALL, PERMISSIVE) roles={public}
//     USING: check_is_admin_master()
//   Policy "Admin Master manage all school users" (ALL, PERMISSIVE) roles={authenticated}
//     USING: check_is_admin_master()
//   Policy "Compliance Global View Users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_compliance_member()
//   Policy "Director View All Users" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: is_compliance_director()
//   Policy "School Managers Read School Profiles" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: check_is_school_manager(escola_id)
//   Policy "School Users Read Own Profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//   Policy "Users can view own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (auth.uid() = id)
//   Policy "View own profile" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = auth.uid())
//   Policy "View school peers" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: ((escola_id IS NOT NULL) AND (((escola_id)::text = ((auth.jwt() -> 'user_metadata'::text) ->> 'escola_id'::text)) OR ((escola_id)::text = ((auth.jwt() -> 'app_metadata'::text) ->> 'escola_id'::text))))
//   Policy "usuarios_escola_delete_own_or_admin" (DELETE, PERMISSIVE) roles={authenticated}
//     USING: ((id = ( SELECT auth.uid() AS uid)) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text))
//   Policy "usuarios_escola_insert_own" (INSERT, PERMISSIVE) roles={authenticated}
//     WITH CHECK: (id = ( SELECT auth.uid() AS uid))
//   Policy "usuarios_escola_select_own" (SELECT, PERMISSIVE) roles={authenticated}
//     USING: (id = ( SELECT auth.uid() AS uid))
//   Policy "usuarios_escola_update_own_or_admin" (UPDATE, PERMISSIVE) roles={authenticated}
//     USING: ((id = ( SELECT auth.uid() AS uid)) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text))
//     WITH CHECK: ((id = ( SELECT auth.uid() AS uid)) OR ((auth.jwt() ->> 'role'::text) = 'admin'::text))
// Table: workflow_analistas
//   Policy "allow_all_workflow_analistas" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true
// Table: workflow_pareceres
//   Policy "allow_all_workflow_pareceres" (ALL, PERMISSIVE) roles={authenticated}
//     USING: true
//     WITH CHECK: true

// --- DATABASE FUNCTIONS ---
// FUNCTION approve_task_proposal(uuid, boolean)
//   CREATE OR REPLACE FUNCTION public.approve_task_proposal(p_task_id uuid, p_approve boolean)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       v_task RECORD;
//   BEGIN
//       -- Get task details
//       SELECT * INTO v_task FROM compliance_tasks WHERE id = p_task_id;
//   
//       IF v_task.id IS NULL THEN
//           RAISE EXCEPTION 'Tarefa não encontrada';
//       END IF;
//   
//       -- If there is no proposal, nothing to do (or strictly shouldn't happen via UI)
//       IF v_task.proposed_complaint_status IS NULL THEN
//           RETURN;
//       END IF;
//   
//       IF p_approve THEN
//           -- Validate that it is a complaint task and has a reference
//           IF (v_task.tipo_modulo = 'Denúncia' OR v_task.tipo_modulo = 'Denuncia') AND v_task.referencia_id IS NOT NULL THEN
//               -- Update complaint status
//               UPDATE denuncias
//               SET status = v_task.proposed_complaint_status,
//                   updated_at = NOW()
//               WHERE id = v_task.referencia_id;
//           END IF;
//       END IF;
//   
//       -- Clear the proposal as it has been handled (approved or rejected)
//       -- We keep the task status as is (likely 'in_progress')
//       UPDATE compliance_tasks
//       SET proposed_complaint_status = NULL,
//           updated_at = NOW()
//       WHERE id = p_task_id;
//   
//   END;
//   $function$
//   
// FUNCTION check_analyst_task_updates()
//   CREATE OR REPLACE FUNCTION public.check_analyst_task_updates()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     -- Check if user is an analyst (not a director)
//     IF EXISTS (
//       SELECT 1 FROM public.usuarios_escola
//       WHERE id = auth.uid() AND perfil = 'ANALISTA_COMPLIANCE'
//     ) THEN
//       -- If fields other than status, correction_notes, data_conclusao, updated_at are changed, raise error
//       IF NEW.tipo_modulo IS DISTINCT FROM OLD.tipo_modulo OR
//          NEW.pillar IS DISTINCT FROM OLD.pillar OR
//          NEW.nivel_risco IS DISTINCT FROM OLD.nivel_risco OR
//          NEW.descricao IS DISTINCT FROM OLD.descricao OR
//          NEW.guideline IS DISTINCT FROM OLD.guideline OR
//          NEW.prazo IS DISTINCT FROM OLD.prazo OR
//          NEW.analista_id IS DISTINCT FROM OLD.analista_id OR
//          NEW.diretor_id IS DISTINCT FROM OLD.diretor_id OR
//          NEW.referencia_id IS DISTINCT FROM OLD.referencia_id THEN
//          
//          RAISE EXCEPTION 'Analysts can only update status, notes, and completion date.';
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION check_is_admin_master()
//   CREATE OR REPLACE FUNCTION public.check_is_admin_master()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     is_master BOOLEAN;
//   BEGIN
//     SELECT EXISTS (
//       SELECT 1 FROM public.usuarios_admin_master
//       WHERE email = auth.jwt() ->> 'email'
//       AND ativo = true
//     ) INTO is_master;
//     RETURN is_master;
//   END;
//   $function$
//   
// FUNCTION check_is_operational()
//   CREATE OR REPLACE FUNCTION public.check_is_operational()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     RETURN EXISTS (
//       SELECT 1
//       FROM public.usuarios_escola
//       WHERE id = auth.uid()
//       AND perfil = 'operacional'
//       AND ativo = true
//     );
//   END;
//   $function$
//   
// FUNCTION check_is_school_manager(uuid)
//   CREATE OR REPLACE FUNCTION public.check_is_school_manager(target_escola_id uuid)
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     -- Returns true if the current user is a manager/admin of the target school
//     -- and is active
//     RETURN EXISTS (
//       SELECT 1
//       FROM public.usuarios_escola
//       WHERE id = auth.uid()
//         AND escola_id = target_escola_id
//         AND perfil IN ('gestor', 'alta_gestao', 'administrador', 'admin_gestor')
//         AND ativo = true
//     );
//   END;
//   $function$
//   
// FUNCTION current_user_has_permission(text)
//   CREATE OR REPLACE FUNCTION public.current_user_has_permission(perm_key text)
//    RETURNS boolean
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT COALESCE((permissoes->>perm_key)::boolean, false)
//     FROM public.usuarios_escola
//     WHERE id = auth.uid()
//     LIMIT 1;
//   $function$
//   
// FUNCTION delete_denuncia(uuid)
//   CREATE OR REPLACE FUNCTION public.delete_denuncia(p_denuncia_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- Verify if user is senior
//     IF NOT EXISTS (
//       SELECT 1 FROM public.usuarios_escola 
//       WHERE id = auth.uid() AND perfil = 'senior'
//     ) THEN
//       RAISE EXCEPTION 'Access denied. Only senior can delete complaints.';
//     END IF;
//   
//     -- Delete from dependent tables that don't have cascade
//     DELETE FROM public.processos_disciplinares WHERE denuncia_id = p_denuncia_id;
//     DELETE FROM public.mediacoes WHERE denuncia_id = p_denuncia_id;
//     DELETE FROM public.auditorias WHERE denuncia_id = p_denuncia_id;
//     DELETE FROM public.controles_internos WHERE denuncia_id = p_denuncia_id;
//     DELETE FROM public.matriz_riscos WHERE denuncia_id = p_denuncia_id;
//     
//     -- Delete from compliance tasks that might be referencing this
//     DELETE FROM public.compliance_tasks WHERE referencia_id = p_denuncia_id AND tipo_modulo IN ('Denúncia', 'Denuncia');
//     
//     -- Finally delete the complaint (cascades to investigacoes, workflow_logs, etc.)
//     DELETE FROM public.denuncias WHERE id = p_denuncia_id;
//   END;
//   $function$
//   
// FUNCTION denuncias_before_insert()
//   CREATE OR REPLACE FUNCTION public.denuncias_before_insert()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     IF (SELECT public.get_auth_user_id()) IS NOT NULL THEN
//       NEW.user_id := public.get_auth_user_id();
//     END IF;
//     IF NEW.created_at IS NULL THEN
//       NEW.created_at := NOW();
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION generate_complaint_protocol()
//   CREATE OR REPLACE FUNCTION public.generate_complaint_protocol()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     new_protocol TEXT;
//     exists_protocol BOOLEAN;
//   BEGIN
//     -- If protocol is already provided (e.g. manually), do nothing
//     IF NEW.protocolo IS NOT NULL THEN
//       RETURN NEW;
//     END IF;
//   
//     LOOP
//       -- Generate protocol: YYYYMMDD-XXXX (4 random digits)
//       new_protocol := to_char(now(), 'YYYYMMDD') || '-' || lpad(floor(random() * 10000)::text, 4, '0');
//       
//       -- Check uniqueness
//       SELECT EXISTS(SELECT 1 FROM public.denuncias WHERE protocolo = new_protocol) INTO exists_protocol;
//       
//       IF NOT exists_protocol THEN
//         NEW.protocolo := new_protocol;
//         EXIT;
//       END IF;
//     END LOOP;
//     
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION get_auth_user_id()
//   CREATE OR REPLACE FUNCTION public.get_auth_user_id()
//    RETURNS uuid
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT (auth.uid())::uuid;
//   $function$
//   
// FUNCTION get_complaint_by_protocol(text)
//   CREATE OR REPLACE FUNCTION public.get_complaint_by_protocol(protocol_query text)
//    RETURNS TABLE(status text, updated_at timestamp with time zone)
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   BEGIN
//     RETURN QUERY
//     SELECT
//       COALESCE(s.nome_status, 'Status não definido') as status,
//       d.updated_at
//     FROM denuncias d
//     LEFT JOIN status_denuncia s ON d.status = s.id
//     WHERE d.protocolo = protocol_query;
//   END;
//   $function$
//   
// FUNCTION get_complaint_tracking_details(text)
//   CREATE OR REPLACE FUNCTION public.get_complaint_tracking_details(protocol_query text)
//    RETURNS jsonb
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     v_complaint record;
//     v_result jsonb;
//     v_team_decision text := null;
//     v_leader_agreed boolean := null;
//     v_director_log record;
//     v_votes jsonb;
//     v_has_multiple boolean := false;
//     v_total_analysts int := 0;
//     v_is_assigned boolean := false;
//   BEGIN
//     -- Get base complaint
//     SELECT
//       d.id,
//       d.protocolo,
//       COALESCE(s.nome_status, d.status) as status_nome,
//       d.updated_at,
//       d.parecer_1,
//       d.analista_1_id,
//       d.analista_id
//     INTO v_complaint
//     FROM denuncias d
//     LEFT JOIN status_denuncia s ON d.status = s.id
//     WHERE d.protocolo = protocol_query;
//   
//     IF v_complaint.id IS NULL THEN
//       RETURN NULL;
//     END IF;
//   
//     -- Check if an analyst is assigned
//     IF v_complaint.analista_1_id IS NOT NULL OR v_complaint.analista_id IS NOT NULL THEN
//       v_is_assigned := true;
//     END IF;
//   
//     -- Check multiple analysts (from workflow_analistas)
//     IF EXISTS (SELECT 1 FROM workflow_analistas WHERE denuncia_id = v_complaint.id AND fase = 1) THEN
//       v_is_assigned := true;
//     END IF;
//   
//     -- Get phase 1 votes
//     SELECT 
//       COALESCE(jsonb_agg(jsonb_build_object(
//         'analista_id', w.analista_id,
//         'conclusao', w.conclusao
//       )), '[]'::jsonb)
//     INTO v_votes
//     FROM workflow_pareceres w
//     WHERE w.denuncia_id = v_complaint.id AND w.fase = 1;
//   
//     v_total_analysts := jsonb_array_length(v_votes);
//     IF v_total_analysts > 1 THEN
//       v_has_multiple := true;
//     END IF;
//   
//     -- Calculate team decision
//     IF v_total_analysts > 0 THEN
//       -- Check consensus
//       DECLARE
//         v_first_conc text := v_votes->0->>'conclusao';
//         v_is_consensus boolean := true;
//         v_elem jsonb;
//         v_rec record;
//         v_leader_vote text := null;
//         v_counts jsonb := '{}'::jsonb;
//         v_max_count int := 0;
//         v_max_conc text := null;
//       BEGIN
//         FOR v_elem IN SELECT * FROM jsonb_array_elements(v_votes)
//         LOOP
//           IF v_elem->>'conclusao' != v_first_conc THEN
//             v_is_consensus := false;
//           END IF;
//           
//           IF (v_elem->>'analista_id')::uuid = v_complaint.analista_1_id THEN
//             v_leader_vote := v_elem->>'conclusao';
//           END IF;
//   
//           -- Count for majority
//           v_counts := jsonb_set(
//             v_counts, 
//             ARRAY[v_elem->>'conclusao'], 
//             to_jsonb(COALESCE((v_counts->>(v_elem->>'conclusao'))::int, 0) + 1),
//             true
//           );
//         END LOOP;
//   
//         IF v_is_consensus THEN
//           v_team_decision := v_first_conc;
//           v_leader_agreed := true;
//         ELSIF v_leader_vote IS NOT NULL THEN
//           v_team_decision := v_leader_vote;
//           v_leader_agreed := true;
//         ELSE
//           -- Find max
//           FOR v_rec IN SELECT * FROM jsonb_each(v_counts)
//           LOOP
//             IF (v_rec.value)::text::int > v_max_count THEN
//               v_max_count := (v_rec.value)::text::int;
//               v_max_conc := v_rec.key;
//             END IF;
//           END LOOP;
//           v_team_decision := v_max_conc;
//           IF v_leader_vote IS NOT NULL THEN
//             v_leader_agreed := (v_leader_vote = v_max_conc);
//           END IF;
//         END IF;
//       END;
//     ELSIF v_complaint.parecer_1 IS NOT NULL THEN
//       v_team_decision := 'Parecer preliminar emitido';
//     END IF;
//   
//     -- Get latest director log
//     SELECT 
//       l.new_status,
//       l.comments,
//       l.created_at
//     INTO v_director_log
//     FROM compliance_workflow_logs l
//     JOIN usuarios_escola u ON l.changed_by = u.id
//     WHERE l.complaint_id = v_complaint.id 
//       AND u.perfil IN ('DIRETOR_COMPLIANCE', 'senior', 'administrador')
//     ORDER BY l.created_at DESC
//     LIMIT 1;
//   
//     -- Build final JSON
//     v_result := jsonb_build_object(
//       'status', v_complaint.status_nome,
//       'lastUpdate', v_complaint.updated_at,
//       'hasMultipleAnalysts', v_has_multiple,
//       'totalAnalysts', v_total_analysts,
//       'teamDecision', v_team_decision,
//       'leaderAgreed', v_leader_agreed,
//       'isAssigned', v_is_assigned,
//       'directorDecision', CASE 
//         WHEN v_director_log.new_status IS NOT NULL THEN jsonb_build_object(
//           'new_status', v_director_log.new_status,
//           'comments', v_director_log.comments,
//           'created_at', v_director_log.created_at
//         )
//         ELSE NULL
//       END
//     );
//   
//     RETURN v_result;
//   END;
//   $function$
//   
// FUNCTION get_user_escola_id(uuid)
//   CREATE OR REPLACE FUNCTION public.get_user_escola_id(user_id uuid)
//    RETURNS uuid
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//    SET search_path TO 'public'
//   AS $function$
//   DECLARE
//     v_escola_id uuid;
//   BEGIN
//     SELECT escola_id INTO v_escola_id
//     FROM public.usuarios_escola
//     WHERE id = user_id;
//     
//     RETURN v_escola_id;
//   END;
//   $function$
//   
// FUNCTION get_user_id_by_email(text)
//   CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email text)
//    RETURNS uuid
//    LANGUAGE sql
//    SECURITY DEFINER
//   AS $function$
//     SELECT id FROM auth.users WHERE email = p_email LIMIT 1;
//   $function$
//   
// FUNCTION handle_escolas_updated_at()
//   CREATE OR REPLACE FUNCTION public.handle_escolas_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//     NEW.updated_at = NOW();
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_new_complaint_log()
//   CREATE OR REPLACE FUNCTION public.handle_new_complaint_log()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//     status_label text;
//   BEGIN
//     -- Get status name
//     SELECT nome_status INTO status_label FROM public.status_denuncia WHERE id = NEW.status;
//     
//     -- Insert log
//     INSERT INTO public.compliance_workflow_logs (complaint_id, new_status, comments)
//     VALUES (NEW.id, COALESCE(status_label, 'Status Inicial'), 'Denúncia registrada via Portal (Status Inicial)');
//     
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION handle_user_changes()
//   CREATE OR REPLACE FUNCTION public.handle_user_changes()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//       -- Only try to insert/update if metadata is present
//       IF (NEW.raw_user_meta_data->>'escola_id') IS NOT NULL AND (NEW.raw_user_meta_data->>'perfil') IS NOT NULL THEN
//           INSERT INTO public.usuarios_escola (id, escola_id, perfil, nome_usuario, email, ativo, cargo, departamento)
//           VALUES (
//               NEW.id,
//               (NEW.raw_user_meta_data->>'escola_id')::UUID,
//               NEW.raw_user_meta_data->>'perfil',
//               COALESCE(NEW.raw_user_meta_data->>'nome_usuario', NEW.raw_user_meta_data->>'name', 'Usuário'),
//               NEW.email,
//               COALESCE((NEW.raw_user_meta_data->>'ativo')::BOOLEAN, TRUE),
//               NEW.raw_user_meta_data->>'cargo',
//               NEW.raw_user_meta_data->>'departamento'
//           )
//           ON CONFLICT (id) DO UPDATE SET
//               escola_id = EXCLUDED.escola_id,
//               perfil = EXCLUDED.perfil,
//               nome_usuario = EXCLUDED.nome_usuario,
//               email = EXCLUDED.email,
//               ativo = EXCLUDED.ativo,
//               cargo = EXCLUDED.cargo,
//               departamento = EXCLUDED.departamento,
//               updated_at = NOW();
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION is_compliance_analyst()
//   CREATE OR REPLACE FUNCTION public.is_compliance_analyst()
//    RETURNS boolean
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     RETURN EXISTS (
//       SELECT 1 FROM public.usuarios_escola
//       WHERE id = auth.uid() AND perfil = 'ANALISTA_COMPLIANCE'
//     );
//   END;
//   $function$
//   
// FUNCTION is_compliance_director()
//   CREATE OR REPLACE FUNCTION public.is_compliance_director()
//    RETURNS boolean
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT EXISTS (
//       SELECT 1 FROM public.usuarios_escola
//       WHERE id = auth.uid()
//       AND perfil = 'DIRETOR_COMPLIANCE'
//     );
//   $function$
//   
// FUNCTION is_compliance_member()
//   CREATE OR REPLACE FUNCTION public.is_compliance_member()
//    RETURNS boolean
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT EXISTS (
//       SELECT 1 FROM public.usuarios_escola
//       WHERE id = auth.uid()
//       AND perfil IN ('DIRETOR_COMPLIANCE', 'ANALISTA_COMPLIANCE')
//     );
//   $function$
//   
// FUNCTION is_user_member_of_escola(uuid)
//   CREATE OR REPLACE FUNCTION public.is_user_member_of_escola(p_escola_id uuid)
//    RETURNS boolean
//    LANGUAGE sql
//    STABLE SECURITY DEFINER
//   AS $function$
//     SELECT EXISTS (
//       SELECT 1 FROM public.usuarios_escola ue
//       WHERE ue.escola_id = p_escola_id AND ue.id = (SELECT auth.uid())
//     );
//   $function$
//   
// FUNCTION log_denuncia_auth_change()
//   CREATE OR REPLACE FUNCTION public.log_denuncia_auth_change()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       IF NEW.autorizado_gestao <> OLD.autorizado_gestao THEN
//           INSERT INTO public.logs_sistema (user_id, action_type, description, table_affected, metadata)
//           VALUES (
//               auth.uid(), 
//               'UPDATE_COMPLAINT_AUTH', 
//               CASE WHEN NEW.autorizado_gestao THEN 'Acesso liberado para gestão escolar' ELSE 'Acesso revogado para gestão escolar' END,
//               'denuncias',
//               jsonb_build_object('complaint_id', NEW.id, 'authorized', NEW.autorizado_gestao)
//           );
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION notify_audit_completion()
//   CREATE OR REPLACE FUNCTION public.notify_audit_completion()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   DECLARE
//       completed_status_id UUID;
//       director_ids UUID[];
//       director_id_var UUID;
//       audit_record RECORD;
//   BEGIN
//       -- Get 'Concluída' status ID
//       SELECT id INTO completed_status_id FROM public.status_auditoria WHERE nome_status = 'Concluída';
//       
//       -- Check if status changed to completed
//       IF NEW.status = completed_status_id::text AND (OLD.status IS NULL OR OLD.status != completed_status_id::text) THEN
//           -- Get Audit details
//           SELECT a.tipo, e.nome_escola INTO audit_record
//           FROM public.auditorias a
//           JOIN public.escolas_instituicoes e ON a.escola_id = e.id
//           WHERE a.id = NEW.id;
//   
//           -- Find Directors (assuming profile 'DIRETOR_COMPLIANCE')
//           -- We select from usuarios_escola which should match auth.users id
//           SELECT ARRAY_AGG(id) INTO director_ids 
//           FROM public.usuarios_escola 
//           WHERE perfil = 'DIRETOR_COMPLIANCE';
//   
//           IF director_ids IS NOT NULL THEN
//               FOREACH director_id_var IN ARRAY director_ids
//               LOOP
//                   INSERT INTO public.notifications (user_id, title, message, type, link, read)
//                   VALUES (
//                       director_id_var,
//                       'Auditoria Concluída',
//                       'A auditoria ' || audit_record.tipo || ' na escola ' || audit_record.nome_escola || ' foi finalizada.',
//                       'success',
//                       '/compliance/director/dashboard', -- Opens dashboard where they can see recent audits
//                       false
//                   );
//               END LOOP;
//           END IF;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION prevent_sensitive_user_update()
//   CREATE OR REPLACE FUNCTION public.prevent_sensitive_user_update()
//    RETURNS trigger
//    LANGUAGE plpgsql
//    SECURITY DEFINER
//   AS $function$
//   BEGIN
//     -- If user is NOT Admin Master
//     IF (public.check_is_admin_master() IS FALSE) THEN
//       -- Check if restricted columns are being changed
//       IF (OLD.perfil IS DISTINCT FROM NEW.perfil) OR (OLD.escola_id IS DISTINCT FROM NEW.escola_id) THEN
//         RAISE EXCEPTION 'You are not allowed to update perfil or escola_id';
//       END IF;
//     END IF;
//     RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION update_updated_at()
//   CREATE OR REPLACE FUNCTION public.update_updated_at()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       NEW.updated_at = now();
//       RETURN NEW;
//   END;
//   $function$
//   
// FUNCTION update_updated_at(text, uuid)
//   CREATE OR REPLACE FUNCTION public.update_updated_at(p_table_name text, p_row_id uuid)
//    RETURNS void
//    LANGUAGE plpgsql
//   AS $function$DECLARE
//     _old_search_path text;
//     _sql text;
//   BEGIN
//     -- Save current search_path (safe - returns NULL if not set)
//     SELECT current_setting('search_path', true) INTO _old_search_path;
//   
//     -- Set a conservative, deterministic search_path for the function runtime
//     PERFORM set_config('search_path', 'public', true);
//   
//     /*
//       Build a parameterized UPDATE that sets updated_at = now() for the given id.
//       Using format(..., p_table_name) with %I ensures the table name is used as an identifier
//       (properly quoted). The id is passed via USING to avoid embedding values directly.
//     * /
//     _sql := format('UPDATE public.%I SET updated_at = now() WHERE id = $1', p_table_name);
//   
//     EXECUTE _sql USING p_row_id;
//   
//     -- Restore prior search_path
//     PERFORM set_config('search_path', COALESCE(_old_search_path, ''), true);
//   
//     RETURN;
//   EXCEPTION
//     WHEN OTHERS THEN
//       -- Attempt to restore prior search_path even on error, then re-raise
//       PERFORM set_config('search_path', COALESCE(_old_search_path, ''), true);
//       RAISE;
//   END;$function$
//   
// FUNCTION validate_compliance_task_reference()
//   CREATE OR REPLACE FUNCTION public.validate_compliance_task_reference()
//    RETURNS trigger
//    LANGUAGE plpgsql
//   AS $function$
//   BEGIN
//       -- Only validate if the module is Denúncia and a reference ID is provided
//       IF NEW.tipo_modulo IN ('Denúncia', 'Denuncia') AND NEW.referencia_id IS NOT NULL THEN
//           -- Check if referenced complaint exists in the denuncias table
//           IF NOT EXISTS (SELECT 1 FROM public.denuncias WHERE id::text = NEW.referencia_id::text) THEN
//                RAISE EXCEPTION 'Referenced complaint (ID: %) does not exist in denuncias table.', NEW.referencia_id;
//           END IF;
//       END IF;
//       RETURN NEW;
//   END;
//   $function$
//   

// --- TRIGGERS ---
// Table: auditorias
//   on_audit_completion: CREATE TRIGGER on_audit_completion AFTER UPDATE OF status ON public.auditorias FOR EACH ROW EXECUTE FUNCTION notify_audit_completion()
// Table: compliance_tasks
//   enforce_analyst_task_updates: CREATE TRIGGER enforce_analyst_task_updates BEFORE UPDATE ON public.compliance_tasks FOR EACH ROW EXECUTE FUNCTION check_analyst_task_updates()
//   trg_validate_compliance_task_reference: CREATE TRIGGER trg_validate_compliance_task_reference BEFORE INSERT OR UPDATE ON public.compliance_tasks FOR EACH ROW EXECUTE FUNCTION validate_compliance_task_reference()
// Table: denuncias
//   denuncias_before_insert_trig: CREATE TRIGGER denuncias_before_insert_trig BEFORE INSERT ON public.denuncias FOR EACH ROW EXECUTE FUNCTION denuncias_before_insert()
//   handle_updated_at: CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.denuncias FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at')
//   on_complaint_created: CREATE TRIGGER on_complaint_created AFTER INSERT ON public.denuncias FOR EACH ROW EXECUTE FUNCTION handle_new_complaint_log()
//   trg_denuncias_updated_at: CREATE TRIGGER trg_denuncias_updated_at BEFORE UPDATE ON public.denuncias FOR EACH ROW EXECUTE FUNCTION update_updated_at()
//   trg_log_denuncia_auth: CREATE TRIGGER trg_log_denuncia_auth AFTER UPDATE ON public.denuncias FOR EACH ROW EXECUTE FUNCTION log_denuncia_auth_change()
//   trigger_generate_complaint_protocol: CREATE TRIGGER trigger_generate_complaint_protocol BEFORE INSERT ON public.denuncias FOR EACH ROW EXECUTE FUNCTION generate_complaint_protocol()
// Table: escolas_instituicoes
//   on_escolas_updated: CREATE TRIGGER on_escolas_updated BEFORE UPDATE ON public.escolas_instituicoes FOR EACH ROW EXECUTE FUNCTION handle_escolas_updated_at()
// Table: usuarios_escola
//   check_sensitive_user_update: CREATE TRIGGER check_sensitive_user_update BEFORE UPDATE ON public.usuarios_escola FOR EACH ROW EXECUTE FUNCTION prevent_sensitive_user_update()

// --- INDEXES ---
// Table: analyst_assignments
//   CREATE UNIQUE INDEX analyst_assignments_analyst_id_school_id_key ON public.analyst_assignments USING btree (analyst_id, school_id)
//   CREATE INDEX idx_analyst_assignments_analyst_id ON public.analyst_assignments USING btree (analyst_id)
//   CREATE INDEX idx_analyst_assignments_school_id ON public.analyst_assignments USING btree (school_id)
// Table: auditorias
//   CREATE INDEX idx_auditorias_data_auditoria ON public.auditorias USING btree (data_auditoria)
//   CREATE INDEX idx_auditorias_status ON public.auditorias USING btree (status)
// Table: codigo_conduta
//   CREATE UNIQUE INDEX codigo_conduta_escola_unique ON public.codigo_conduta USING btree (escola_id)
// Table: compliance_tasks
//   CREATE INDEX compliance_tasks_analista_id_idx ON public.compliance_tasks USING btree (analista_id)
//   CREATE INDEX compliance_tasks_status_idx ON public.compliance_tasks USING btree (status)
//   CREATE INDEX idx_compliance_tasks_escola_id ON public.compliance_tasks USING btree (escola_id)
// Table: compromisso_alta_gestao
//   CREATE UNIQUE INDEX compromisso_escola_unique ON public.compromisso_alta_gestao USING btree (escola_id)
// Table: denuncias
//   CREATE UNIQUE INDEX denuncias_protocolo_key ON public.denuncias USING btree (protocolo)
//   CREATE INDEX idx_denuncias_analista_id ON public.denuncias USING btree (analista_id)
//   CREATE INDEX idx_denuncias_autorizado_gestao ON public.denuncias USING btree (autorizado_gestao)
//   CREATE INDEX idx_denuncias_categoria ON public.denuncias USING btree (categoria)
//   CREATE INDEX idx_denuncias_gravidade ON public.denuncias USING btree (gravidade)
//   CREATE INDEX idx_denuncias_protocolo ON public.denuncias USING btree (protocolo)
//   CREATE INDEX idx_denuncias_status ON public.denuncias USING btree (status)
//   CREATE INDEX idx_denuncias_user_id ON public.denuncias USING btree (user_id)
// Table: due_diligence
//   CREATE INDEX idx_due_diligence_fornecedor ON public.due_diligence USING btree (fornecedor)
//   CREATE INDEX idx_due_diligence_nivel_risco ON public.due_diligence USING btree (nivel_risco)
//   CREATE INDEX idx_due_diligence_status ON public.due_diligence USING btree (status)
// Table: escolas_instituicoes
//   CREATE UNIQUE INDEX escolas_instituicoes_nome_escola_key ON public.escolas_instituicoes USING btree (nome_escola)
//   CREATE INDEX idx_escolas_ativo ON public.escolas_instituicoes USING btree (ativo)
//   CREATE INDEX idx_escolas_nome ON public.escolas_instituicoes USING btree (nome_escola)
//   CREATE INDEX idx_escolas_status_adesao ON public.escolas_instituicoes USING btree (status_adesao)
// Table: historico_permissoes
//   CREATE INDEX idx_historico_permissoes_created_at ON public.historico_permissoes USING btree (created_at DESC)
// Table: investigacoes
//   CREATE INDEX idx_investigacoes_data_inicio ON public.investigacoes USING btree (data_inicio)
//   CREATE INDEX idx_investigacoes_status ON public.investigacoes USING btree (status)
// Table: logs_sistema
//   CREATE INDEX idx_logs_sistema_action_type ON public.logs_sistema USING btree (action_type)
//   CREATE INDEX idx_logs_sistema_created_at ON public.logs_sistema USING btree (created_at DESC)
//   CREATE INDEX idx_logs_sistema_table_affected ON public.logs_sistema USING btree (table_affected)
//   CREATE INDEX idx_logs_sistema_user_id ON public.logs_sistema USING btree (user_id)
//   CREATE INDEX idx_logs_sistema_user_id_created_at ON public.logs_sistema USING btree (user_id, created_at DESC)
// Table: mediacoes
//   CREATE INDEX idx_mediacoes_data_inicio ON public.mediacoes USING btree (data_inicio)
//   CREATE INDEX idx_mediacoes_status ON public.mediacoes USING btree (status)
// Table: notifications
//   CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at)
//   CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id)
// Table: processos_disciplinares
//   CREATE INDEX idx_processos_disciplinares_data_abertura ON public.processos_disciplinares USING btree (data_abertura)
//   CREATE INDEX idx_processos_disciplinares_status ON public.processos_disciplinares USING btree (status)
// Table: relatorios_consolidados
//   CREATE UNIQUE INDEX relatorios_consolidados_escola_ano_unique ON public.relatorios_consolidados USING btree (escola_id, ano)
// Table: relatorios_ia
//   CREATE INDEX idx_relatorios_ia_data_geracao ON public.relatorios_ia USING btree (data_geracao)
//   CREATE INDEX idx_relatorios_ia_tipo ON public.relatorios_ia USING btree (tipo)
// Table: treinamentos
//   CREATE INDEX idx_treinamentos_obrigatorio ON public.treinamentos USING btree (obrigatorio)
//   CREATE INDEX idx_treinamentos_titulo ON public.treinamentos USING btree (titulo)
// Table: treinamentos_conclusoes
//   CREATE INDEX idx_treinamentos_conclusoes_progresso ON public.treinamentos_conclusoes USING btree (progresso)
//   CREATE INDEX idx_treinamentos_conclusoes_status ON public.treinamentos_conclusoes USING btree (status)
//   CREATE UNIQUE INDEX treinamentos_conclusoes_treinamento_id_usuario_id_key ON public.treinamentos_conclusoes USING btree (treinamento_id, usuario_id)
// Table: usuarios_admin_master
//   CREATE UNIQUE INDEX usuarios_admin_master_email_key ON public.usuarios_admin_master USING btree (email)
// Table: usuarios_escola
//   CREATE INDEX idx_usuarios_escola_email ON public.usuarios_escola USING btree (email)
//   CREATE INDEX idx_usuarios_escola_escola_id_id ON public.usuarios_escola USING btree (escola_id, id)
//   CREATE INDEX idx_usuarios_escola_id_perfil ON public.usuarios_escola USING btree (id, perfil)
//   CREATE INDEX idx_usuarios_escola_perfil ON public.usuarios_escola USING btree (perfil)
//   CREATE UNIQUE INDEX usuarios_escola_email_key ON public.usuarios_escola USING btree (email)
// Table: workflow_analistas
//   CREATE UNIQUE INDEX workflow_analistas_denuncia_id_analista_id_fase_key ON public.workflow_analistas USING btree (denuncia_id, analista_id, fase)
// Table: workflow_pareceres
//   CREATE UNIQUE INDEX workflow_pareceres_denuncia_id_analista_id_fase_key ON public.workflow_pareceres USING btree (denuncia_id, analista_id, fase)


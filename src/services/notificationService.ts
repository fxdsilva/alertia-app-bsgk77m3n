import { supabase } from '@/lib/supabase/client'
import { masterAdminService } from './masterAdminService'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  created_at: string
  read: boolean
  link?: string
}

export const notificationService = {
  async getRecentAlerts(schoolId?: string): Promise<Notification[]> {
    const alerts: Notification[] = []

    try {
      // Secure check: only proceed if authenticated
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) return []

      // Fetch Notification Settings
      const settingsData = await masterAdminService.getNotificationSettings()
      const settings = settingsData?.settings || {
        newComplaints: true,
        investigationUpdates: true,
        auditDeadlines: false,
        suspiciousAccess: true,
        schoolCreation: true,
        massDeletion: true,
      }

      // 1. New Complaints (if enabled)
      if (settings.newComplaints) {
        let complaintQuery = supabase
          .from('denuncias')
          .select('id, protocolo, created_at, status')
          .eq('status', 'pendente')
          .order('created_at', { ascending: false })
          .limit(5)

        if (schoolId) {
          complaintQuery = complaintQuery.eq('escola_id', schoolId)
        }

        const { data: complaints } = await complaintQuery

        complaints?.forEach((c) => {
          alerts.push({
            id: `c-${c.id}`,
            title: 'Nova Denúncia',
            message: `Protocolo ${c.protocolo} aguarda análise.`,
            type: 'warning',
            created_at: c.created_at,
            read: false,
            link: '/admin/complaints',
          })
        })
      }

      // 2. Suspicious Activity (ACCESS_DENIED bursts)
      // Only for global admins (no schoolId context)
      if (!schoolId && settings.suspiciousAccess) {
        const tenMinutesAgo = new Date(
          Date.now() - 10 * 60 * 1000,
        ).toISOString()

        // This query counts access denied logs per user in the last 10 mins
        // Note: Complex aggregation is better done in RPC, but we simulate client-side for now given limitations
        const { data: deniedLogs } = await supabase
          .from('logs_sistema')
          .select('user_id, created_at, description')
          .eq('action_type', 'ACCESS_DENIED')
          .gte('created_at', tenMinutesAgo)

        const userDenials: Record<string, number> = {}
        deniedLogs?.forEach((log) => {
          if (log.user_id) {
            userDenials[log.user_id] = (userDenials[log.user_id] || 0) + 1
          }
        })

        Object.entries(userDenials).forEach(([userId, count]) => {
          if (count >= 3) {
            alerts.push({
              id: `sec-${userId}-${Date.now()}`,
              title: 'Atividade Suspeita Detectada',
              message: `Usuário ${userId.substring(0, 8)}... teve ${count} negações de acesso recentes.`,
              type: 'error',
              created_at: new Date().toISOString(),
              read: false,
              link: '/admin/audit?filter=security',
            })
          }
        })
      }

      // 3. Failed Logins & System Errors
      if (settings.suspiciousAccess) {
        let logsQuery = supabase
          .from('logs_sistema')
          .select('id, action_type, description, created_at')
          .or('action_type.ilike.%FAIL%,action_type.eq.SECURITY_ALERT')
          .order('created_at', { ascending: false })
          .limit(3)

        const { data: logs } = await logsQuery

        logs?.forEach((l) => {
          alerts.push({
            id: `l-${l.id}`,
            title: 'Alerta de Segurança',
            message: `${l.action_type}: ${l.description}`,
            type: 'error',
            created_at: l.created_at,
            read: false,
            link: '/admin/audit',
          })
        })
      }

      // 4. New School Alerts (Global - Master Admin Only)
      if (!schoolId && settings.schoolCreation) {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)

        const { data: newSchools } = await supabase
          .from('escolas_instituicoes')
          .select('id, nome_escola, created_at')
          .gte('created_at', yesterday.toISOString())
          .order('created_at', { ascending: false })

        newSchools?.forEach((s) => {
          alerts.push({
            id: `s-${s.id}`,
            title: 'Nova Escola Criada!',
            message: `Uma nova escola foi adicionada ao sistema: ${s.nome_escola}.`,
            type: 'info',
            created_at: s.created_at,
            read: false,
            link: '/senior/schools',
          })
        })
      }

      // 5. Mass Deletion Alerts (Global - Master Admin Only)
      if (!schoolId && settings.massDeletion) {
        const oneHourAgo = new Date()
        oneHourAgo.setHours(oneHourAgo.getHours() - 1)

        // Using limit(0) instead of head:true to avoid empty body parsing issues on some clients/envs
        const { count, data: deleteLogs } = await supabase
          .from('logs_sistema')
          .select('id, description, created_at', {
            count: 'exact',
            head: false,
          })
          .eq('action_type', 'DELETE_USER')
          .gte('created_at', oneHourAgo.toISOString())
          .limit(1) // Just get one to have date reference if count > 0

        if (count && count > 5) {
          const latestLog = deleteLogs ? deleteLogs[0] : null
          alerts.push({
            id: `mass-del-${Date.now()}`,
            title: 'Exclusão em Massa!',
            message: `URGENTE: Grande quantidade de usuários (${count}) removidos na última hora.`,
            type: 'error',
            created_at: latestLog?.created_at || new Date().toISOString(),
            read: false,
            link: '/senior/audit-logs',
          })
        }
      }

      // Sort by date descending
      return alerts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    } catch (error) {
      console.error('Error fetching notifications', error)
      return []
    }
  },
}

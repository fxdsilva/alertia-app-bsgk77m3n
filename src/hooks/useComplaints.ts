import { useState, useEffect, useCallback } from 'react'
import { complaintService, Complaint } from '@/services/complaintService'
import { useToast } from '@/hooks/use-toast'

export function useComplaints(filters?: {
  status?: string
  escola_id?: string
  analista_id?: string
}) {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true)
      const data = await complaintService.getComplaints(filters)
      setComplaints(data)
      setError(null)
    } catch (err: any) {
      setError(err)
      toast({
        title: 'Erro ao buscar denúncias',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [filters, toast])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  return { complaints, loading, error, refetch: fetchComplaints }
}

export function useComplaint(id: string | undefined) {
  const [complaint, setComplaint] = useState<Complaint | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const fetchComplaint = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await complaintService.getComplaintById(id)
      setComplaint(data)
      setError(null)
    } catch (err: any) {
      setError(err)
      toast({
        title: 'Erro ao buscar denúncia',
        description: err.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [id, toast])

  useEffect(() => {
    fetchComplaint()
  }, [fetchComplaint])

  return { complaint, loading, error, refetch: fetchComplaint }
}

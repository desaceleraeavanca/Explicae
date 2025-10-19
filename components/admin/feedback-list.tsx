"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Feedback {
  id: string
  user_id: string
  feature?: string
  message: string
  rating: number | null
  created_at: string
  profiles: {
    email: string
    full_name: string | null
  }
}

export function FeedbackList({
  typeFilter,
  page = 1,
  pageSize = 10,
  startDate,
  endDate,
  onTotalChange,
}: {
  typeFilter: string
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
  onTotalChange?: (total: number) => void
}) {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFeedback()
  }, [typeFilter, page, pageSize, startDate, endDate])

  async function loadFeedback() {
    try {
      setLoading(true)
      const supabase = createClient()
      let query = supabase
        .from("user_feedback")
        .select(
          `id, user_id, message, rating, feature, created_at, profiles ( email, full_name )`,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })

      if (typeFilter !== "todos") query = query.ilike("feature", `%${typeFilter}%`)
      if (startDate) query = query.gte("created_at", `${startDate}T00:00:00.000Z`)
      if (endDate) query = query.lte("created_at", `${endDate}T23:59:59.999Z`)

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) throw error
      setFeedback((data || []) as any)
      if (typeof onTotalChange === "function") onTotalChange(count ?? 0)
    } catch (error) {
      console.error("Erro ao carregar feedback:", error)
      toast({ title: "Erro", description: "Falha ao carregar feedback", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  function getTypeColor(type: string) {
    switch (type) {
      case "bug":
        return "bg-red-500"
      case "feature":
        return "bg-blue-500"
      case "improvement":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return <Card className="p-6">Carregando feedback...</Card>
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Feedback dos Usuários</h2>
      <div className="space-y-4">
        {feedback.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum feedback ainda</p>
        ) : (
          feedback.map((item) => (
            <div key={item.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getTypeColor(item.feature || "other")}>{item.feature || "Sem categoria"}</Badge>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        {Array.from({ length: item.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-sm mt-1">{item.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {item.profiles?.full_name || item.profiles?.email} •{" "}
                    {formatDistanceToNow(new Date(item.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

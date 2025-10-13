"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface Feedback {
  id: string
  user_id: string
  type: string
  message: string
  rating: number | null
  status: string
  created_at: string
  profiles: {
    email: string
    full_name: string | null
  }
}

export function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadFeedback()
  }, [])

  async function loadFeedback() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("feedback")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setFeedback(data as any)
    }
    setLoading(false)
  }

  async function updateFeedbackStatus(feedbackId: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from("feedback").update({ status }).eq("id", feedbackId)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o feedback",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Status do feedback atualizado",
      })
      loadFeedback()
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
                    <Badge className={getTypeColor(item.type)}>{item.type}</Badge>
                    <Badge variant="outline">{item.status}</Badge>
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
              <Select value={item.status} onValueChange={(value) => updateFeedbackStatus(item.id, value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="novo">Novo</SelectItem>
                  <SelectItem value="analisando">Analisando</SelectItem>
                  <SelectItem value="planejado">Planejado</SelectItem>
                  <SelectItem value="implementado">Implementado</SelectItem>
                  <SelectItem value="rejeitado">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MessageSquare, Clock, CheckCircle2, XCircle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"

interface Ticket {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  profiles: {
    email: string
    full_name: string | null
  }
}

export function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    loadTickets()
  }, [])

  async function loadTickets() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*, profiles(email, full_name)")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setTickets(data as any)
    }
    setLoading(false)
  }

  async function updateTicketStatus(ticketId: string, status: string) {
    const supabase = createClient()
    const { error } = await supabase.from("support_tickets").update({ status }).eq("id", ticketId)

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o ticket",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Status do ticket atualizado",
      })
      loadTickets()
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "aberto":
        return <Clock className="h-4 w-4" />
      case "em_andamento":
        return <MessageSquare className="h-4 w-4" />
      case "resolvido":
        return <CheckCircle2 className="h-4 w-4" />
      case "fechado":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case "urgente":
        return "bg-red-500"
      case "alta":
        return "bg-orange-500"
      case "media":
        return "bg-yellow-500"
      case "baixa":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return <Card className="p-6">Carregando tickets...</Card>
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Tickets de Suporte</h2>
      <div className="space-y-4">
        {tickets.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">Nenhum ticket de suporte ainda</p>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                    <Badge variant="outline" className="gap-1">
                      {getStatusIcon(ticket.status)}
                      {ticket.status}
                    </Badge>
                  </div>
                  <h3 className="font-semibold">{ticket.subject}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{ticket.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {ticket.profiles?.full_name || ticket.profiles?.email} •{" "}
                    {formatDistanceToNow(new Date(ticket.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={ticket.status} onValueChange={(value) => updateTicketStatus(ticket.id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aberto">Aberto</SelectItem>
                    <SelectItem value="em_andamento">Em Andamento</SelectItem>
                    <SelectItem value="resolvido">Resolvido</SelectItem>
                    <SelectItem value="fechado">Fechado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

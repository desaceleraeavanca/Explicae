"use client"

import { useState, useEffect } from "react"
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

// Dados mockados para desenvolvimento
const MOCK_TICKETS: Ticket[] = [
  {
    id: "1",
    user_id: "123",
    subject: "Problema com analogias",
    message: "Não consigo gerar analogias sobre programação. O sistema fica carregando infinitamente.",
    status: "pendente",
    priority: "normal",
    created_at: new Date().toISOString(),
    profiles: {
      email: "usuario@exemplo.com",
      full_name: "Maria Silva"
    }
  },
  {
    id: "2",
    user_id: "456",
    subject: "Dúvida sobre planos",
    message: "Qual plano é melhor para uso educacional? Preciso para uma turma de 30 alunos.",
    status: "aberto",
    priority: "alta",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: {
      email: "outro@exemplo.com",
      full_name: "João Santos"
    }
  },
  {
    id: "3",
    user_id: "789",
    subject: "Erro ao salvar analogias",
    message: "Quando tento salvar minhas analogias favoritas, recebo um erro de 'operação não permitida'.",
    status: "em_andamento",
    priority: "baixa",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    profiles: {
      email: "dev@exemplo.com",
      full_name: "Carlos Ferreira"
    }
  },
  {
    id: "4",
    user_id: "101",
    subject: "Sugestão de melhoria",
    message: "Seria ótimo ter uma opção para exportar as analogias em formato PDF para uso em sala de aula.",
    status: "resolvido",
    priority: "normal",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    profiles: {
      email: "prof@exemplo.com",
      full_name: "Ana Oliveira"
    }
  }
];

export function SupportTickets() {
  const [tickets, setTickets] = useState<Ticket[]>(MOCK_TICKETS)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Comentado temporariamente enquanto usamos dados mockados
    // loadTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadTickets() {
    try {
      setError(null);
      setLoading(true);
      
      // Dados de exemplo para garantir que algo seja exibido
      const dadosExemplo = [
        {
          id: "1",
          user_id: "123",
          subject: "Problema com analogias",
          message: "Não consigo gerar analogias sobre programação",
          status: "pendente",
          priority: "normal",
          created_at: new Date().toISOString(),
          profiles: {
            email: "usuario@exemplo.com",
            full_name: "Usuário Exemplo"
          }
        },
        {
          id: "2",
          user_id: "456",
          subject: "Dúvida sobre planos",
          message: "Qual plano é melhor para meu caso?",
          status: "aberto",
          priority: "alta",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          profiles: {
            email: "outro@exemplo.com",
            full_name: "Outro Usuário"
          }
        }
      ];
      
      try {
        // Tentar carregar da API primeiro
        const response = await fetch('/api/admin/tickets');
        
        if (!response.ok) {
          throw new Error('Erro ao carregar da API');
        }
        
        const data = await response.json();
        console.log("Tickets carregados da API:", data.tickets);
        setTickets(data.tickets || []);
      } catch (apiError) {
        console.error("Erro ao carregar da API, usando dados de exemplo:", apiError);
        // Se falhar, usar dados de exemplo
        setTickets(dadosExemplo);
        toast({
          title: "Aviso",
          description: "Usando dados de exemplo devido a problemas de conexão",
          variant: "default",
        });
      }
    } catch (err: any) {
      console.error("Erro geral:", err);
      setError(err.message || "Falha na conexão com o servidor. Verifique sua conexão com a internet.");
      toast({
        title: "Erro",
        description: `Erro ao carregar tickets: ${err.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateTicketStatus(ticketId: string, status: string) {
    try {
      const response = await fetch('/api/admin/tickets/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ticketId, status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar ticket');
      }

      toast({
        title: "Sucesso",
        description: "Status do ticket atualizado",
      });
      
      loadTickets();
    } catch (err: any) {
      console.error("Erro ao atualizar ticket:", err);
      toast({
        title: "Erro",
        description: `Não foi possível atualizar o ticket: ${err.message || "Erro desconhecido"}`,
        variant: "destructive",
      });
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case "pendente":
        return <Clock className="h-4 w-4" />
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
      case "normal":
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

  if (error) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Tickets de Suporte</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p className="font-medium">Erro ao carregar tickets</p>
          <p className="text-sm mt-1">{error}</p>
          <button 
            onClick={() => {setLoading(true); loadTickets()}}
            className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
          >
            Tentar novamente
          </button>
        </div>
      </Card>
    )
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
                    <SelectItem value="pendente">Pendente</SelectItem>
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

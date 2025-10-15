"use client"

import { useState, useEffect } from "react"
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

// Dados mockados para desenvolvimento
const MOCK_FEEDBACK: Feedback[] = [
  {
    id: "1",
    user_id: "123",
    type: "bug",
    message: "O botão de salvar analogias não está funcionando quando clico nele mais de uma vez.",
    rating: 3,
    status: "novo",
    created_at: new Date().toISOString(),
    profiles: {
      email: "usuario@exemplo.com",
      full_name: "Pedro Almeida"
    }
  },
  {
    id: "2",
    user_id: "456",
    type: "feature",
    message: "Seria ótimo ter uma opção para compartilhar analogias diretamente no WhatsApp.",
    rating: 5,
    status: "em_analise",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    profiles: {
      email: "outro@exemplo.com",
      full_name: "Carla Mendes"
    }
  },
  {
    id: "3",
    user_id: "789",
    type: "improvement",
    message: "A interface poderia ter cores mais vibrantes para destacar as analogias principais.",
    rating: 4,
    status: "implementado",
    created_at: new Date(Date.now() - 172800000).toISOString(),
    profiles: {
      email: "design@exemplo.com",
      full_name: "Marcos Souza"
    }
  },
  {
    id: "4",
    user_id: "101",
    type: "bug",
    message: "Quando tento gerar mais de 5 analogias seguidas, o sistema trava por alguns segundos.",
    rating: 2,
    status: "resolvido",
    created_at: new Date(Date.now() - 259200000).toISOString(),
    profiles: {
      email: "teste@exemplo.com",
      full_name: "Juliana Costa"
    }
  }
];

export function FeedbackList() {
  const [feedback, setFeedback] = useState<Feedback[]>(MOCK_FEEDBACK)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Comentado temporariamente enquanto usamos dados mockados
    // loadFeedback()
  }, [])

  async function loadFeedback() {
    // Função mantida para referência futura
    // Quando a conexão com o Supabase for resolvida, podemos reativar
    setLoading(true)
    try {
      // Simulando uma chamada de API
      setTimeout(() => {
        setFeedback(MOCK_FEEDBACK)
        setLoading(false)
      }, 500)
    } catch (error) {
      console.error("Erro ao carregar feedback:", error)
      setLoading(false)
    }
  }

  async function updateFeedbackStatus(feedbackId: string, status: string) {
    // Versão mockada da função de atualização
    try {
      // Simulando uma chamada de API
      setTimeout(() => {
        const updatedFeedback = feedback.map(item => 
          item.id === feedbackId ? { ...item, status } : item
        )
        setFeedback(updatedFeedback)
        
        toast({
          title: "Sucesso",
          description: "Status do feedback atualizado",
        })
      }, 300)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o feedback",
        variant: "destructive",
      })
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

"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { MessageSquare, Star } from "lucide-react"

interface SupportFormProps {
  userId: string
}

export function SupportForm({ userId }: SupportFormProps) {
  const [loading, setLoading] = useState(false)
  const [ticketData, setTicketData] = useState({
    subject: "",
    message: "",
    priority: "media",
  })
  const [feedbackData, setFeedbackData] = useState({
    type: "feature",
    message: "",
    rating: 5,
  })
  const { toast } = useToast()

  async function handleTicketSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("support_tickets").insert({
      user_id: userId,
      ...ticketData,
    })

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o ticket",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Ticket enviado com sucesso! Entraremos em contato em breve.",
      })
      setTicketData({ subject: "", message: "", priority: "media" })
    }

    setLoading(false)
  }

  async function handleFeedbackSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from("feedback").insert({
      user_id: userId,
      ...feedbackData,
    })

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Obrigado pelo seu feedback!",
      })
      setFeedbackData({ type: "feature", message: "", rating: 5 })
    }

    setLoading(false)
  }

  return (
    <Tabs defaultValue="ticket" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="ticket">
          <MessageSquare className="h-4 w-4 mr-2" />
          Abrir Ticket
        </TabsTrigger>
        <TabsTrigger value="feedback">
          <Star className="h-4 w-4 mr-2" />
          Enviar Feedback
        </TabsTrigger>
      </TabsList>

      <TabsContent value="ticket">
        <Card className="p-6">
          <form onSubmit={handleTicketSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Assunto</Label>
              <Input
                value={ticketData.subject}
                onChange={(e) => setTicketData({ ...ticketData, subject: e.target.value })}
                placeholder="Descreva brevemente o problema"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select
                value={ticketData.priority}
                onValueChange={(value) => setTicketData({ ...ticketData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="urgente">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={ticketData.message}
                onChange={(e) => setTicketData({ ...ticketData, message: e.target.value })}
                placeholder="Descreva o problema em detalhes..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar Ticket"}
            </Button>
          </form>
        </Card>
      </TabsContent>

      <TabsContent value="feedback">
        <Card className="p-6">
          <form onSubmit={handleFeedbackSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de Feedback</Label>
              <Select
                value={feedbackData.type}
                onValueChange={(value) => setFeedbackData({ ...feedbackData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug">Bug / Problema</SelectItem>
                  <SelectItem value="feature">Nova Funcionalidade</SelectItem>
                  <SelectItem value="improvement">Melhoria</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Avaliação (1-5 estrelas)</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFeedbackData({ ...feedbackData, rating })}
                    className="p-2 hover:bg-muted rounded"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        rating <= feedbackData.rating ? "fill-yellow-500 text-yellow-500" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea
                value={feedbackData.message}
                onChange={(e) => setFeedbackData({ ...feedbackData, message: e.target.value })}
                placeholder="Compartilhe suas ideias ou sugestões..."
                rows={6}
                required
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Enviando..." : "Enviar Feedback"}
            </Button>
          </form>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

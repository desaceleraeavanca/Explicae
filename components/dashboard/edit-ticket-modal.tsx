"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Ticket {
  id: string
  subject: string
  message: string
  priority: 'baixa' | 'normal' | 'alta' | 'urgente'
}

interface EditTicketModalProps {
  ticket: Ticket | null
  isOpen: boolean
  onClose: () => void
  onTicketUpdated: (updatedTicket: Ticket) => void
}

export function EditTicketModal({ ticket, isOpen, onClose, onTicketUpdated }: EditTicketModalProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [priority, setPriority] = useState<'baixa' | 'normal' | 'alta' | 'urgente'>('baixa')
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (ticket) {
      setSubject(ticket.subject)
      setMessage(ticket.message)
      setPriority(ticket.priority)
    }
  }, [ticket])

  async function handleSave() {
    if (!ticket) return

    setIsSaving(true)
    const supabase = createClient()

    const { data, error } = await supabase
      .from("support_tickets")
      .update({ subject, message, priority, updated_at: new Date().toISOString() })
      .eq("id", ticket.id)
      .select()
      .single()

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível atualizar o ticket. Tente novamente.",
        variant: "destructive",
      })
    } else if (data) {
      toast({
        title: "Ticket atualizado!",
        description: "Suas alterações foram salvas com sucesso.",
      })
      onTicketUpdated(data as Ticket)
      onClose()
    }

    setIsSaving(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ticket</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="subject">Assunto</label>
            <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="message">Mensagem</label>
            <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} />
          </div>
          <div className="grid gap-2">
            <label htmlFor="priority">Prioridade</label>
            <Select value={priority} onValueChange={(value: 'baixa' | 'normal' | 'alta' | 'urgente') => setPriority(value)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Selecione a prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
"use client"

import { useState, useEffect } from "react"
import { DateRange } from "react-day-picker"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { SupportTickets } from "@/components/admin/support-tickets"
import { FeedbackList } from "@/components/admin/feedback-list"
import { DateRangePicker } from "@/components/ui/date-range-picker"

export function SupportPage() {
  const [ticketStatus, setTicketStatus] = useState<string>("todos")
  const [ticketPriority, setTicketPriority] = useState<string>("todos")

  const [feedbackStatus, setFeedbackStatus] = useState<string>("todos")
  const [feedbackType, setFeedbackType] = useState<string>("todos")

  // Filtros globais de data e paginação
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [page, setPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(10)
  const [activeTab, setActiveTab] = useState<string>("tickets")
  const [ticketsPage, setTicketsPage] = useState<number>(1)
  const [feedbackPage, setFeedbackPage] = useState<number>(1)
  const [ticketsTotal, setTicketsTotal] = useState<number>(0)
  const [feedbackTotal, setFeedbackTotal] = useState<number>(0)
  const [datePreset, setDatePreset] = useState<string>("none")

  // Resetar página ao mudar filtros
  useEffect(() => {
    setTicketsPage(1)
    setFeedbackPage(1)
  }, [ticketStatus, ticketPriority, feedbackStatus, feedbackType, dateRange, pageSize])

  // Presets de datas
  useEffect(() => {
    if (datePreset === "none") {
      setDateRange(undefined)
      return
    }
    const to = new Date()
    let from = new Date(to)
    if (datePreset === "today") {
      from = new Date(to)
    } else if (datePreset === "last7") {
      from.setDate(to.getDate() - 6)
    } else if (datePreset === "last30") {
      from.setDate(to.getDate() - 29)
    }
    setDateRange({ from, to })
  }, [datePreset])

  const ticketsTotalPages = Math.max(1, Math.ceil(ticketsTotal / pageSize))
  const feedbackTotalPages = Math.max(1, Math.ceil(feedbackTotal / pageSize))

  async function exportFeedback() {
    const supabase = createClient()
    let query = supabase
      .from("user_feedback")
      .select(`id, user_id, feature, message, rating, created_at, profiles ( email, full_name )`)
      .order("created_at", { ascending: false })

    if (feedbackType !== "todos") query = query.ilike("feature", `%${feedbackType}%`)
    if (dateRange?.from) query = query.gte("created_at", `${dateRange.from.toISOString().slice(0, 10)}T00:00:00.000Z`)
    if (dateRange?.to) query = query.lte("created_at", `${dateRange.to.toISOString().slice(0, 10)}T23:59:59.999Z`)

    const { data, error } = await query
    if (error) {
      console.error(error)
      return
    }

    const headers = [
      { key: "profiles.full_name", label: "nome" },
      { key: "profiles.email", label: "email" },
      { key: "feature", label: "categoria" },
      { key: "message", label: "mensagem" },
      { key: "rating", label: "avaliacao" },
      { key: "created_at", label: "criado_em" },
    ]

    const csv = toCSV(data || [], headers)
    downloadCSV(csv, "feedback.csv")
  }

  function toCSV(data: any[], headers: { key: string; label: string }[]) {
    const escape = (val: any) => {
      if (val == null) return ""
      const str = String(val).replace(/"/g, '""')
      return `"${str}"`
    }

    const headerRow = headers.map((h) => escape(h.label)).join(",")
    const rows = data.map((row) =>
      headers
        .map((h) => {
          // support nested keys like profiles.email
          const parts = h.key.split(".")
          let val: any = row
          for (const p of parts) {
            if (val && p in val) val = val[p]
            else {
              val = ""
              break
            }
          }
          return escape(val)
        })
        .join(",")
    )
    return [headerRow, ...rows].join("\n")
  }

  function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="tickets">Tickets</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select value={ticketStatus} onValueChange={setTicketStatus}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Status dos tickets" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="resolvido">Resolvido</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={ticketPriority} onValueChange={setTicketPriority}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas prioridades</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            <Select value={datePreset} onValueChange={setDatePreset}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem preset</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="last7">Últimos 7 dias</SelectItem>
                <SelectItem value="last30">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Itens/página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <SupportTickets
            statusFilter={ticketStatus}
            priorityFilter={ticketPriority}
            page={ticketsPage}
            pageSize={pageSize}
            startDate={dateRange?.from?.toISOString().slice(0, 10)}
            endDate={dateRange?.to?.toISOString().slice(0, 10)}
            onTotalChange={(t) => setTicketsTotal(t)}
          />
          <div className="flex items-center gap-3 mt-3">
            <Button variant="outline" onClick={() => setTicketsPage((p) => Math.max(1, p - 1))} disabled={ticketsPage <= 1}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {ticketsPage} de {ticketsTotalPages}</span>
            <Button variant="outline" onClick={() => setTicketsPage((p) => Math.min(ticketsTotalPages, p + 1))} disabled={ticketsPage >= ticketsTotalPages}>Próxima</Button>
          </div>
        </TabsContent>

        <TabsContent value="feedback">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Select value={feedbackType} onValueChange={setFeedbackType}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as categorias</SelectItem>
                <SelectItem value="bug">Bug</SelectItem>
                <SelectItem value="feature">Feature</SelectItem>
                <SelectItem value="improvement">Improvement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <DateRangePicker date={dateRange} onDateChange={setDateRange} />
            <Select value={datePreset} onValueChange={setDatePreset}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem preset</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="last7">Últimos 7 dias</SelectItem>
                <SelectItem value="last30">Últimos 30 dias</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Itens/página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
                <SelectItem value="50">50 por página</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={exportFeedback}>Exportar Feedback</Button>
          </div>
          <FeedbackList
            typeFilter={feedbackType}
            page={feedbackPage}
            pageSize={pageSize}
            startDate={dateRange?.from?.toISOString().slice(0, 10)}
            endDate={dateRange?.to?.toISOString().slice(0, 10)}
            onTotalChange={(t) => setFeedbackTotal(t)}
          />
          <div className="flex items-center gap-3 mt-3">
            <Button variant="outline" onClick={() => setFeedbackPage((p) => Math.max(1, p - 1))} disabled={feedbackPage <= 1}>Anterior</Button>
            <span className="text-sm text-muted-foreground">Página {feedbackPage} de {feedbackTotalPages}</span>
            <Button variant="outline" onClick={() => setFeedbackPage((p) => Math.min(feedbackTotalPages, p + 1))} disabled={feedbackPage >= feedbackTotalPages}>Próxima</Button>
          </div>
        </TabsContent>
      </Tabs>
     </div>
   )
 }
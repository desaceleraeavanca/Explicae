"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, Calendar, Target, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

// Dados mockados para desenvolvimento
const mockCampaigns = [
  {
    id: "camp-001",
    name: "Lançamento Curso React",
    status: "active",
    type: "email",
    audience: "Desenvolvedores",
    startDate: new Date(2023, 5, 15),
    endDate: new Date(2023, 6, 15),
    budget: 1200,
    spent: 850,
    clicks: 1240,
    conversions: 68,
  },
  {
    id: "camp-002",
    name: "Promoção Black Friday",
    status: "scheduled",
    type: "social",
    audience: "Todos",
    startDate: new Date(2023, 10, 20),
    endDate: new Date(2023, 10, 27),
    budget: 3000,
    spent: 0,
    clicks: 0,
    conversions: 0,
  },
  {
    id: "camp-003",
    name: "Webinar Python para Iniciantes",
    status: "active",
    type: "webinar",
    audience: "Estudantes",
    startDate: new Date(2023, 4, 10),
    endDate: new Date(2023, 7, 10),
    budget: 800,
    spent: 650,
    clicks: 980,
    conversions: 45,
  },
  {
    id: "camp-004",
    name: "Remarketing - Carrinho Abandonado",
    status: "active",
    type: "ads",
    audience: "Clientes",
    startDate: new Date(2023, 3, 1),
    endDate: new Date(2023, 8, 30),
    budget: 1500,
    spent: 1200,
    clicks: 2100,
    conversions: 95,
  },
  {
    id: "camp-005",
    name: "Newsletter Mensal",
    status: "completed",
    type: "email",
    audience: "Assinantes",
    startDate: new Date(2023, 4, 1),
    endDate: new Date(2023, 4, 7),
    budget: 300,
    spent: 300,
    clicks: 540,
    conversions: 32,
  },
  {
    id: "camp-006",
    name: "Campanha Instagram",
    status: "paused",
    type: "social",
    audience: "Jovens",
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2023, 6, 1),
    budget: 900,
    spent: 450,
    clicks: 780,
    conversions: 28,
  },
]

export function CampaignsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  const filteredCampaigns = mockCampaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter
    const matchesType = typeFilter === "all" || campaign.type === typeFilter
    return matchesSearch && matchesStatus && matchesType
  })

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-500"
      case "paused":
        return "bg-yellow-500"
      case "scheduled":
        return "bg-blue-500"
      case "completed":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      active: "Ativa",
      paused: "Pausada",
      scheduled: "Agendada",
      completed: "Concluída"
    }
    return labels[status] || status
  }

  const getTypeLabel = (type) => {
    const labels = {
      email: "Email",
      social: "Redes Sociais",
      ads: "Anúncios",
      webinar: "Webinar"
    }
    return labels[type] || type
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Campanhas de Marketing</CardTitle>
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Nova Campanha
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar campanhas..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativas</SelectItem>
              <SelectItem value="paused">Pausadas</SelectItem>
              <SelectItem value="scheduled">Agendadas</SelectItem>
              <SelectItem value="completed">Concluídas</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="social">Redes Sociais</SelectItem>
              <SelectItem value="ads">Anúncios</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campanha</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Público</TableHead>
                <TableHead>Período</TableHead>
                <TableHead className="text-right">Orçamento</TableHead>
                <TableHead className="text-right">Conversões</TableHead>
                <TableHead className="w-10"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCampaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell className="font-medium">{campaign.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${getStatusColor(campaign.status)} text-white`}>
                      {getStatusLabel(campaign.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>{getTypeLabel(campaign.type)}</TableCell>
                  <TableCell>{campaign.audience}</TableCell>
                  <TableCell className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs">
                      {formatDistanceToNow(campaign.startDate, { addSuffix: true, locale: ptBR })}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col">
                      <span>R$ {campaign.spent}/{campaign.budget}</span>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div 
                          className="bg-primary h-1.5 rounded-full" 
                          style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <TrendingUp className="h-3 w-3 text-green-500" />
                      <span>{campaign.conversions}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filteredCampaigns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    Nenhuma campanha encontrada
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
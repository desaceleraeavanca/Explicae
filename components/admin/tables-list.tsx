"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, Table as TableIcon, Eye, Download, Filter } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Dados mockados para desenvolvimento
const MOCK_TABLES = [
  {
    name: "profiles",
    rows: 342,
    size: "4.2 MB",
    lastUpdated: "2023-11-15T14:20:12Z",
    type: "user",
    hasRLS: true
  },
  {
    name: "analogies",
    rows: 1256,
    size: "18.7 MB",
    lastUpdated: "2023-11-15T14:23:45Z",
    type: "content",
    hasRLS: true
  },
  {
    name: "generations",
    rows: 3421,
    size: "42.5 MB",
    lastUpdated: "2023-11-15T14:10:05Z",
    type: "content",
    hasRLS: true
  },
  {
    name: "audit_logs",
    rows: 2187,
    size: "28.3 MB",
    lastUpdated: "2023-11-14T22:45:18Z",
    type: "system",
    hasRLS: true
  },
  {
    name: "support_tickets",
    rows: 156,
    size: "1.8 MB",
    lastUpdated: "2023-11-15T14:15:30Z",
    type: "support",
    hasRLS: true
  },
  {
    name: "feedback",
    rows: 89,
    size: "0.9 MB",
    lastUpdated: "2023-11-14T18:32:10Z",
    type: "support",
    hasRLS: true
  },
  {
    name: "system_settings",
    rows: 12,
    size: "0.1 MB",
    lastUpdated: "2023-11-10T09:15:22Z",
    type: "system",
    hasRLS: true
  },
  {
    name: "badges",
    rows: 24,
    size: "0.3 MB",
    lastUpdated: "2023-10-05T11:42:30Z",
    type: "content",
    hasRLS: false
  },
  {
    name: "user_stats",
    rows: 342,
    size: "3.6 MB",
    lastUpdated: "2023-11-15T14:05:12Z",
    type: "user",
    hasRLS: true
  },
  {
    name: "audiences",
    rows: 45,
    size: "0.5 MB",
    lastUpdated: "2023-11-12T16:28:45Z",
    type: "content",
    hasRLS: true
  }
]

export function TablesList() {
  const [tables, setTables] = useState(MOCK_TABLES)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  
  // Filtrar tabelas com base na pesquisa e no tipo
  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === "all" || table.type === typeFilter
    return matchesSearch && matchesType
  })

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Obter cor do badge com base no tipo da tabela
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "user":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200"
      case "content":
        return "bg-green-100 text-green-800 hover:bg-green-200"
      case "system":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200"
      case "support":
        return "bg-amber-100 text-amber-800 hover:bg-amber-200"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200"
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Tabelas do Banco de Dados</h2>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Exportar Esquema
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tabelas..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <div className="flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filtrar por tipo" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="user">Usuários</SelectItem>
            <SelectItem value="content">Conteúdo</SelectItem>
            <SelectItem value="system">Sistema</SelectItem>
            <SelectItem value="support">Suporte</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome da Tabela</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Registros</TableHead>
                <TableHead className="text-right">Tamanho</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>RLS</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTables.map((table) => (
                <TableRow key={table.name}>
                  <TableCell>
                    <div className="flex items-center">
                      <TableIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="font-medium">{table.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeBadge(table.type)}>
                      {table.type === "user" && "Usuários"}
                      {table.type === "content" && "Conteúdo"}
                      {table.type === "system" && "Sistema"}
                      {table.type === "support" && "Suporte"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{table.rows.toLocaleString('pt-BR')}</TableCell>
                  <TableCell className="text-right">{table.size}</TableCell>
                  <TableCell>{formatDate(table.lastUpdated)}</TableCell>
                  <TableCell>
                    {table.hasRLS ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800">Ativo</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-100 text-red-800">Inativo</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
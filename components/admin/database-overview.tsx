"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Database, Table, Users, FileText, Clock, AlertCircle } from "lucide-react"

// Dados mockados para desenvolvimento
const MOCK_DATABASE_STATS = {
  totalTables: 12,
  totalRows: 8743,
  totalUsers: 342,
  totalAnalogies: 1256,
  lastBackup: "2023-11-15T08:30:00Z",
  databaseSize: "256.4 MB",
  tablesWithMostRows: [
    { name: "analogies", rows: 1256 },
    { name: "generations", rows: 3421 },
    { name: "profiles", rows: 342 },
    { name: "audit_logs", rows: 2187 }
  ],
  recentActivity: [
    { action: "INSERT", table: "analogies", timestamp: "2023-11-15T14:23:45Z" },
    { action: "UPDATE", table: "profiles", timestamp: "2023-11-15T14:20:12Z" },
    { action: "DELETE", table: "support_tickets", timestamp: "2023-11-15T14:15:30Z" },
    { action: "INSERT", table: "generations", timestamp: "2023-11-15T14:10:05Z" }
  ]
}

export function DatabaseOverview() {
  const [stats, setStats] = useState(MOCK_DATABASE_STATS)
  const [loading, setLoading] = useState(false)

  // Função para carregar dados reais do banco (desativada por enquanto)
  // const loadDatabaseStats = async () => {
  //   setLoading(true)
  //   try {
  //     const supabase = createClient()
  //     // Implementar chamadas reais ao banco de dados aqui
  //     // setStats(data)
  //   } catch (error) {
  //     console.error("Erro ao carregar estatísticas do banco:", error)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  // useEffect(() => {
  //   loadDatabaseStats()
  // }, [])

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

  // Calcular tempo desde o último backup
  const getTimeSinceLastBackup = () => {
    const lastBackup = new Date(stats.lastBackup)
    const now = new Date()
    const diffMs = now.getTime() - lastBackup.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays > 0) {
      return `${diffDays} dia${diffDays > 1 ? 's' : ''}`
    }
    
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    return `${diffHours} hora${diffHours > 1 ? 's' : ''}`
  }

  const metrics = [
    {
      title: "Total de Tabelas",
      value: stats.totalTables,
      icon: Table,
      description: "Tabelas no banco de dados"
    },
    {
      title: "Total de Registros",
      value: stats.totalRows.toLocaleString('pt-BR'),
      icon: FileText,
      description: "Registros em todas as tabelas"
    },
    {
      title: "Usuários",
      value: stats.totalUsers.toLocaleString('pt-BR'),
      icon: Users,
      description: "Contas registradas"
    },
    {
      title: "Analogias",
      value: stats.totalAnalogies.toLocaleString('pt-BR'),
      icon: Database,
      description: "Analogias criadas"
    },
    {
      title: "Último Backup",
      value: getTimeSinceLastBackup(),
      icon: Clock,
      description: formatDate(stats.lastBackup)
    },
    {
      title: "Tamanho do Banco",
      value: stats.databaseSize,
      icon: Database,
      description: "Espaço em disco utilizado"
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Visão Geral do Banco de Dados</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                <p className="text-2xl font-bold mt-1">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
              </div>
              <metric.icon className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Tabelas com Mais Registros</h3>
            <Database className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {stats.tablesWithMostRows.map((table, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <Table className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="font-medium">{table.name}</span>
                </div>
                <span className="text-muted-foreground">{table.rows.toLocaleString('pt-BR')} registros</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Atividade Recente</h3>
            <Clock className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {stats.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full mr-2 text-xs ${
                    activity.action === "INSERT" ? "bg-green-100 text-green-800" :
                    activity.action === "UPDATE" ? "bg-blue-100 text-blue-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    {activity.action.charAt(0)}
                  </span>
                  <span className="font-medium">{activity.table}</span>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MoreVertical, Eye, Trash2, Flag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const analogies = [
  {
    id: 1,
    concept: "Blockchain",
    analogy: "É como um livro de registros compartilhado...",
    user: "Maria Silva",
    clarity: 92,
    audience: "Iniciantes",
    created: "2024-10-15",
    status: "approved",
  },
  {
    id: 2,
    concept: "Machine Learning",
    analogy: "É como ensinar uma criança a reconhecer animais...",
    user: "João Santos",
    clarity: 88,
    audience: "Profissionais",
    created: "2024-10-14",
    status: "approved",
  },
  {
    id: 3,
    concept: "API",
    analogy: "É como um garçom em um restaurante...",
    user: "Ana Costa",
    clarity: 95,
    audience: "Iniciantes",
    created: "2024-10-13",
    status: "pending",
  },
  {
    id: 4,
    concept: "Cloud Computing",
    analogy: "É como alugar um apartamento ao invés de comprar...",
    user: "Pedro Lima",
    clarity: 78,
    audience: "Executivos",
    created: "2024-10-12",
    status: "flagged",
  },
]

export function AdminAnalogiesTable() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredAnalogies = analogies.filter(
    (analogy) =>
      analogy.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      analogy.user.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Card className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar analogias por conceito ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">Filtros</Button>
        <Button>Exportar</Button>
      </div>

      <div className="space-y-4">
        {filteredAnalogies.map((analogy) => (
          <Card key={analogy.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{analogy.concept}</h3>
                  <Badge
                    variant={
                      analogy.status === "approved"
                        ? "default"
                        : analogy.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {analogy.status === "approved"
                      ? "Aprovada"
                      : analogy.status === "pending"
                        ? "Pendente"
                        : "Reportada"}
                  </Badge>
                  <Badge variant="outline">{analogy.audience}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{analogy.analogy}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    Por: <span className="font-medium">{analogy.user}</span>
                  </span>
                  <span>•</span>
                  <span>
                    Clareza: <span className="font-medium text-primary">{analogy.clarity}%</span>
                  </span>
                  <span>•</span>
                  <span>{new Date(analogy.created).toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Completa
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Flag className="w-4 h-4 mr-2" />
                    Marcar para Revisão
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Mostrando {filteredAnalogies.length} de {analogies.length} analogias
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Anterior
          </Button>
          <Button variant="outline" size="sm">
            Próxima
          </Button>
        </div>
      </div>
    </Card>
  )
}

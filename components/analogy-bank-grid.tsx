"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Star, MoreVertical, Copy, Edit, Trash2, ExternalLink, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const mockAnalogies = [
  {
    id: 1,
    concept: "Inteligência Artificial",
    analogy:
      "É como ter um assistente que aprende com cada tarefa que você ensina. No começo, ele comete erros, mas quanto mais você o treina, mais inteligente ele fica.",
    audience: "Executivos",
    clarity: 92,
    date: "2024-01-15",
    isFavorite: true,
    tags: ["IA", "Machine Learning"],
  },
  {
    id: 2,
    concept: "Blockchain",
    analogy:
      "É como um livro de registros compartilhado onde todos têm uma cópia e ninguém pode apagar páginas antigas. Cada nova página é conectada à anterior com um selo especial.",
    audience: "Iniciantes",
    clarity: 88,
    date: "2024-01-14",
    isFavorite: false,
    tags: ["Blockchain", "Criptografia"],
  },
  {
    id: 3,
    concept: "API REST",
    analogy:
      "É como um garçom em um restaurante: você faz o pedido (requisição), ele leva para a cozinha (servidor) e traz sua comida (resposta).",
    audience: "Não-técnicos",
    clarity: 95,
    date: "2024-01-13",
    isFavorite: true,
    tags: ["API", "Web"],
  },
  {
    id: 4,
    concept: "Cloud Computing",
    analogy:
      "É como alugar um apartamento ao invés de comprar uma casa - você usa quando precisa, paga pelo que usa, e não precisa se preocupar com manutenção.",
    audience: "Empresários",
    clarity: 90,
    date: "2024-01-12",
    isFavorite: false,
    tags: ["Cloud", "Infraestrutura"],
  },
  {
    id: 5,
    concept: "DevOps",
    analogy:
      "É como uma linha de produção onde desenvolvedores e operações trabalham juntos, sem muros entre eles, para entregar produtos mais rápido.",
    audience: "Técnicos",
    clarity: 85,
    date: "2024-01-11",
    isFavorite: true,
    tags: ["DevOps", "Metodologia"],
  },
  {
    id: 6,
    concept: "Microserviços",
    analogy:
      "É como ter vários restaurantes especializados ao invés de um grande buffet. Cada um faz uma coisa muito bem e pode funcionar independentemente.",
    audience: "Desenvolvedores",
    clarity: 87,
    date: "2024-01-10",
    isFavorite: false,
    tags: ["Arquitetura", "Backend"],
  },
]

export function AnalogyBankGrid() {
  const [analogies, setAnalogies] = useState(mockAnalogies)

  const toggleFavorite = (id: number) => {
    setAnalogies(analogies.map((a) => (a.id === id ? { ...a, isFavorite: !a.isFavorite } : a)))
  }

  const handleCopy = (analogy: string) => {
    navigator.clipboard.writeText(analogy)
    alert("Analogia copiada!")
  }

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta analogia?")) {
      setAnalogies(analogies.filter((a) => a.id !== id))
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {analogies.map((analogy) => (
        <Card key={analogy.id} className="group hover:border-primary/50 transition-colors">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1 line-clamp-1">{analogy.concept}</h3>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {new Date(analogy.date).toLocaleDateString("pt-BR")}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleFavorite(analogy.id)}>
                  <Star
                    className={cn(
                      "w-4 h-4",
                      analogy.isFavorite ? "fill-secondary text-secondary" : "text-muted-foreground",
                    )}
                  />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Ver Detalhes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopy(analogy.analogy)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(analogy.id)}>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 leading-relaxed">{analogy.analogy}</p>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {analogy.audience}
                </Badge>
                <span className="text-xs font-medium text-secondary">{analogy.clarity}% clareza</span>
              </div>

              <div className="flex flex-wrap gap-1">
                {analogy.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

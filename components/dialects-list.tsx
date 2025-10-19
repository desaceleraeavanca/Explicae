"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Users, MoreVertical, Edit, Trash2, Copy, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

const mockDialects = [
  {
    id: 1,
    name: "Executivos C-Level",
    description: "Líderes empresariais focados em ROI e impacto nos negócios",
    characteristics: [
      "Foco em resultados de negócio",
      "Linguagem estratégica",
      "Exemplos corporativos",
      "Métricas e KPIs",
    ],
    exampleTopics: ["Transformação digital", "Eficiência operacional", "Vantagem competitiva"],
    usageCount: 45,
    isDefault: false,
    isActive: true,
  },
  {
    id: 2,
    name: "Iniciantes em Tecnologia",
    description: "Pessoas sem conhecimento técnico prévio",
    characteristics: [
      "Linguagem simples e clara",
      "Analogias do dia a dia",
      "Evitar jargões técnicos",
      "Exemplos práticos",
    ],
    exampleTopics: ["Internet", "Aplicativos", "Segurança online"],
    usageCount: 89,
    isDefault: true,
    isActive: true,
  },
  {
    id: 3,
    name: "Desenvolvedores Junior",
    description: "Programadores em início de carreira",
    characteristics: [
      "Conceitos de programação básicos",
      "Analogias com código",
      "Foco em aprendizado",
      "Exemplos práticos de código",
    ],
    exampleTopics: ["Arquitetura de software", "Design patterns", "Boas práticas"],
    usageCount: 34,
    isDefault: false,
    isActive: true,
  },
  {
    id: 4,
    name: "Estudantes Universitários",
    description: "Alunos de graduação em áreas diversas",
    characteristics: [
      "Linguagem acadêmica moderada",
      "Exemplos educacionais",
      "Conexão com teoria",
      "Aplicações práticas",
    ],
    exampleTopics: ["Conceitos teóricos", "Aplicações práticas", "Pesquisa"],
    usageCount: 67,
    isDefault: false,
    isActive: true,
  },
  {
    id: 5,
    name: "Equipe de Vendas",
    description: "Profissionais focados em relacionamento com clientes",
    characteristics: ["Foco em benefícios", "Linguagem persuasiva", "Casos de uso práticos", "Valor para o cliente"],
    exampleTopics: ["Recursos do produto", "Diferenciais", "Casos de sucesso"],
    usageCount: 23,
    isDefault: false,
    isActive: false,
  },
]

export function DialectsList() {
  const [dialects, setDialects] = useState(mockDialects)

  const toggleActive = (id: number) => {
    setDialects(dialects.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)))
  }

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este dialeto?")) {
      setDialects(dialects.filter((d) => d.id !== id))
    }
  }

  const handleDuplicate = (id: number) => {
    const dialect = dialects.find((d) => d.id === id)
    if (dialect) {
      const newDialect = {
        ...dialect,
        id: Math.max(...dialects.map((d) => d.id)) + 1,
        name: `${dialect.name} (Cópia)`,
        isDefault: false,
      }
      setDialects([...dialects, newDialect])
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {dialects.map((dialect) => (
        <Card key={dialect.id} className={cn("relative", !dialect.isActive && "opacity-60")}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-foreground truncate">{dialect.name}</h3>
                    {dialect.isDefault && (
                      <Badge variant="secondary" className="text-xs">
                        Padrão
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{dialect.description}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicate(dialect.id)}>
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toggleActive(dialect.id)}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    {dialect.isActive ? "Desativar" : "Ativar"}
                  </DropdownMenuItem>
                  {!dialect.isDefault && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(dialect.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Características</h4>
              <div className="flex flex-wrap gap-1.5">
                {dialect.characteristics.map((char, index) => (
                  <span key={index} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                    {char}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">Tópicos Exemplo</h4>
              <div className="flex flex-wrap gap-1.5">
                {dialect.exampleTopics.map((topic, index) => (
                  <span key={index} className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Usado {dialect.usageCount} vezes</span>
              <Badge variant={dialect.isActive ? "default" : "secondary"} className="text-xs">
                {dialect.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

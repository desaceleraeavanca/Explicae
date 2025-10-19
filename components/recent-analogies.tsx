import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Star, ExternalLink } from "lucide-react"

const recentAnalogies = [
  {
    id: 1,
    concept: "Inteligência Artificial",
    analogy: "É como ter um assistente que aprende com cada tarefa que você ensina...",
    audience: "Executivos",
    clarity: 92,
    date: "Há 2 horas",
    isFavorite: true,
  },
  {
    id: 2,
    concept: "Criptografia",
    analogy: "É como enviar uma carta em um cofre onde só o destinatário tem a chave...",
    audience: "Estudantes",
    clarity: 88,
    date: "Ontem",
    isFavorite: false,
  },
  {
    id: 3,
    concept: "DevOps",
    analogy: "É como uma linha de produção onde desenvolvedores e operações trabalham juntos...",
    audience: "Técnicos",
    clarity: 85,
    date: "Há 3 dias",
    isFavorite: true,
  },
]

export function RecentAnalogies() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Analogias Recentes</CardTitle>
          <Button variant="ghost" size="sm">
            Ver todas
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentAnalogies.map((analogy) => (
          <div
            key={analogy.id}
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground">{analogy.concept}</h4>
                  {analogy.isFavorite && <Star className="w-4 h-4 fill-secondary text-secondary" />}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{analogy.analogy}</p>
              </div>
              <Button variant="ghost" size="icon" className="ml-2">
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Badge variant="secondary" className="text-xs">
                {analogy.audience}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {analogy.date}
              </span>
              <span className="text-xs font-medium text-secondary">{analogy.clarity}% clareza</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

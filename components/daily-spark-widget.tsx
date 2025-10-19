"use client"

import { cn } from "@/lib/utils"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, RefreshCw } from "lucide-react"
import { useState } from "react"

const sparks = [
  {
    concept: "Blockchain",
    analogy:
      "É como um livro de registros compartilhado onde todos têm uma cópia e ninguém pode apagar páginas antigas.",
    audience: "Iniciantes em tecnologia",
  },
  {
    concept: "Machine Learning",
    analogy: "É como ensinar uma criança a reconhecer frutas mostrando muitos exemplos, até que ela aprenda sozinha.",
    audience: "Público geral",
  },
  {
    concept: "API",
    analogy: "É como um garçom em um restaurante: você faz o pedido, ele leva para a cozinha e traz sua comida.",
    audience: "Não-técnicos",
  },
  {
    concept: "Cloud Computing",
    analogy: "É como alugar um apartamento ao invés de comprar uma casa - você usa quando precisa e paga pelo que usa.",
    audience: "Empresários",
  },
]

export function DailySparkWidget() {
  const [currentSpark, setCurrentSpark] = useState(sparks[0])
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      const randomSpark = sparks[Math.floor(Math.random() * sparks.length)]
      setCurrentSpark(randomSpark)
      setIsRefreshing(false)
    }, 500)
  }

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Spark Diário</h3>
              <p className="text-sm text-muted-foreground">Inspiração para suas analogias</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="hover:bg-primary/10"
          >
            <RefreshCw className={cn("w-5 h-5", isRefreshing && "animate-spin")} />
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-primary uppercase tracking-wide">Conceito</span>
            <p className="text-xl font-bold text-foreground mt-1">{currentSpark.concept}</p>
          </div>

          <div>
            <span className="text-xs font-medium text-secondary uppercase tracking-wide">Analogia</span>
            <p className="text-base text-foreground/90 mt-1 leading-relaxed">{currentSpark.analogy}</p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span className="text-xs text-muted-foreground">Para:</span>
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-accent text-accent-foreground">
              {currentSpark.audience}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

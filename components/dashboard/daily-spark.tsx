"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Copy, RefreshCw, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Spark {
  id: string
  concept: string
  audience: string
  analogy_text: string
  spark_date: string
}

interface DailySparkProps {
  todaySpark: Spark | null
  recentSparks: Spark[]
}

export function DailySpark({ todaySpark: initialSpark, recentSparks }: DailySparkProps) {
  const [todaySpark, setTodaySpark] = useState<Spark | null>(initialSpark)
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateTodaySpark = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-daily-spark", {
        method: "POST",
      })

      if (!response.ok) throw new Error("Erro ao gerar faísca")

      const data = await response.json()
      setTodaySpark(data.spark)

      toast({
        title: "Faísca gerada",
        description: "A faísca criativa de hoje foi gerada com sucesso.",
      })
    } catch (error) {
      console.error("[v0] Error generating spark:", error)
      toast({
        title: "Erro ao gerar faísca",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copySpark = (spark: Spark) => {
    navigator.clipboard.writeText(spark.analogy_text)
    toast({
      title: "Copiado",
      description: "Faísca copiada para a área de transferência.",
    })
  }

  return (
    <div className="space-y-8">
      <Card className="border-2 border-accent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-accent" />
                Faísca de Hoje
              </CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString("pt-BR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </div>
            {!todaySpark && (
              <Button onClick={generateTodaySpark} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Faísca
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {todaySpark ? (
            <div className="space-y-4">
              <div>
                <Badge variant="secondary" className="mb-2">
                  Conceito
                </Badge>
                <h3 className="text-xl font-bold">{todaySpark.concept}</h3>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">
                  Público
                </Badge>
                <p className="text-muted-foreground">{todaySpark.audience}</p>
              </div>
              <div>
                <Badge variant="secondary" className="mb-2">
                  Analogia
                </Badge>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{todaySpark.analogy_text}</p>
              </div>
              <Button variant="outline" onClick={() => copySpark(todaySpark)}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Faísca
              </Button>
            </div>
          ) : (
            <div className="py-12 text-center">
              <Sparkles className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">A faísca de hoje ainda não foi gerada.</p>
              <Button onClick={generateTodaySpark} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Gerar Faísca de Hoje
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {recentSparks.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="h-6 w-6" />
            Faíscas Recentes
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {recentSparks.map((spark) => (
              <Card key={spark.id} className="hover:border-accent transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg">{spark.concept}</CardTitle>
                  <CardDescription>
                    {new Date(spark.spark_date).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Para: {spark.audience}</p>
                  </div>
                  <p className="text-sm leading-relaxed line-clamp-3">{spark.analogy_text}</p>
                  <Button variant="outline" size="sm" onClick={() => copySpark(spark)}>
                    <Copy className="mr-2 h-3 w-3" />
                    Copiar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

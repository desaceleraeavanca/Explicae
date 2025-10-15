"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, Lightbulb, AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AnalysisResult {
  score: number
  complexSections: {
    text: string
    reason: string
    suggestion: string
  }[]
  recommendations: string[]
}

export function ClarityAnalyzer() {
  const [text, setText] = useState("")
  const [targetAudience, setTargetAudience] = useState("")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const analyzeText = async () => {
    if (!text.trim()) {
      toast({
        title: "Texto vazio",
        description: "Digite um texto para analisar.",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setAnalysis(null)

    try {
      const response = await fetch("/api/analyze-clarity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetAudience }),
      })

      if (!response.ok) throw new Error("Erro ao analisar texto")

      const data = await response.json()
      setAnalysis(data.analysis)

      toast({
        title: "Análise concluída",
        description: "Confira as sugestões abaixo.",
      })
    } catch (error) {
      console.error("[v0] Error analyzing text:", error)
      toast({
        title: "Erro ao analisar",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente"
    if (score >= 60) return "Bom"
    if (score >= 40) return "Regular"
    return "Precisa melhorar"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analisar Texto</CardTitle>
          <CardDescription>Cole seu texto e descubra onde analogias podem ajudar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Texto para Análise</Label>
            <Textarea
              id="text"
              placeholder="Cole aqui o texto que você quer analisar..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px]"
              disabled={isAnalyzing}
            />
            <p className="text-xs text-muted-foreground">{text.length} caracteres</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Público-Alvo (opcional)</Label>
            <Textarea
              id="audience"
              placeholder="Para quem este texto é direcionado?"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="min-h-[80px]"
              disabled={isAnalyzing}
            />
          </div>

          <Button onClick={analyzeText} disabled={isAnalyzing} size="lg" className="w-full">
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Analisando texto...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" />
                Analisar Clareza
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="space-y-6">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Pontuação de Clareza</span>
                <Badge variant="secondary" className="text-2xl px-4 py-2">
                  <span className={getScoreColor(analysis.score)}>{analysis.score}/100</span>
                </Badge>
              </CardTitle>
              <CardDescription>{getScoreLabel(analysis.score)}</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis.score >= 80 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Seu texto está claro e bem estruturado! Ainda assim, analogias podem torná-lo mais memorável.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Seu texto tem alguns pontos que podem ser melhorados com analogias para maior clareza.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {analysis.complexSections.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-accent" />
                  Trechos que Precisam de Analogias
                </CardTitle>
                <CardDescription>
                  Identificamos {analysis.complexSections.length}{" "}
                  {analysis.complexSections.length === 1 ? "trecho" : "trechos"} que podem se beneficiar de analogias
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analysis.complexSections.map((section, index) => (
                  <Card key={index} className="border-l-4 border-l-accent">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Badge variant="secondary">{index + 1}</Badge>
                        Trecho Complexo
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium mb-1">Texto:</p>
                        <p className="text-sm text-muted-foreground italic bg-muted p-3 rounded">"{section.text}"</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1">Por que é complexo:</p>
                        <p className="text-sm text-muted-foreground">{section.reason}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-1 flex items-center gap-1">
                          <Lightbulb className="h-4 w-4 text-accent" />
                          Sugestão de analogia:
                        </p>
                        <p className="text-sm bg-accent/10 p-3 rounded">{section.suggestion}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          )}

          {analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recomendações Gerais</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {analysis.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-sm">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

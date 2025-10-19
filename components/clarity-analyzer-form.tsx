"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { BarChart3, AlertCircle, CheckCircle2, Lightbulb, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface AnalysisResult {
  overallScore: number
  metrics: {
    readability: number
    simplicity: number
    engagement: number
    structure: number
  }
  issues: Array<{
    type: "warning" | "success" | "info"
    message: string
  }>
  suggestions: string[]
  stats: {
    wordCount: number
    sentenceCount: number
    avgWordsPerSentence: number
    complexWords: number
  }
}

export function ClarityAnalyzerForm() {
  const [text, setText] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  const handleAnalyze = () => {
    setIsAnalyzing(true)
    // Simulate analysis
    setTimeout(() => {
      const words = text.split(/\s+/).filter((w) => w.length > 0)
      const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)

      setResult({
        overallScore: Math.floor(Math.random() * 20) + 75,
        metrics: {
          readability: Math.floor(Math.random() * 20) + 75,
          simplicity: Math.floor(Math.random() * 20) + 70,
          engagement: Math.floor(Math.random() * 20) + 80,
          structure: Math.floor(Math.random() * 20) + 85,
        },
        issues: [
          {
            type: "warning",
            message: "Algumas frases são muito longas (mais de 25 palavras)",
          },
          {
            type: "success",
            message: "Boa variedade de comprimento de frases",
          },
          {
            type: "info",
            message: "Considere adicionar mais exemplos práticos",
          },
        ],
        suggestions: [
          "Divida frases longas em sentenças menores para melhorar a compreensão",
          "Use mais analogias do dia a dia para tornar conceitos abstratos mais concretos",
          "Adicione transições entre parágrafos para melhorar o fluxo",
          "Considere usar listas ou bullet points para informações sequenciais",
        ],
        stats: {
          wordCount: words.length,
          sentenceCount: sentences.length,
          avgWordsPerSentence: Math.round(words.length / Math.max(sentences.length, 1)),
          complexWords: Math.floor(words.length * 0.15),
        },
      })
      setIsAnalyzing(false)
    }, 1500)
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-secondary"
    if (score >= 60) return "text-primary"
    return "text-destructive"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excelente"
    if (score >= 60) return "Bom"
    return "Precisa Melhorar"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Analisar Texto
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text">Cole seu texto aqui</Label>
            <Textarea
              id="text"
              placeholder="Cole o texto que você quer analisar para clareza e compreensibilidade..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-48 resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {text.split(/\s+/).filter((w) => w.length > 0).length} palavras
            </p>
          </div>

          <Button onClick={handleAnalyze} disabled={!text.trim() || isAnalyzing} className="w-full" size="lg">
            {isAnalyzing ? "Analisando..." : "Analisar Clareza"}
          </Button>
        </CardContent>
      </Card>

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Pontuação Geral</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center">
                    <div className="text-center">
                      <div className={cn("text-3xl font-bold", getScoreColor(result.overallScore))}>
                        {result.overallScore}
                      </div>
                      <div className="text-xs text-muted-foreground">de 100</div>
                    </div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Legibilidade</span>
                      <span className="text-sm text-muted-foreground">{result.metrics.readability}%</span>
                    </div>
                    <Progress value={result.metrics.readability} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Simplicidade</span>
                      <span className="text-sm text-muted-foreground">{result.metrics.simplicity}%</span>
                    </div>
                    <Progress value={result.metrics.simplicity} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Engajamento</span>
                      <span className="text-sm text-muted-foreground">{result.metrics.engagement}%</span>
                    </div>
                    <Progress value={result.metrics.engagement} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Estrutura</span>
                      <span className="text-sm text-muted-foreground">{result.metrics.structure}%</span>
                    </div>
                    <Progress value={result.metrics.structure} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Texto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-2xl font-bold text-foreground">{result.stats.wordCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Palavras</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-2xl font-bold text-foreground">{result.stats.sentenceCount}</div>
                  <div className="text-xs text-muted-foreground mt-1">Sentenças</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-2xl font-bold text-foreground">{result.stats.avgWordsPerSentence}</div>
                  <div className="text-xs text-muted-foreground mt-1">Palavras/Sentença</div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="text-2xl font-bold text-foreground">{result.stats.complexWords}</div>
                  <div className="text-xs text-muted-foreground mt-1">Palavras Complexas</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Problemas Identificados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.issues.map((issue, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border">
                  {issue.type === "warning" && (
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  )}
                  {issue.type === "success" && <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />}
                  {issue.type === "info" && <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />}
                  <p className="text-sm text-foreground">{issue.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-secondary" />
                Sugestões de Melhoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {result.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Badge variant="secondary" className="mt-0.5 flex-shrink-0">
                      {index + 1}
                    </Badge>
                    <p className="text-sm text-foreground leading-relaxed">{suggestion}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

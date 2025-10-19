"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Wand2, Save, Copy, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const audiences = [
  { value: "iniciantes", label: "Iniciantes em Tecnologia" },
  { value: "geral", label: "Público Geral" },
  { value: "estudantes", label: "Estudantes" },
  { value: "executivos", label: "Executivos" },
  { value: "tecnicos", label: "Profissionais Técnicos" },
]

const tones = [
  { value: "casual", label: "Casual" },
  { value: "profissional", label: "Profissional" },
  { value: "educacional", label: "Educacional" },
  { value: "humoristico", label: "Humorístico" },
]

export function AnalogyGenerationForm() {
  const [concept, setConcept] = useState("")
  const [context, setContext] = useState("")
  const [audience, setAudience] = useState("")
  const [tone, setTone] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [analogies, setAnalogies] = useState<{ title: string; description: string }[]>([])
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleGenerate = async () => {
    if (!concept.trim() || !audience.trim()) {
      alert("Preencha o conceito e a audiência para gerar analogias.")
      return
    }
    setIsGenerating(true)
    setAnalogies([])
    setErrorMessage(null)
    try {
      const response = await fetch("/api/generate-analogies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, audience }),
      })
      const data = await response.json()
      if (!response.ok) {
        const message = data?.message || data?.error || "Erro ao gerar analogias"
        setErrorMessage(message)
        alert(message)
        return
      }
      const analogiesData = data.analogies || data.analogias || []
      const mapped = analogiesData.map((a: any, idx: number) => ({
        title: a.title || a.titulo || `Analogia ${idx + 1}`,
        description: a.description || a.descricao || a.text || "",
      }))
      setAnalogies(mapped)
    } catch (e: any) {
      const message = e?.message || "Erro inesperado. Tente novamente."
      setErrorMessage(message)
      alert(message)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const handleSave = () => {
    // Save to analogy bank
    alert("Analogia salva no banco!")
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    alert("Analogia copiada!")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="w-5 h-5 text-primary" />
          Criar Analogia
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="concept">Conceito a Explicar *</Label>
          <Textarea
            id="concept"
            placeholder="Ex: Machine Learning, Blockchain, Microserviços..."
            value={concept}
            onChange={(e) => setConcept(e.target.value)}
            className="min-h-20 resize-none"
          />
          <p className="text-xs text-muted-foreground">Digite o conceito que você quer explicar de forma simples</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">Contexto Adicional (Opcional)</Label>
          <Textarea
            id="context"
            placeholder="Adicione detalhes sobre o contexto, pontos específicos que quer destacar..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-24 resize-none"
          />
          <p className="text-xs text-muted-foreground">Quanto mais contexto, mais personalizada será a analogia</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="audience">Audiência *</Label>
            <Select value={audience} onValueChange={setAudience}>
              <SelectTrigger id="audience">
                <SelectValue placeholder="Selecione a audiência" />
              </SelectTrigger>
              <SelectContent>
                {audiences.map((aud) => (
                  <SelectItem key={aud.value} value={aud.value}>
                    {aud.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tone">Tom da Explicação</Label>
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger id="tone">
                <SelectValue placeholder="Selecione o tom" />
              </SelectTrigger>
              <SelectContent>
                {tones.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleGenerate} disabled={!concept || !audience || isGenerating} className="w-full" size="lg">
          {isGenerating ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Gerando analogias...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Gerar Analogias
            </>
          )}
        </Button>

        {analogies.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Suas 3 Analogias Criativas</h3>
            </div>

            <div className="space-y-4">
              {analogies.map((a, i) => (
                <div key={i} className="p-4 rounded-lg bg-muted/50 border border-border">
                  {a.title && <p className="font-semibold mb-2">{a.title}</p>}
                  <p className="text-foreground leading-relaxed">{a.description}</p>

                  <div className="flex gap-2 mt-3">
                    <Button onClick={handleRegenerate} variant="outline" className="flex-1 bg-transparent">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Regenerar
                    </Button>
                    <Button
                      onClick={() => handleCopy(`${a.title ? a.title + "\n\n" : ""}${a.description}`)}
                      variant="outline"
                      className="flex-1 bg-transparent"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>
                    <Button onClick={handleSave} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

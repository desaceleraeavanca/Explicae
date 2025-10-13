"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, Copy, RefreshCw, Save } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { UpgradePrompt } from "@/components/upgrade-prompt"

interface Analogy {
  title: string
  description: string
}

interface AudienceProfile {
  id: string
  name: string
  description: string
}

interface AnalogyCreatorProps {
  audiences: AudienceProfile[]
}

export function AnalogyCreator({ audiences }: AnalogyCreatorProps) {
  const [concept, setConcept] = useState("")
  const [audience, setAudience] = useState("")
  const [selectedAudienceId, setSelectedAudienceId] = useState<string>("")
  const [analogies, setAnalogies] = useState<Analogy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [category, setCategory] = useState("")
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState("")
  const [upgradeMessage, setUpgradeMessage] = useState("")
  const [usage, setUsage] = useState<any>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleAudienceSelect = (audienceId: string) => {
    setSelectedAudienceId(audienceId)
    const selected = audiences.find((a) => a.id === audienceId)
    if (selected) {
      setAudience(selected.description || selected.name)
    }
  }

  const generateAnalogies = async () => {
    if (!concept.trim() || !audience.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha o conceito e o público-alvo.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setAnalogies([])
    setShowUpgradePrompt(false)

    try {
      const response = await fetch("/api/generate-analogies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, audience }),
      })

      const data = await response.json()
      if (!response.ok) {
        if (response.status === 403 && data.error) {
          setUpgradeReason(data.error)
          setUpgradeMessage(data.message)
          setUsage(data.usage)
          setShowUpgradePrompt(true)

          toast({
            title: "Limite atingido",
            description: data.message,
            variant: "destructive",
          })
          return
        }
        throw new Error(data.error || "Erro ao gerar analogias")
      }

      setAnalogies(data.analogies)
      if (data.usage) {
        setUsage(data.usage)
      }

      toast({
        title: "Analogias geradas",
        description: "Confira as 3 analogias criativas abaixo.",
      })
    } catch (error) {
      console.error("Error generating analogies:", error)
      
      let errorMessage = "Tente novamente em alguns instantes."
      
      if (error instanceof Error) {
        if (error.message.includes("Not Found")) {
          errorMessage = "Serviço temporariamente indisponível. Tente novamente."
        } else if (error.message.includes("Rate limit")) {
          errorMessage = "Muitas requisições. Aguarde um momento e tente novamente."
        } else if (error.message.includes("Invalid API key")) {
          errorMessage = "Erro de configuração. Entre em contato com o suporte."
        } else if (error.message.includes("Network Error")) {
          errorMessage = "Erro de conexão. Verifique sua internet e tente novamente."
        }
      }
      
      toast({
        title: "Erro ao gerar analogias",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveAnalogy = async (analogy: Analogy) => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from("analogies").insert({
      user_id: user.id,
      concept,
      audience,
      analogy_text: `${analogy.title}\n\n${analogy.description}`,
      category: category || null,
    })

    if (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a analogia.",
        variant: "destructive",
      })
      return
    }

    // Update user stats
    await supabase.rpc("increment_analogy_count", { user_id_param: user.id })

    toast({
      title: "Analogia salva",
      description: "A analogia foi adicionada ao seu banco.",
    })
  }

  const copyAnalogy = (analogy: Analogy) => {
    const text = `${analogy.title}\n\n${analogy.description}`
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado",
      description: "Analogia copiada para a área de transferência.",
    })
  }

  return (
    <div className="space-y-8">
      {showUpgradePrompt && <UpgradePrompt reason={upgradeReason} message={upgradeMessage} usage={usage} />}

      <Card>
        <CardHeader>
          <CardTitle>Configuração</CardTitle>
          <CardDescription>Defina o conceito e o público-alvo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="concept">Conceito a Explicar</Label>
            <Input
              id="concept"
              placeholder="Ex: Blockchain, Inteligência Artificial, Fotossíntese..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {audiences.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="audience-select">Público-Alvo Salvo (opcional)</Label>
              <Select value={selectedAudienceId} onValueChange={handleAudienceSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um público salvo" />
                </SelectTrigger>
                <SelectContent>
                  {audiences.map((aud) => (
                    <SelectItem key={aud.id} value={aud.id}>
                      {aud.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="audience">Público-Alvo</Label>
            <Textarea
              id="audience"
              placeholder="Ex: Adolescentes de 15 anos, Idosos que não usam tecnologia, Investidores iniciantes..."
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria (opcional)</Label>
            <Input
              id="category"
              placeholder="Ex: Tecnologia, Ciência, Negócios..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <Button onClick={generateAnalogies} disabled={isLoading} size="lg" className="w-full">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Gerando analogias...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Analogias
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {analogies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Suas Analogias</h2>
          <div className="grid gap-4">
            {analogies.map((analogy, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold text-sm">
                      {index + 1}
                    </span>
                    <span>{analogy.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground leading-relaxed">{analogy.description}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => saveAnalogy(analogy)}>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyAnalogy(analogy)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

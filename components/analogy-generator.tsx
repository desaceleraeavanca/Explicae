"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Sparkles, Copy, Share2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { UpgradePrompt } from "@/components/upgrade-prompt"
import { useRouter } from "next/navigation"

interface Analogy {
  title: string
  description: string
}

interface UsageInfo {
  used: number
  limit: number
  remaining: number
}

export function AnalogyGenerator() {
  const [concept, setConcept] = useState("")
  const [audience, setAudience] = useState("")
  const [analogies, setAnalogies] = useState<Analogy[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [upgradeReason, setUpgradeReason] = useState("")
  const [upgradeMessage, setUpgradeMessage] = useState("")
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const generateAnalogies = async () => {
    if (!concept.trim() || !audience.trim()) {
      toast({
        title: "Ops! 🤔",
        description: "Preencha o conceito e o público-alvo para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setAnalogies([])
    setShowUpgradePrompt(false)

    try {
      console.log("[FRONTEND DEBUG] Iniciando requisição para /api/generate-analogies")
      console.log("[FRONTEND DEBUG] Dados enviados:", { concept, audience })
      
      const response = await fetch("/api/generate-analogies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, audience }),
      })

      console.log("[FRONTEND DEBUG] Response status:", response.status)
      console.log("[FRONTEND DEBUG] Response ok:", response.ok)

      let data
      try {
        data = await response.json()
        console.log("[FRONTEND DEBUG] Response data:", data)
      } catch (jsonError) {
        console.error("[FRONTEND DEBUG] Erro ao processar JSON da resposta:", jsonError)
        toast({
          title: "Erro de comunicação",
          description: "Não foi possível processar a resposta do servidor. Tente novamente.",
          variant: "destructive",
        })
        return
      }

      if (!response.ok) {
        console.log("[FRONTEND DEBUG] Response não ok, verificando erro...")
        if (response.status === 403 && data?.error) {
          setUpgradeReason(data.error)
          setUpgradeMessage(data.message || "")
          setUsage(data.usage || null)
          setShowUpgradePrompt(true)

          toast({
            title: "Limite atingido",
            description: data.message || "Você atingiu o limite de uso.",
            variant: "destructive",
          })
          return
        }
        throw new Error(data?.error || "Erro ao gerar analogias")
      }

      if (!data?.analogies || !Array.isArray(data.analogies)) {
        console.error("[FRONTEND DEBUG] Dados inválidos recebidos:", data)
        toast({
          title: "Erro de formato",
          description: "O servidor retornou dados em formato inválido. Tente novamente.",
          variant: "destructive",
        })
        return
      }

      console.log("[FRONTEND DEBUG] Analogias recebidas:", data.analogies)
      setAnalogies(data.analogies)
      if (data.usage) {
        setUsage(data.usage)
      }

      toast({
        title: "Analogias geradas! 🎉",
        description: "Confira as 3 analogias criativas abaixo.",
      })
    } catch (error) {
      console.error("[FRONTEND DEBUG] Error generating analogies:", error)
      console.error("[FRONTEND DEBUG] Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace'
      })
      
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

  const copyAnalogy = (analogy: Analogy) => {
    const text = `${analogy.title}\n\n${analogy.description}`
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado! 📋",
      description: "Analogia copiada para a área de transferência.",
    })
  }

  const shareAnalogy = async (analogy: Analogy) => {
    const text = `${analogy.title}\n\n${analogy.description}\n\nCriado com Explicaê 💡`

    if (navigator.share) {
      try {
        await navigator.share({ text })
      } catch (error) {
        console.error("[v0] Error sharing:", error)
      }
    } else {
      navigator.clipboard.writeText(text)
      toast({
        title: "Copiado! 📋",
        description: "Analogia copiada. Cole onde quiser compartilhar!",
      })
    }
  }

  return (
    <div className="space-y-8">
      {showUpgradePrompt && (
        <UpgradePrompt reason={upgradeReason} message={upgradeMessage} usage={usage || undefined} />
      )}

      {usage && !showUpgradePrompt && (
        <Card className="p-4 bg-muted/50">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Gerações restantes: <span className="font-semibold text-foreground">{usage.remaining}</span>
            </span>
            <Button variant="link" size="sm" onClick={() => router.push("/auth/signup")} className="h-auto p-0">
              Criar conta grátis
            </Button>
          </div>
        </Card>
      )}

      {/* Input Form */}
      <Card className="border-2 p-6 md:p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="concept" className="text-base font-semibold">
              Qual conceito você quer explicar?
            </Label>
            <Input
              id="concept"
              placeholder="Ex: Mudanças Climáticas, Física Quântica, Blockchain..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              className="text-base"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience" className="text-base font-semibold">
              Para quem você está explicando?
            </Label>
            <Textarea
              id="audience"
              placeholder="Ex: Tiktokers de 16 anos, Minha tia que ainda imprime e-mails, Uma pessoa que guarda dinheiro embaixo do colchão..."
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="min-h-[100px] text-base"
              disabled={isLoading}
            />
          </div>

          <Button onClick={generateAnalogies} disabled={isLoading} size="lg" className="w-full text-base font-semibold">
            {isLoading ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                Gerando analogias criativas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Gerar Analogias
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Results */}
      {analogies.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Suas 3 Analogias Criativas 🎯</h2>
          <div className="grid gap-4 md:gap-6">
            {analogies.map((analogy, index) => (
              <Card key={index} className="border-2 p-6 transition-all hover:border-primary hover:shadow-lg">
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground font-bold">
                        {index + 1}
                      </div>
                      <h3 className="text-xl font-bold leading-tight text-foreground">{analogy.title}</h3>
                    </div>
                  </div>
                  <p className="text-base leading-relaxed text-muted-foreground pl-11">{analogy.description}</p>
                  <div className="flex gap-2 pl-11">
                    <Button variant="outline" size="sm" onClick={() => copyAnalogy(analogy)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => shareAnalogy(analogy)}>
                      <Share2 className="mr-2 h-4 w-4" />
                      Compartilhar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

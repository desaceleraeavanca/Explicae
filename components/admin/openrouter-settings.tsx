"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Settings, Eye, EyeOff } from "lucide-react"

interface OpenRouterSettingsProps {
  userId: string
}

export function OpenRouterSettings({ userId }: OpenRouterSettingsProps) {
  const [loading, setLoading] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [config, setConfig] = useState({
    api_key: "",
    default_model: "openai/gpt-4o-mini",
    fallback_model: "meta-llama/llama-3.1-8b-instruct:free",
    fair_use_limit: 1000,
  })
  const { toast } = useToast()

  useEffect(() => {
    loadConfig()
  }, [])

  async function loadConfig() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "openrouter_config")
      .maybeSingle()

    if (!error && data) {
      setConfig((prev) => ({
        ...prev,
        ...(data.value as any),
      }))
    }
  }

  async function handleSave() {
    setLoading(true)
    const supabase = createClient()
    
    // Primeiro verificar se o registro já existe para obter o ID
    const { data: existingConfig } = await supabase
      .from("system_settings")
      .select("id")
      .eq("key", "openrouter_config")
      .maybeSingle()
    
    const { error } = await supabase.from("system_settings").upsert({
      id: existingConfig?.id,
      key: "openrouter_config",
      value: config,
      updated_by: userId,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível salvar as configurações",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso",
      })
    }

    setLoading(false)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-5 w-5" />
        <h2 className="text-xl font-bold">Configuração OpenRouter</h2>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>API Key do OpenRouter</Label>
          <div className="relative">
            <Input
              type={showApiKey ? "text" : "password"}
              value={config.api_key}
              onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
              placeholder="sk-or-v1-..."
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            Sua chave de API do OpenRouter. Obtenha em{" "}
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label>Modelo Padrão</Label>
          <Input
            value={config.default_model}
            onChange={(e) => setConfig({ ...config, default_model: e.target.value })}
            placeholder="openai/gpt-4o-mini"
          />
          <p className="text-sm text-muted-foreground">
            Modelo usado para gerações normais (ex: openai/gpt-4o-mini, anthropic/claude-3.5-sonnet)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Modelo Fallback (Gratuito)</Label>
          <Input
            value={config.fallback_model}
            onChange={(e) => setConfig({ ...config, fallback_model: e.target.value })}
            placeholder="meta-llama/llama-3.1-8b-instruct:free"
          />
          <p className="text-sm text-muted-foreground">
            Modelo gratuito usado quando usuário excede limite de uso justo (1000/mês)
          </p>
        </div>

        <div className="space-y-2">
          <Label>Limite de Uso Justo (gerações/mês)</Label>
          <Input
            type="number"
            value={config.fair_use_limit}
            onChange={(e) => setConfig({ ...config, fair_use_limit: Number.parseInt(e.target.value) || 1000 })}
            placeholder="1000"
          />
          <p className="text-sm text-muted-foreground">
            Após este limite, o sistema usa automaticamente o modelo fallback gratuito
          </p>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </Card>
  )
}

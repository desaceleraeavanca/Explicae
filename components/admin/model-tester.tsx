"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Play, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  AlertTriangle,
  Info
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface TestResult {
  success: boolean
  model: string
  response?: string
  error?: string
  duration: number
  timestamp: string
  prompt: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
    total_cost: number
  }
}

interface TestHistory extends TestResult {
  id: string
}

export function ModelTester() {
  const [model, setModel] = useState("openai/gpt-4o-mini")
  const [prompt, setPrompt] = useState("Explique o que é inteligência artificial em uma frase simples.")
  const [maxTokens, setMaxTokens] = useState(500)
  const [isLoading, setIsLoading] = useState(false)
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [testHistory, setTestHistory] = useState<TestResult[]>([])

  const handleTest = async () => {
    if (!model.trim() || !prompt.trim()) {
      return
    }

    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch('/api/admin/test-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model.trim(),
          prompt: prompt.trim(),
          maxTokens
        })
      })

      const result = await response.json()
      
      setTestResult(result)
      
      // Adicionar ao histórico
      setTestHistory(prev => [result, ...prev.slice(0, 4)]) // Manter apenas os 5 últimos
      
    } catch (error) {
      console.error('Erro ao testar modelo:', error)
      setTestResult({
        success: false,
        model: model,
        error: 'Erro de conexão com o servidor',
        duration: 0,
        timestamp: new Date().toISOString(),
        prompt: prompt
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('pt-BR')
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Teste de Modelos</h3>
          <p className="text-sm text-muted-foreground">
            Teste diferentes modelos da OpenRouter para verificar compatibilidade e performance.
          </p>
        </div>

        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="model">Modelo</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="Ex: openai/gpt-4o-mini, anthropic/claude-3-haiku, google/gemini-2.5-flash-lite"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use o formato: provedor/nome-do-modelo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt de Teste</Label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite um prompt para testar o modelo..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="maxTokens">Máximo de Tokens</Label>
            <Input
              id="maxTokens"
              type="number"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              min={50}
              max={2000}
              className="w-32"
            />
          </div>

          <Button 
            onClick={handleTest} 
            disabled={isLoading || !model.trim() || !prompt.trim()}
            className="w-fit"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Testar Modelo
              </>
            )}
          </Button>
        </div>

        {testResult && (
          <div className="space-y-4">
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                {testResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                Resultado do Teste
              </h4>

              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant={testResult.success ? "default" : "destructive"}>
                    {testResult.success ? "Sucesso" : "Erro"}
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {testResult.model}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDuration(testResult.duration)}
                  </Badge>
                </div>

                {testResult.success && testResult.response && (
                  <div className="space-y-2">
                    <Label>Resposta do Modelo:</Label>
                    <div className="p-3 bg-muted rounded-md text-sm">
                      {testResult.response}
                    </div>
                  </div>
                )}

                {testResult.success && testResult.usage && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-3 bg-blue-50 rounded border">
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Tokens Prompt</p>
                      <p className="font-semibold text-blue-700">{testResult.usage.prompt_tokens}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Tokens Resposta</p>
                      <p className="font-semibold text-blue-700">{testResult.usage.completion_tokens}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Total Tokens</p>
                      <p className="font-semibold text-blue-700">{testResult.usage.total_tokens}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-600">Custo Total</p>
                      <p className="font-semibold text-green-700">
                        ${testResult.usage.total_cost ? testResult.usage.total_cost.toFixed(8) : '0.00000000'}
                      </p>
                    </div>
                  </div>
                )}

                {!testResult.success && testResult.error && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Erro:</strong> {testResult.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="text-xs text-muted-foreground">
                  Testado em: {formatTimestamp(testResult.timestamp)}
                </div>
              </div>
            </div>
          </div>
        )}

        {testHistory.length > 0 && (
          <div className="space-y-4">
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Info className="w-4 h-4" />
                Histórico de Testes
              </h4>

              <div className="space-y-2">
                {testHistory.map((test, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {test.success ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            ✓ Sucesso
                          </Badge>
                        ) : (
                          <Badge variant="destructive">✗ Erro</Badge>
                        )}
                        <span className="text-sm font-medium">{test.model}</span>
                        <Badge variant="outline">{formatDuration(test.duration)}</Badge>
                        {test.usage && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">
                            ${test.usage.total_cost ? test.usage.total_cost.toFixed(8) : '0.00000000'}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(test.timestamp)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <strong>Prompt:</strong> {test.prompt.length > 100 ? `${test.prompt.substring(0, 100)}...` : test.prompt}
                    </div>
                    
                    {test.success && test.response && (
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Resposta:</strong> {test.response.length > 150 ? `${test.response.substring(0, 150)}...` : test.response}
                      </div>
                    )}
                    
                    {test.usage && (
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>Tokens: {test.usage.total_tokens}</span>
                        <span>Prompt: {test.usage.prompt_tokens}</span>
                        <span>Resposta: {test.usage.completion_tokens}</span>
                        <span className="text-green-600 font-medium">
                          Custo: ${test.usage.total_cost ? test.usage.total_cost.toFixed(8) : '0.00000000'}
                        </span>
                      </div>
                    )}
                    
                    {!test.success && test.error && (
                      <div className="text-sm text-red-600 mt-2">
                        <strong>Erro:</strong> {test.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
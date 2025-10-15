import { Card } from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

export function SystemHealth() {
  const healthChecks = [
    { name: "Banco de Dados", status: "ok", message: "Operacional" },
    { name: "API OpenRouter", status: "ok", message: "Operacional" },
    { name: "Autenticação Supabase", status: "ok", message: "Operacional" },
    { name: "Webhook Kiwify", status: "warning", message: "Não configurado" },
  ]

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Saúde do Sistema</h2>
      <div className="space-y-3">
        {healthChecks.map((check) => (
          <div key={check.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {check.status === "ok" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">{check.name}</p>
                <p className="text-sm text-muted-foreground">{check.message}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

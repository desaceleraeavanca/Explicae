import { createClient } from "@/lib/supabase/server"
import { Card } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export async function RecentActivity() {
  const supabase = await createClient()

  const { data: recentGenerations } = await supabase
    .from("generations")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Atividade Recente</h2>
      <div className="space-y-3">
        {recentGenerations?.map((gen: any) => (
          <div key={gen.id} className="p-3 bg-muted rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-sm">
                  {gen.profiles?.full_name || gen.profiles?.email || "Usuário anônimo"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Gerou analogia: <span className="font-medium">{gen.concept}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">Para: {gen.audience}</p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDistanceToNow(new Date(gen.created_at), {
                  addSuffix: true,
                  locale: ptBR,
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

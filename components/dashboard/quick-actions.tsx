"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Clock } from "lucide-react"
import Link from "next/link"

interface Analogy {
  id: string
  concept: string
  audience: string
  analogy_text: string
  created_at: string
}

interface QuickActionsProps {
  recentAnalogies: Analogy[]
}

export function QuickActions({ recentAnalogies }: QuickActionsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>Comece a criar ou explore suas analogias</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Link href="/dashboard/create">
            <Button size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Nova Analogia
            </Button>
          </Link>
          <Link href="/dashboard/analogies">
            <Button size="lg" variant="outline">
              Ver Todas as Analogias
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Analogias Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentAnalogies.length === 0 ? (
            <p className="text-sm text-muted-foreground">Você ainda não criou nenhuma analogia. Comece agora!</p>
          ) : (
            <div className="space-y-3">
              {recentAnalogies.map((analogy) => (
                <div key={analogy.id} className="border-l-4 border-accent pl-4 py-2">
                  <p className="font-semibold text-sm">{analogy.concept}</p>
                  <p className="text-xs text-muted-foreground">Para: {analogy.audience}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(analogy.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

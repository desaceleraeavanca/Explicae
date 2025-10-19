"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function DialectsHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">
          Gerencie perfis de audiência para gerar analogias mais personalizadas
        </p>
      </div>
      <Button className="gap-2">
        <Plus className="w-4 h-4" />
        Novo Dialeto
      </Button>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Sparkles } from "lucide-react"
import Link from "next/link"

interface UpgradePromptProps {
  reason: string
  message: string
  usage?: {
    used: number
    limit: number
  }
}

export function UpgradePrompt({ reason, message, usage }: UpgradePromptProps) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          <CardTitle>Limite Atingido</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {usage && (
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Analogias utilizadas:</span>
              <span className="font-semibold">
                {usage.used} / {usage.limit}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${(usage.used / usage.limit) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      )}
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href="/pricing">
            <Sparkles className="mr-2 h-4 w-4" />
            Ver Planos
          </Link>
        </Button>
        {reason === "anonymous_limit_reached" && (
          <Button asChild variant="outline" className="flex-1 bg-transparent">
            <Link href="/auth/signup">Criar Conta Grátis</Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

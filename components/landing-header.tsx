'use client'
import { Lightbulb, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LandingHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-[100] border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + texto no lado esquerdo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground leading-8">Explicaê</span>
        </div>

        {/* Opção discreta para entrar no lado direito */}
        <div className="flex items-center">
            <Button
              variant="ghost"
              className="rounded-full w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              asChild
            >
              <Link href="/login" aria-label="Entrar"><User className="w-5 h-5" /></Link>
          </Button>
        </div>

      </div>
    </header>
  )
}

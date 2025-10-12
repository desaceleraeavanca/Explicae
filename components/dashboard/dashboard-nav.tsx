"use client"

import { Lightbulb, Menu, User, LogOut, Crown } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function DashboardNav() {
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="rounded-lg bg-accent p-2">
              <Lightbulb className="h-5 w-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">Explicaê</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-medium hover:text-accent transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/analogies" className="text-sm font-medium hover:text-accent transition-colors">
              Minhas Analogias
            </Link>
            <Link href="/dashboard/audiences" className="text-sm font-medium hover:text-accent transition-colors">
              Públicos
            </Link>
            <Link href="/dashboard/badges" className="text-sm font-medium hover:text-accent transition-colors">
              Conquistas
            </Link>
            <Link href="/dashboard/spark" className="text-sm font-medium hover:text-accent transition-colors">
              Faísca Diária
            </Link>
            <Link href="/dashboard/analyzer" className="text-sm font-medium hover:text-accent transition-colors">
              Analisador
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="hidden md:flex bg-transparent">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Planos
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">Perfil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="md:hidden">
                  <Link href="/pricing">Planos</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analogies">Minhas Analogias</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/audiences">Públicos</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/badges">Conquistas</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/spark">Faísca Diária</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/analyzer">Analisador</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}

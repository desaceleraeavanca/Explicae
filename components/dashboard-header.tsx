'use client'

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Bell, Menu, Lightbulb, Shield } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

export function DashboardHeader() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [viewAsUser, setViewAsUser] = useState(false)

  useEffect(() => {
    const flag = typeof window !== "undefined" ? localStorage.getItem("viewAsUser") === "true" : false
    setViewAsUser(flag)

    const checkAdmin = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (profile?.role === "admin") {
          setIsAdmin(true)
        }
      }
    }

    checkAdmin()
  }, [])

  const showAdminButton = isAdmin && !viewAsUser

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/generate">Gerar Analogia</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/analogies">Banco de Analogias</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/dialects">Dialetos de Audiência</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/analyzer">Analisador de Clareza</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/support">Suporte</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Configurações</Link>
              </DropdownMenuItem>
              {showAdminButton && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Administrador</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Explicaê</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {showAdminButton && (
            <Button asChild variant="outline" size="sm" className="hidden md:flex bg-transparent">
              <Link href="/admin">
                <Shield className="mr-2 h-4 w-4" />
                Administrador
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" />
          </Button>
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary text-primary-foreground">U</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

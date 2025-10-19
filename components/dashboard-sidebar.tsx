"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Sparkles, BookOpen, Users, BarChart3, Settings, HelpCircle, Shield } from "lucide-react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Sparkles, label: "Gerar Analogia", href: "/dashboard/generate" },
  { icon: BookOpen, label: "Banco de Analogias", href: "/dashboard/analogies" },
  { icon: Users, label: "Dialetos de Audiência", href: "/dashboard/dialects" },
  { icon: BarChart3, label: "Analisador de Clareza", href: "/dashboard/analyzer" },
]

const bottomNavItems = [
  { icon: Settings, label: "Configurações", href: "/dashboard/settings" },
  { icon: HelpCircle, label: "Ajuda", href: "/dashboard/help" },
]

export function DashboardSidebar() {
  const pathname = usePathname()
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

  const showAdminButton = isAdmin

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-card">
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                isActive && "bg-primary text-primary-foreground",
              )}
              asChild
            >
              <a href={item.href}>
                <Icon className="w-5 h-5" />
                {item.label}
              </a>
            </Button>
          )
        })}
      </nav>

      <div className="p-4 space-y-1 border-t border-border">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent",
                pathname === item.href && "bg-primary text-primary-foreground",
              )}
              asChild
            >
              <a href={item.href}>
                <Icon className="w-5 h-5" />
                {item.label}
              </a>
            </Button>
          )
        })}

        {showAdminButton && (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
            asChild
          >
            <a href="/admin">
              <Shield className="w-5 h-5" />
              Administrador
            </a>
          </Button>
        )}
      </div>
    </aside>
  )
}

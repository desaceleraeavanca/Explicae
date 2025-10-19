"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Users, BookOpen, CreditCard, BarChart3, Settings, Shield, Wallet, Megaphone, LifeBuoy, Database } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

const navItems = [
  { icon: LayoutDashboard, label: "Visão Geral", href: "/admin" },
  { icon: Users, label: "Usuários", href: "/admin/users" },
  { icon: BookOpen, label: "Analogias", href: "/admin/analogies" },
  { icon: CreditCard, label: "Assinaturas", href: "/admin/subscriptions" },
  { icon: Wallet, label: "Faturamento", href: "/admin/billing" },
  { icon: BarChart3, label: "Relatórios", href: "/admin/analytics" },
  { icon: Megaphone, label: "Marketing", href: "/admin/marketing" },
  { icon: Database, label: "Dados", href: "/admin/data" },
  { icon: Shield, label: "Segurança", href: "/admin/security" },
  { icon: LifeBuoy, label: "Suporte", href: "/admin/support" },
  { icon: Settings, label: "Configurações", href: "/admin/settings" },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const handleSwitchToUser = () => {
    try {
      localStorage.setItem("viewAsUser", "true")
    } catch (e) {}
    router.push("/dashboard")
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-16 bottom-0 w-64 border-r border-border bg-card">
      {/* removido banner do topo */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent",
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

      {/* banner no rodapé */}
      <div className="p-4 border-t border-border">
        <button
          onClick={handleSwitchToUser}
          className="flex items-center gap-2 w-full text-left px-3 py-2 bg-destructive/10 rounded-lg hover:bg-destructive/15"
          title="Alternar para modo usuário comum"
        >
          <Shield className="w-4 h-4 text-destructive" />
          <span className="text-sm font-medium text-destructive">Administrador</span>
        </button>
      </div>
    </aside>
  )
}

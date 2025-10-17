"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  Users,
  DollarSign,
  BarChart3,
  MessageSquare,
  Shield,
  Database,
  TrendingUp,
  Settings,
  Sparkles,
} from "lucide-react"

const navItems = [
  { href: "/admin", label: "Visão Geral", icon: LayoutDashboard },
  { href: "/admin/users", label: "Usuários", icon: Users },
  { href: "/admin/billing", label: "Faturamento", icon: DollarSign },
  { href: "/admin/analytics", label: "Métricas", icon: BarChart3 },
  { href: "/admin/support", label: "Suporte", icon: MessageSquare },
  { href: "/admin/security", label: "Segurança", icon: Shield },
  { href: "/admin/data", label: "Dados", icon: Database },
  { href: "/admin/marketing", label: "Marketing", icon: TrendingUp },
  { href: "/admin/settings", label: "Configurações", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <Link href="/admin" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>Explicaê Admin</span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Voltar ao App
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-1 overflow-x-auto pb-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button variant={isActive ? "default" : "ghost"} size="sm" className="gap-2 whitespace-nowrap">
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

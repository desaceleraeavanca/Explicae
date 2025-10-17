"use client"

import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <DashboardNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
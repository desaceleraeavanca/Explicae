"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wrench, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { allArticles } from "@/lib/help-articles";

export default function TroubleshootingPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ajuda", href: "/help" }, { label: "Solução de Problemas" }]} />
      </div>

      {/* Header */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm text-muted-foreground mb-3 bg-background">
            <Wrench className="w-4 h-4" />
            <span>Solução de Problemas</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Resolva erros e dúvidas rapidamente</h1>
          <p className="mt-2 text-muted-foreground leading-relaxed">
            Orientações objetivas para desbloquear seu fluxo de trabalho.
          </p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="grid gap-6 md:grid-cols-2">
        {articles.map((a) => (
          <Link key={a.slug} href={`/help/articles/${a.slug}`} className="group" aria-label={`Abrir: ${a.title}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {a.icon && <a.icon className="w-5 h-5" />}
                  {a.title}
                </CardTitle>
                <CardDescription>{a.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="transition-transform hover:translate-y-px">Ver solução</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

const articles = allArticles.filter((a) => a.category === "troubleshooting");
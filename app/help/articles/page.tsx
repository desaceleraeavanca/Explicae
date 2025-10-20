"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { allArticles } from "@/lib/help-articles";
import { HelpSupportCTA } from "@/components/help-support-cta";

export default function ArticlesIndexPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allArticles;
    return allArticles.filter(
      (a) => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="container mx-auto max-w-5xl py-10 px-4">
      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ajuda", href: "/help" }, { label: "Artigos" }]} />
      </div>

      {/* Header */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Artigos da Central de Ajuda</h1>
          <p className="mt-2 text-muted-foreground leading-relaxed">Explore guias e soluções organizadas para acelerar sua jornada.</p>

          {/* Busca */}
          <div className="mt-6">
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por título ou descrição"
                className="pl-9"
                aria-label="Buscar artigos"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Listagem */}
      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((a) => (
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
                <Button variant="outline" className="transition-transform hover:translate-y-px">Ler artigo</Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center text-muted-foreground mt-6">Nenhum artigo encontrado para "{query}".</div>
      )}

      <HelpSupportCTA title="Não achou o artigo que procura?" description="Nosso time pode ajudar você a encontrar ou resolver rapidamente." />
    </div>
  );
}
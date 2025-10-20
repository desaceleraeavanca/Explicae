"use client";

import React from "react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, CreditCard, Wrench, LifeBuoy } from "lucide-react";
import { getArticle } from "@/lib/help-articles";
import { HelpSupportCTA } from "@/components/help-support-cta";

// Dataset movido para lib/help-articles. Vamos buscar o artigo por slug usando getArticle.

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);

  if (!article) {
    return (
      <div className="container mx-auto max-w-3xl py-10 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Artigo não encontrado</CardTitle>
            <CardDescription>O link pode estar incorreto ou o artigo foi movido.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/help">Voltar para a Central de Ajuda</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const Icon = article.icon ?? LifeBuoy;

  return (
    <div className="container mx-auto max-w-3xl py-10 px-4">
      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ajuda", href: "/help" }, { label: article.title }]} />
      </div>

      {/* Header */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden mb-8">
        <div className="px-6 py-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm text-muted-foreground mb-3 bg-background">
            <Icon className="w-4 h-4" />
            <span>Artigo</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
          <p className="mt-2 text-muted-foreground leading-relaxed">{article.description}</p>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="space-y-6">
        {article.sections.map((s, idx) => (
          <Card key={idx} className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">{s.heading}</CardTitle>
              <CardDescription>{s.content}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* CTA Suporte no artigo */}
      <HelpSupportCTA />
    </div>
  );
}
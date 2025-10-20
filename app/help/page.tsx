"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, BookOpen, CreditCard, Wrench, LifeBuoy, ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { HelpSupportCTA } from "@/components/help-support-cta";

const suggestions = ["planos", "analogias", "conta", "assinatura"];

const faqs = [
  {
    category: "Introdução",
    question: "O que é o Explicaê?",
    answer:
      "O Explicaê é uma plataforma que ajuda você a transformar ideias complexas em explicações memoráveis através de analogias criativas.",
  },
  {
    category: "Geração",
    question: "Como posso gerar analogias?",
    answer:
      "Você pode gerar analogias utilizando nossa ferramenta de criação, inserindo o conceito que deseja explicar e o público-alvo.",
  },
  {
    category: "Planos",
    question: "Quais são os planos de assinatura?",
    answer:
      "Oferecemos diferentes planos, incluindo Recarga de Faíscas, Clareza (Mensal) e Maestria (Anual), cada um com benefícios exclusivos.",
  },
  {
    category: "Conta",
    question: "Como altero meu plano?",
    answer:
      "Acesse o painel em Dashboard > Configurações > Assinatura para gerenciar seu plano.",
  },
];

const popular = [
  { title: "Como começar a gerar analogias", href: "/help/articles/como-comecar-a-gerar-analogias", icon: BookOpen },
  { title: "Entendendo os planos e benefícios", href: "/help/articles/entendendo-os-planos-e-beneficios", icon: CreditCard },
  { title: "Resolvendo erros comuns de login", href: "/help/articles/resolvendo-erros-comuns-de-login", icon: Wrench },
  { title: "Como organizar seu banco de analogias", href: "/help/articles/como-organizar-seu-banco-de-analogias", icon: BookOpen },
];

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const [vote, setVote] = useState<Record<number, "yes" | "no" | null>>({});

  const filteredFaqs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4">
      {/* Breadcrumbs */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mb-4">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Ajuda" }]} />
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border shadow-sm bg-gradient-to-b from-background to-accent/10 mb-8">
        <div className="text-center px-6 py-10 md:py-12">
          <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm text-muted-foreground mb-3 bg-card">
            <LifeBuoy className="w-4 h-4" />
            <span>Central de Ajuda</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Encontre respostas e aprenda com clareza</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Pesquise por artigos, perguntas frequentes e guias para aproveitar ao máximo o Explicaê.
          </p>

          {/* Busca */}
          <div className="mt-6">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Busque por palavras-chave (ex.: planos, analogias, conta)"
                className="pl-9"
                aria-label="Buscar na Central de Ajuda"
              />
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <span className="text-xs text-muted-foreground">Sugestões:</span>
              {suggestions.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setQuery(s)}
                  aria-label={`Sugestão: ${s}`}
                >
                  {s}
                </Button>
              ))}
              <Button size="sm" variant="secondary" onClick={() => setQuery("")}>Limpar</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Categorias */}
      <div className="grid gap-6 md:grid-cols-3 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5" /> Primeiros Passos</CardTitle>
            <CardDescription>Aprenda o essencial para começar rápido.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/help/getting-started" className="inline-block">
              <Button variant="outline" className="transition-transform hover:translate-y-px">Ver guias</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5" /> Cobrança & Planos</CardTitle>
            <CardDescription>Detalhes de planos, pagamentos e benefícios.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/help/billing" className="inline-block">
              <Button variant="outline" className="transition-transform hover:translate-y-px">Ver artigos</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wrench className="w-5 h-5" /> Solução de Problemas</CardTitle>
            <CardDescription>Resolva questões comuns e erros rapidamente.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/help/troubleshooting" className="inline-block">
              <Button variant="outline" className="transition-transform hover:translate-y-px">Ver dicas</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Artigos Populares */}
      <div className="mb-12">
        <div className="flex items-end justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Artigos Populares</h2>
            <p className="text-muted-foreground">Selecionados para acelerar sua jornada.</p>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <Button asChild variant="link">
              <Link href="/help/articles">Ver todos os artigos</Link>
            </Button>
            <Button asChild variant="link">
              <Link href="/dashboard/support">Fale com o Suporte</Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {popular.map((p, i) => (
            <Link key={i} href={p.href} className="group" aria-label={`Abrir: ${p.title}`}>
              <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent transition-colors">
                <div className="flex items-center gap-3">
                  <p.icon className="w-4 h-4 text-muted-foreground group-hover:text-white" />
                  <span className="text-sm group-hover:text-white">{p.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Perguntas Frequentes</h2>
          <p className="text-muted-foreground">Dúvidas comuns sobre uso, planos e recursos.</p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {filteredFaqs.map((f, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="text-left hover:no-underline">{f.question}</AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground">{f.answer}</p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-xs text-muted-foreground">Esta resposta foi útil?</span>
                  <Button
                    size="sm"
                    variant={vote[i] === "yes" ? "secondary" : "outline"}
                    onClick={() => setVote((prev) => ({ ...prev, [i]: "yes" }))}
                    aria-pressed={vote[i] === "yes"}
                    className="hover:bg-green-600 hover:text-white"
                  >
                    Sim
                  </Button>
                  <Button
                    size="sm"
                    variant={vote[i] === "no" ? "secondary" : "outline"}
                    onClick={() => setVote((prev) => ({ ...prev, [i]: "no" }))}
                    aria-pressed={vote[i] === "no"}
                    className="hover:bg-red-600 hover:text-white"
                  >
                    Não
                  </Button>
                  {vote[i] != null && (
                    <span className="text-xs text-muted-foreground">Obrigado pelo feedback!</span>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredFaqs.length === 0 && (
          <div className="text-center text-muted-foreground mt-6">Nenhum resultado encontrado para "{query}".</div>
        )}
      </div>

      {/* CTA Suporte */}
      <HelpSupportCTA title="Não encontrou o que procura?" description="Nosso time está pronto para ajudar você." />
    </div>
  );
}
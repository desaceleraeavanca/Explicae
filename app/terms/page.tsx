"use client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";
import { HelpSupportCTA } from "@/components/help-support-cta";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen pt-22">
      <LandingHeader />
      <div className="container mx-auto max-w-6xl py-10 px-4">
        {/* Breadcrumbs */}
        <div className="items-center gap-2 text-sm text-muted-foreground mb-4">
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Termos de Serviço" }]} />
        </div>

        {/* Hero */}
        <div className="relative overflow-hidden rounded-2xl border shadow-sm bg-gradient-to-b from-background to-accent/10 mb-8">
          <div className="text-center px-6 py-10 md:py-12 text-center">
            <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-1 text-sm text-muted-foreground mb-3 bg-card">
              <FileText className="w-4 h-4" />
              <span>Termos de Serviço</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Regras claras para usar o Explicaê</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Regras de uso e condições que regem o acesso ao Explicaê.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Última atualização: 20/10/2025</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-6">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Aceitação dos Termos</CardTitle>
              <CardDescription>
                Ao criar uma conta ou utilizar o Explicaê, você concorda com estes Termos de Serviço. Se não concordar,
                não utilize a plataforma.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Conta e Segurança</CardTitle>
              <CardDescription>
                Você é responsável por manter a confidencialidade das credenciais e por todas as atividades realizadas
                com sua conta. Notifique-nos imediatamente em caso de uso não autorizado.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Uso Permitido</CardTitle>
              <CardDescription>
                Utilize o serviço conforme a legislação aplicável e estes termos. É proibido: violar direitos de terceiros,
                explorar vulnerabilidades, tentar engenharia reversa sem autorização ou usar o produto para fins ilícitos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Pagamento e Planos</CardTitle>
              <CardDescription>
                Planos e valores são apresentados na página de preços. Pagamentos podem ser processados por terceiros.
                Salvo disposição em contrário, taxas são não reembolsáveis após o uso do serviço.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Propriedade Intelectual</CardTitle>
              <CardDescription>
                O Explicaê, sua marca, código e conteúdos proprietários são protegidos. Você mantém direitos sobre o
                conteúdo que criar, mas nos concede licença para operarmos, exibirmos e melhorarmos o serviço.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Conteúdo do Usuário</CardTitle>
              <CardDescription>
                Você é responsável pelo conteúdo enviado. Podemos remover ou desabilitar conteúdos que violem estes
                termos ou a lei.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Limitações e Isenções</CardTitle>
              <CardDescription>
                O serviço é fornecido "no estado" e "conforme disponível". Nos limites permitidos pela lei, não nos
                responsabilizamos por danos indiretos, perda de lucro, dados ou interrupções.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Modificações no Serviço</CardTitle>
              <CardDescription>
                Podemos alterar funcionalidades, suspender ou descontinuar partes do serviço, com aviso prévio quando
                razoável.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Rescisão</CardTitle>
              <CardDescription>
                Podemos suspender ou encerrar sua conta por violação destes termos. Você pode encerrar a conta a
                qualquer momento.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Lei Aplicável e Foro</CardTitle>
              <CardDescription>
                Estes termos são regidos pelas leis do Brasil. Eventuais disputas serão resolvidas no foro da comarca de
                sua escolha, conforme legislação aplicável.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Contato</CardTitle>
              <CardDescription>
                Para questões relacionadas a estes termos, utilize a Central de Ajuda ou abra um ticket pelo suporte.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
        <HelpSupportCTA title="Precisa de ajuda com termos?" description="Fale com nosso time e resolva rapidamente." buttonLabel="Abrir Central de Suporte" />
      </div>
      <LandingFooter />
    </main>
  );
}
"use client";

import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpSupportCTA } from "@/components/help-support-cta";
import { LandingHeader } from "@/components/landing-header";
import { LandingFooter } from "@/components/landing-footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen pt-22">
      <LandingHeader />
      <div className="container mx-auto max-w-6xl py-10 px-4">
        {/* Breadcrumbs */}
        <div className="items-center gap-2 text-sm text-muted-foreground mb-4">
          <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Privacidade" }]} />
        </div>

        {/* Header */}
        <div className="relative overflow-hidden rounded-2xl border shadow-sm bg-gradient-to-b from-background to-accent/10 mb-8">
          <div className="px-6 py-10 md:py-12 text-center">
            <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium leading-5 text-muted-foreground tracking-wide mb-4">
              <FileText className="w-4 h-4 mr-2" />
              Política de Privacidade
            </span>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sua privacidade é nossa prioridade</h1>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Entenda como coletamos, usamos e protegemos seus dados no Explicaê.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Última atualização: 20/10/2025</p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="space-y-6">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Quem somos</CardTitle>
              <CardDescription>
                O Explicaê é uma plataforma de geração e organização de analogias. Nós atuamos como controlador dos
                dados pessoais tratados para prestação de nossos serviços.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Dados que coletamos</CardTitle>
              <CardDescription>
                Coletamos: (i) dados de conta (nome, e-mail), (ii) conteúdo gerado e metadados (analogias, rótulos),
                (iii) dados técnicos e de uso (logs de acesso, IP, dispositivo, navegador), e (iv) dados de pagamento
                processados por provedores terceirizados, quando aplicável.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Como usamos os dados</CardTitle>
              <CardDescription>
                Utilizamos seus dados para: (i) executar o serviço e funcionalidades, (ii) personalizar a experiência,
                (iii) manter segurança e integridade, (iv) análise interna de desempenho e melhorias, e (v) comunicar
                informações relevantes (ex.: mudanças, suporte, atualizações).
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Bases legais (LGPD)</CardTitle>
              <CardDescription>
                Tratamos dados com base em: execução de contrato, cumprimento de obrigações legais, legítimo interesse
                (equilíbrio com seus direitos), e consentimento quando necessário (ex.: comunicações opcionais).
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Compartilhamento e provedores</CardTitle>
              <CardDescription>
                Podemos compartilhar dados com fornecedores que nos ajudam a operar o serviço, como: infraestrutura e
                autenticação (ex.: Supabase), processamento de linguagem para geração (ex.: OpenRouter), e meios de
                pagamento. O compartilhamento é limitado ao necessário e regido por contratos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Cookies e tecnologias similares</CardTitle>
              <CardDescription>
                Usamos cookies funcionais para autenticação, preferências e estabilidade. Você pode gerenciá-los no
                navegador; a desativação pode impactar funcionalidades.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Retenção e exclusão</CardTitle>
              <CardDescription>
                Mantemos dados pelo tempo necessário para fornecer o serviço e cumprir obrigações legais. Ao excluir sua
                conta, dados de conteúdo podem ser removidos ou anonimizados; alguns registros mínimos podem ser retidos
                por períodos legais.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Transferências internacionais</CardTitle>
              <CardDescription>
                Seus dados podem ser processados em países fora do Brasil. Adotamos medidas para garantir proteção
                adequada, como contratos e padrões de segurança alinhados às melhores práticas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Segurança</CardTitle>
              <CardDescription>
                Aplicamos controles técnicos e organizacionais para proteger seus dados (ex.: criptografia em trânsito,
                monitoramento de acesso, segregação de ambientes). Nenhum sistema é infalível, mas atuamos para reduzir
                riscos e responder prontamente.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Seus direitos</CardTitle>
              <CardDescription>
                Você pode solicitar: acesso, correção, portabilidade, anonimização, bloqueio ou eliminação de dados,
                além de revogar consentimentos e contestar tratamentos. Atenderemos pedidos conforme a LGPD.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Contato</CardTitle>
              <CardDescription>
                Para dúvidas ou solicitações relacionadas à privacidade, utilize o painel de suporte autenticado.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HelpSupportCTA title="Precisa de ajuda com privacidade?" description="Abra um ticket e nossa equipe responderá rapidamente." />
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Alterações nesta política</CardTitle>
              <CardDescription>
                Podemos atualizar esta política para refletir mudanças legais ou operacionais. Publicaremos a nova versão
                e indicaremos a data de atualização.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      <LandingFooter />
    </main>
  );
}
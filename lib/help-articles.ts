import type { ComponentType } from "react";
import { BookOpen, CreditCard, Wrench, LifeBuoy } from "lucide-react";

export type HelpCategory = "getting-started" | "billing" | "troubleshooting";

export type HelpArticleSection = { heading: string; content: string };
export type HelpArticle = {
  category: HelpCategory;
  title: string;
  description: string;
  icon?: ComponentType<{ className?: string }>;
  sections: HelpArticleSection[];
};

export const helpArticles: Record<string, HelpArticle> = {
  // Primeiros Passos
  "como-comecar-a-gerar-analogias": {
    category: "getting-started",
    title: "Como começar a gerar analogias",
    description: "Um guia rápido para criar suas primeiras analogias com confiança.",
    icon: BookOpen,
    sections: [
      { heading: "Defina seu objetivo", content: "Comece identificando o conceito que deseja explicar e o público-alvo." },
      { heading: "Use o gerador do Explicaê", content: "Acesse a ferramenta de criação, informe contexto e tom desejado." },
      { heading: "Refine e publique", content: "Edite nuances, valide clareza e publique no seu banco de analogias." },
    ],
  },
  "como-organizar-seu-banco-de-analogias": {
    category: "getting-started",
    title: "Como organizar seu banco de analogias",
    description: "Estruture categorias, tags e versões para manter tudo acessível.",
    icon: BookOpen,
    sections: [
      { heading: "Crie categorias claras", content: "Separe por temas, público e formato para achar rápido." },
      { heading: "Use tags descritivas", content: "Tags ajudam a filtrar e reconectar ideias relacionadas." },
      { heading: "Versões e histórico", content: "Mantenha versões para evoluir sem perder contexto." },
    ],
  },
  "primeiros-passos-no-painel-do-explicae": {
    category: "getting-started",
    title: "Primeiros passos no painel do Explicaê",
    description: "Conheça as áreas principais e comece a navegar.",
    icon: BookOpen,
    sections: [
      { heading: "Visão geral do painel", content: "Entenda as seções: criação, banco, perfil e suporte." },
      { heading: "Ações rápidas", content: "Use atalhos para iniciar geração e acessar artigos." },
      { heading: "Dicas de produtividade", content: "Fixe itens frequentes e personalize preferências." },
    ],
  },
  "configurando-perfil-e-preferencias": {
    category: "getting-started",
    title: "Configurando perfil e preferências",
    description: "Ajuste idioma, tom e preferências para melhores resultados.",
    icon: BookOpen,
    sections: [
      { heading: "Atualize seu perfil", content: "Edite nome, imagem e dados pessoais no painel." },
      { heading: "Preferências de geração", content: "Defina tom, nível de detalhe e público alvo." },
      { heading: "Segurança e privacidade", content: "Configure sessão, autenticação e visibilidade das analogias." },
    ],
  },
  "publicando-e-compartilhando-analogias": {
    category: "getting-started",
    title: "Publicando e compartilhando analogias",
    description: "Publique com segurança e compartilhe com sua equipe ou clientes.",
    icon: BookOpen,
    sections: [
      { heading: "Revisão antes de publicar", content: "Valide clareza, referências e direitos de uso." },
      { heading: "Configurar visibilidade", content: "Escolha privado, equipe ou público conforme necessidade." },
      { heading: "Compartilhamento e exportação", content: "Gere links, PDFs ou exports para outras ferramentas." },
    ],
  },

  // Cobrança & Planos
  "entendendo-os-planos-e-beneficios": {
    category: "billing",
    title: "Entendendo os planos e benefícios",
    description: "Compare planos e escolha o que melhor se adapta ao seu momento.",
    icon: CreditCard,
    sections: [
      { heading: "Recarga de Faíscas", content: "Ideal para uso pontual. Pague apenas quando precisar." },
      { heading: "Plano Clareza (Mensal)", content: "Mais recursos, previsibilidade e suporte contínuo." },
      { heading: "Plano Maestria (Anual)", content: "Máximo benefício por custo anual otimizado." },
    ],
  },
  "como-funciona-a-recarga-de-faiscas": {
    category: "billing",
    title: "Como funciona a Recarga de Faíscas",
    description: "Compre créditos quando precisar, sem assinatura.",
    icon: CreditCard,
    sections: [
      { heading: "Quando usar recarga", content: "Situações ideais para créditos sob demanda." },
      { heading: "Como comprar", content: "Passo a passo para adquirir faíscas e confirmar pagamento." },
      { heading: "Validade e consumo", content: "Entenda como os créditos são abatidos e expiração." },
    ],
  },
  "gerenciar-metodo-de-pagamento": {
    category: "billing",
    title: "Como gerenciar método de pagamento",
    description: "Atualize cartão, verifique cobranças e evite falhas.",
    icon: CreditCard,
    sections: [
      { heading: "Adicionar/atualizar cartão", content: "Cadastre um novo cartão ou atualize dados com segurança." },
      { heading: "Verificar cobranças", content: "Veja histórico, valores e status das transações." },
      { heading: "Boas práticas de segurança", content: "Use 2FA e mantenha dados protegidos." },
    ],
  },
  "emitir-notas-fiscais-e-recibos": {
    category: "billing",
    title: "Emitir notas fiscais e recibos",
    description: "Baixe documentos para controle financeiro.",
    icon: CreditCard,
    sections: [
      { heading: "Acessar histórico", content: "Encontre faturas e comprovantes pelo painel." },
      { heading: "Emitir NF ou recibo", content: "Gere documentos conforme seu regime fiscal." },
      { heading: "Automatizar envio", content: "Receba por e-mail automaticamente e organize em pastas." },
    ],
  },
  "alterar-ou-cancelar-assinatura": {
    category: "billing",
    title: "Alterar ou cancelar assinatura",
    description: "Mude de plano ou cancele com poucos cliques.",
    icon: CreditCard,
    sections: [
      { heading: "Troca de plano", content: "Altere entre Recarga, Clareza e Maestria conforme necessidade." },
      { heading: "Cancelamento", content: "Entenda prazos, cobranças e como confirmar cancelamento." },
      { heading: "Impactos e reativações", content: "Veja o que muda e como reativar futuramente." },
    ],
  },

  // Solução de Problemas
  "resolvendo-erros-comuns-de-login": {
    category: "troubleshooting",
    title: "Resolvendo erros comuns de login",
    description: "Dicas práticas para recuperar acesso rapidamente e seguir com seu trabalho.",
    icon: Wrench,
    sections: [
      { heading: "Verifique credenciais", content: "Confirme e-mail e senha; utilize recuperação de senha se necessário." },
      { heading: "Cheque conexão", content: "Conexões instáveis podem bloquear autenticação. Tente outra rede." },
      { heading: "Limpe cache/cookies", content: "Ambientes com cache corrompido impactam sessões. Limpe e tente novamente." },
    ],
  },
  "sincronizacao-de-dados-quando-nao-aparecem": {
    category: "troubleshooting",
    title: "Sincronização de dados: quando não aparecem",
    description: "Passos para restaurar a visibilidade de dados.",
    icon: Wrench,
    sections: [
      { heading: "Verificar filtros e conexões", content: "Confirme filtros ativos e estado de integrações." },
      { heading: "Reprocessar sincronização", content: "Reinicie o processo e aguarde confirmação." },
      { heading: "Contatar suporte com logs", content: "Anexe capturas e timestamps para análise rápida." },
    ],
  },
  "problemas-de-performance-ou-lentidao": {
    category: "troubleshooting",
    title: "Problemas de performance ou lentidão",
    description: "Melhore velocidade de geração e navegação.",
    icon: Wrench,
    sections: [
      { heading: "Fechar abas e processos", content: "Libere memória e CPU antes de tarefas intensas." },
      { heading: "Verificar rede e cache", content: "Conexões lentas e caches cheios degradam experiência." },
      { heading: "Otimizar configurações", content: "Ajuste preferências e desative extensões problemáticas." },
    ],
  },
  "erros-ao-gerar-analogias": {
    category: "troubleshooting",
    title: "Erros ao gerar analogias",
    description: "Acione soluções comuns e evite bloqueios.",
    icon: Wrench,
    sections: [
      { heading: "Validar entrada e contexto", content: "Cheque campos obrigatórios e consistência das instruções." },
      { heading: "Reiniciar sessão de geração", content: "Refaça o fluxo se encontrar estados inconsistentes." },
      { heading: "Verificar limites de uso", content: "Confirme créditos e limites de requisição." },
    ],
  },
  "dificuldades-com-acesso-ao-dashboard": {
    category: "troubleshooting",
    title: "Dificuldades com acesso ao dashboard",
    description: "Diagnostique bloqueios de acesso ao painel.",
    icon: Wrench,
    sections: [
      { heading: "Verificar estado do serviço", content: "Consulte status e incidentes conhecidos." },
      { heading: "Checar autenticação e cookies", content: "Refaça login e limpe cookies corrompidos." },
      { heading: "Abrir ticket com detalhes", content: "Inclua passo a passo, horário e navegador usado." },
    ],
  },
};

export function getArticle(slug: string): HelpArticle | undefined {
  return helpArticles[slug];
}

export const allArticles = Object.entries(helpArticles).map(([slug, a]) => ({
  slug,
  title: a.title,
  description: a.description,
  icon: a.icon ?? LifeBuoy,
  category: a.category,
}));
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "Como funciona o período de teste gratuito?",
    answer:
      "O plano Descoberta oferece 7 dias de acesso completo a todos os recursos, com limite de 30 faíscas (que geram até 90 analogias). Não é necessário cartão de crédito para começar.",
  },
  {
    question: "O que são 'faíscas'?",
    answer:
      "Faíscas são créditos de geração. Cada faísca permite gerar até 3 variações de analogias para um mesmo conceito, permitindo que você escolha a melhor opção para sua necessidade.",
  },
  {
    question: "Posso mudar de plano a qualquer momento?",
    answer:
      "Sim! Você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ao fazer upgrade, você terá acesso imediato aos novos recursos. No downgrade, as mudanças entram em vigor no próximo ciclo de cobrança.",
  },
  {
    question: "Como funciona o plano anual?",
    answer:
      "O plano anual oferece 17% de desconto em relação ao pagamento mensal. Você paga uma vez por ano e tem acesso ininterrupto a todos os recursos do plano escolhido.",
  },
  {
    question: "O que acontece se eu exceder o limite de faíscas?",
    answer:
      "No plano gratuito, você pode adquirir pacotes adicionais de faíscas. Nos planos pagos (Clareza e Equipe), não há limite de uso - você pode gerar quantas analogias precisar.",
  },
  {
    question: "Vocês oferecem desconto para estudantes ou educadores?",
    answer:
      "Sim! Oferecemos 50% de desconto para estudantes e educadores com email institucional válido. Entre em contato conosco para solicitar o desconto.",
  },
  {
    question: "Como funciona o plano Equipe?",
    answer:
      "O plano Equipe permite até 10 membros com workspace compartilhado, banco de analogias colaborativo e dialetos personalizados da empresa. Ideal para times de marketing, vendas e educação.",
  },
  {
    question: "Posso cancelar minha assinatura?",
    answer:
      "Sim, você pode cancelar sua assinatura a qualquer momento. Você continuará tendo acesso aos recursos até o final do período pago. Não há taxas de cancelamento.",
  },
  {
    question: "Quais formas de pagamento vocês aceitam?",
    answer:
      "Aceitamos cartões de crédito (Visa, Mastercard, American Express), PIX e boleto bancário. Para planos anuais e empresariais, também oferecemos pagamento via transferência bancária.",
  },
  {
    question: "Meus dados estão seguros?",
    answer:
      "Sim! Utilizamos criptografia de ponta a ponta e seguimos as melhores práticas de segurança. Seus dados e analogias são privados e nunca são compartilhados com terceiros.",
  },
]

export function PricingFAQ() {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-balance">Perguntas Frequentes</h2>
          <p className="text-lg text-muted-foreground text-balance">Tire suas dúvidas sobre nossos planos e recursos</p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-card border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent>
                <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}

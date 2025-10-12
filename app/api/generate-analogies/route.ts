import { generateText } from "ai"
import {
  checkAnonymousAccess,
  checkUserAccess,
  trackGeneration,
  consumeCredit,
  getAnonymousId,
} from "@/lib/access-control"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { concept, audience } = await request.json()

    if (!concept || !audience) {
      return Response.json({ error: "Conceito e público-alvo são obrigatórios" }, { status: 400 })
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    let accessCheck

    if (!user) {
      const anonymousId = getAnonymousId()
      accessCheck = await checkAnonymousAccess(anonymousId)

      if (!accessCheck.canGenerate) {
        return Response.json(
          {
            error: "limit_reached",
            message: "Você atingiu o limite de gerações gratuitas. Cadastre-se para continuar!",
            redirectTo: "/auth/signup",
          },
          { status: 403 },
        )
      }

      // Set cookie for anonymous tracking
      const cookieStore = cookies()
      cookieStore.set("anonymous_id", anonymousId, {
        maxAge: 60 * 60 * 24 * 365, // 1 year
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
      })

      // Track generation
      await trackGeneration(null, anonymousId, concept, audience)
    } else {
      accessCheck = await checkUserAccess(user.id)

      if (!accessCheck.canGenerate) {
        let message = "Você atingiu o limite do seu plano."
        const redirectTo = "/pricing"

        if (accessCheck.reason === "trial_expired") {
          message = "Seu período de teste expirou. Faça upgrade para continuar!"
        } else if (accessCheck.reason === "limit_reached") {
          message = "Você atingiu o limite de 100 gerações do plano gratuito. Faça upgrade!"
        } else if (accessCheck.reason === "no_credits") {
          message = "Seus créditos acabaram. Recarregue para continuar!"
        } else if (accessCheck.reason === "subscription_cancelled") {
          message = "Sua assinatura foi cancelada. Renove para continuar!"
        } else if (accessCheck.reason === "payment_pending") {
          message = "Seu pagamento está pendente. Regularize para continuar!"
        }

        return Response.json(
          {
            error: accessCheck.reason,
            message,
            redirectTo,
            usage: {
              used: accessCheck.generationsUsed,
              limit: accessCheck.generationsLimit,
            },
          },
          { status: 403 },
        )
      }

      // Track generation
      await trackGeneration(user.id, null, concept, audience)

      // Consume credit if applicable
      if (accessCheck.reason === "ok") {
        await consumeCredit(user.id)
      }
    }

    const prompt = `Você é um especialista em comunicação e criação de analogias memoráveis.

Tarefa: Criar 3 analogias criativas e eficazes para explicar o conceito "${concept}" para "${audience}".

Requisitos:
- Cada analogia deve ser clara, memorável e apropriada para o público-alvo
- Use referências e linguagem que o público-alvo entenda facilmente
- Seja criativo e surpreendente - busque aquele momento "AHA!"
- As analogias devem simplificar sem perder a essência do conceito
- Adapte o tom e os exemplos ao perfil do público

Formato de resposta (JSON):
{
  "analogies": [
    {
      "title": "Título curto e chamativo da analogia",
      "description": "Explicação completa da analogia em 2-4 frases"
    }
  ]
}

Gere exatamente 3 analogias diferentes e criativas.`

    const { text } = await generateText({
      model: "openai/gpt-4o",
      prompt,
      temperature: 0.9,
    })

    console.log("[v0] Generated text:", text)

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Invalid response format")
    }

    const result = JSON.parse(jsonMatch[0])

    return Response.json({
      ...result,
      usage: {
        used: accessCheck.generationsUsed + 1,
        limit: accessCheck.generationsLimit,
        remaining: accessCheck.generationsLimit - accessCheck.generationsUsed - 1,
      },
    })
  } catch (error) {
    console.error("[v0] Error in generate-analogies:", error)
    return Response.json({ error: "Erro ao gerar analogias" }, { status: 500 })
  }
}

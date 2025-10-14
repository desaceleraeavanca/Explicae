import { createClient } from "@/lib/supabase/server"
import { generateText } from "@/lib/openrouter"
import { getModelForUser } from "@/lib/openrouter"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { text, targetAudience } = await request.json()

    if (!text || text.trim().length === 0) {
      return Response.json({ error: "Text is required" }, { status: 400 })
    }

    const audienceContext = targetAudience ? `\nPúblico-alvo: ${targetAudience}` : ""

    const model = await getModelForUser(user.id)

    const analysisText = await generateText(
      [
        {
          role: "system",
          content:
            "Você é um especialista em comunicação clara e criação de analogias.",
        },
        {
          role: "user",
          content: `Analise o seguinte texto e identifique onde analogias podem melhorar a clareza:${audienceContext}

TEXTO:\n${text}

Forneça sua análise no seguinte formato JSON:
{
  "score": [número de 0-100 indicando clareza geral],
  "complexSections": [
    {
      "text": "[trecho do texto original que é complexo]",
      "reason": "[por que este trecho é difícil de entender]",
      "suggestion": "[sugestão de tipo de analogia que ajudaria]"
    }
  ],
  "recommendations": [
    "[recomendação geral 1]",
    "[recomendação geral 2]"
  ]
}

Identifique 2-5 trechos complexos que se beneficiariam de analogias.
Seja específico nas sugestões de analogias.
Considere o público-alvo ao fazer recomendações.`,
        },
      ],
      model
    )

    // Parse the JSON response
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("Failed to parse analysis")
    }

    const analysis = JSON.parse(jsonMatch[0])

    return Response.json({ analysis })
  } catch (error) {
    console.error("[v0] Error analyzing clarity:", error)
    return Response.json({ error: "Failed to analyze text" }, { status: 500 })
  }
}

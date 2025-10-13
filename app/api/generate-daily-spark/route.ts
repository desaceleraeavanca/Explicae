import { createClient } from "@/lib/supabase/server"
import { generateText } from "ai"

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const today = new Date().toISOString().split("T")[0]
    const { data: existingSpark } = await supabase
      .from("daily_sparks")
      .select("*")
      .eq("spark_date", today)
      .maybeSingle()

    if (existingSpark) {
      return Response.json({ spark: existingSpark })
    }

    // Generate random concept and audience for daily spark
    const concepts = [
      "Inteligência Artificial",
      "Mudanças Climáticas",
      "Blockchain",
      "Computação Quântica",
      "Realidade Virtual",
      "Energia Renovável",
      "Edição Genética",
      "Internet das Coisas",
      "Machine Learning",
      "Criptomoedas",
    ]

    const audiences = [
      "Crianças de 10 anos",
      "Idosos que não usam tecnologia",
      "Adolescentes viciados em TikTok",
      "Pessoas que guardam dinheiro embaixo do colchão",
      "Chefs de cozinha tradicionais",
      "Agricultores do interior",
      "Artistas plásticos",
      "Motoristas de táxi",
    ]

    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)]
    const randomAudience = audiences[Math.floor(Math.random() * audiences.length)]

    // Generate analogy using AI
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Você é um especialista em criar analogias criativas e memoráveis.

Crie UMA analogia para explicar "${randomConcept}" para "${randomAudience}".

A analogia deve:
- Ser criativa e surpreendente
- Usar referências que o público-alvo entende
- Ser clara e memorável
- Gerar aquele momento "AHA!"

Formato de resposta:
Título da Analogia

Explicação detalhada da analogia (2-3 parágrafos)`,
    })

    // Parse the response
    const lines = text.trim().split("\n\n")
    const title = lines[0]
    const description = lines.slice(1).join("\n\n")
    const analogyText = `${title}\n\n${description}`

    // Save to database
    const { data: newSpark, error } = await supabase
      .from("daily_sparks")
      .insert({
        concept: randomConcept,
        audience: randomAudience,
        analogy_text: analogyText,
        spark_date: today,
      })
      .select()
      .maybeSingle()

    if (error) {
      console.error("[v0] Error saving spark:", error)
      return Response.json({ error: "Failed to save spark" }, { status: 500 })
    }

    return Response.json({ spark: newSpark })
  } catch (error) {
    console.error("[v0] Error generating daily spark:", error)
    return Response.json({ error: "Failed to generate spark" }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { checkUserAccess, trackGeneration } from "@/lib/access-control"

/**
 * Rota de teste para validar incremento de uso e limites.
 * - Exige usuário autenticado: consulta uso, insere uma geração de teste e retorna uso atualizado
 */
export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Exigir login
    if (!user?.id) {
      return NextResponse.json({
        error: "login_required",
        message: "Faça login para testar gratuitamente por 7 dias (30 faíscas).",
        title: "Login necessário",
        buttonText: "Fazer login",
        buttonLink: "/auth/login",
      }, { status: 401 })
    }

    // Consulta uso atual
    const accessBefore = await checkUserAccess(user.id)

    // Se puder gerar, insere uma geração de teste para incrementar o contador
    if (accessBefore.canGenerate) {
      await trackGeneration(user.id, "[TEST] Incremento de uso", "[TEST] Público")
    }

    // Reconsultar para obter valores atualizados
    const accessAfter = await checkUserAccess(user.id)

    return NextResponse.json({
      status: "ok",
      user: { id: user.id, email: user.email },
      usage: {
        used: accessAfter.generationsUsed,
        limit: accessAfter.generationsLimit,
        remaining: Math.max(0, accessAfter.generationsLimit - accessAfter.generationsUsed),
      }
    })
  } catch (err) {
    console.error("[TEST-USAGE] Erro:", err)
    return NextResponse.json(
      { error: "Erro interno na rota de teste" },
      { status: 500 }
    )
  }
}
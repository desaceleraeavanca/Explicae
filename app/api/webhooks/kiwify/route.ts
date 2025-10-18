import { createClient } from "@/lib/supabase/server"
import type { NextRequest } from "next/server"
import { maskEmail, safeLog, safeError } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    safeLog("[v0] Kiwify webhook received:", body)

    // Validate webhook (add your Kiwify webhook secret validation here)
    // const signature = request.headers.get("x-kiwify-signature")
    // if (!isValidSignature(signature, body)) {
    //   return Response.json({ error: "Invalid signature" }, { status: 401 })
    // }

    const { event, customer_email, product_id, status } = body

    if (event === "purchase.approved" || event === "subscription.created") {
      const supabase = await createClient()

      // Find user by email
      const { data: profile } = await supabase.from("profiles").select("*").eq("email", customer_email).single()

      if (!profile) {
        safeError("[v0] User not found:", maskEmail(customer_email))
        return Response.json({ error: "User not found" }, { status: 404 })
      }

      // Map product_id to plan_type
      let planType = "gratuito"
      let creditsToAdd = 0

      // TODO: Replace with your actual Kiwify product IDs
      if (product_id === "KIWIFY_CREDITO_PRODUCT_ID") {
        planType = "credito"
        creditsToAdd = 150
      } else if (product_id === "KIWIFY_MENSAL_PRODUCT_ID") {
        planType = "mensal"
      } else if (product_id === "KIWIFY_ANUAL_PRODUCT_ID") {
        planType = "anual"
      }

      // Update user plan
      const updateData: any = {
        plan_type: planType,
        subscription_status: "ativa",
        last_payment_date: new Date().toISOString(),
      }

      if (planType === "credito") {
        updateData.credits_remaining = (profile.credits_remaining || 0) + creditsToAdd
      }

      const { error } = await supabase.from("profiles").update(updateData).eq("id", profile.id)

      if (error) {
        safeError("[v0] Error updating user plan:", error)
        return Response.json({ error: "Failed to update user" }, { status: 500 })
      }

      safeLog("[v0] User plan updated:", maskEmail(customer_email), planType)
      return Response.json({ success: true })
    }

    if (event === "subscription.cancelled") {
      const supabase = await createClient()

      const { error } = await supabase
        .from("profiles")
        .update({ subscription_status: "cancelada" })
        .eq("email", customer_email)

      if (error) {
        safeError("[v0] Error cancelling subscription:", error)
        return Response.json({ error: "Failed to cancel subscription" }, { status: 500 })
      }

      safeLog("[v0] Subscription cancelled:", maskEmail(customer_email))
      return Response.json({ success: true })
    }

    return Response.json({ success: true })
  } catch (error) {
    safeError("[v0] Webhook error:", error)
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}

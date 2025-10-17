import { createClient } from "@/lib/supabase/server"

export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()

  return !error && data?.role === "admin"
}

export async function logAuditAction(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: any,
  ipAddress?: string,
  userAgent?: string,
) {
  const supabase = await createClient()

  await supabase.from("audit_logs").insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
    ip_address: ipAddress,
    user_agent: userAgent,
  })
}

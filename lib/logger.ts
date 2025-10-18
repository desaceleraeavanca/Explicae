// Centralized logging utilities with sanitization and masking
// Use these helpers whenever logging potentially sensitive data

// Masks emails by keeping the first character and domain, hiding the local part
export function maskEmail(email?: unknown): string {
  const str = typeof email === "string" ? email : String(email ?? "")
  if (!str || !str.includes("@")) return str
  const [local, domain] = str.split("@")
  if (!local) return `***@${domain}`
  const first = local[0]
  const maskedLocal = `${first}${"*".repeat(Math.max(local.length - 1, 3))}`
  return `${maskedLocal}@${domain}`
}

// Generic string masking for secrets/tokens
function maskToken(token: string): string {
  if (!token) return token
  const clean = token.replace(/\s+/g, "")
  if (clean.length <= 8) return "***"
  return `${clean.slice(0, 4)}***${clean.slice(-4)}`
}

// Recursively sanitize objects/arrays/strings before logging
export function sanitizeForLogs(input: unknown, sensitiveKeys: string[] = [
  "api_key",
  "password",
  "email",
  "token",
  "access_token",
  "refresh_token",
  "Authorization",
  "key",
  "secret",
]): unknown {
  try {
    if (input == null) return input

    if (typeof input === "string") {
      // If it's an email, mask it
      if (input.includes("@") && /.+@.+\..+/.test(input)) {
        return maskEmail(input)
      }
      // If it looks like a token/secret, mask it
      if (/^(sk_|eyJ|[A-Za-z0-9]{24,})/.test(input)) {
        return maskToken(input)
      }
      return input
    }

    if (Array.isArray(input)) {
      return input.map((item) => sanitizeForLogs(item, sensitiveKeys))
    }

    if (typeof input === "object") {
      const obj = input as Record<string, unknown>
      const sanitized: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        const lowerKey = key.toLowerCase()
        if (sensitiveKeys.some((k) => lowerKey.includes(k.toLowerCase()))) {
          if (lowerKey.includes("email")) {
            sanitized[key] = maskEmail(value as string)
          } else {
            sanitized[key] = "***hidden***"
          }
        } else {
          sanitized[key] = sanitizeForLogs(value, sensitiveKeys)
        }
      }
      return sanitized
    }

    return input
  } catch {
    // Fail open: if sanitization fails, avoid breaking the app
    return "***log sanitized***"
  }
}

// Safe logging helpers
export function safeLog(...args: unknown[]): void {
  try {
    const sanitized = args.map((a) => sanitizeForLogs(a))
    // eslint-disable-next-line no-console
    console.log(...sanitized)
  } catch {
    // eslint-disable-next-line no-console
    console.log("[safeLog] log suppressed")
  }
}

export function safeWarn(...args: unknown[]): void {
  try {
    const sanitized = args.map((a) => sanitizeForLogs(a))
    // eslint-disable-next-line no-console
    console.warn(...sanitized)
  } catch {
    // eslint-disable-next-line no-console
    console.warn("[safeWarn] log suppressed")
  }
}

export function safeError(...args: unknown[]): void {
  try {
    const sanitized = args.map((a) => sanitizeForLogs(a))
    // eslint-disable-next-line no-console
    console.error(...sanitized)
  } catch {
    // eslint-disable-next-line no-console
    console.error("[safeError] log suppressed")
  }
}
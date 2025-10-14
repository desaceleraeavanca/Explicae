import { cookies } from "next/headers";

/**
 * Obtém o ID anônimo do usuário a partir dos cookies
 * ou gera um novo se não existir
 */
export function getAnonymousId(): string {
  const cookieStore = cookies();
  const anonymousId = cookieStore.get("anonymous_id")?.value;
  
  if (anonymousId) {
    return anonymousId;
  }
  
  // Se não houver ID anônimo, retorna uma string vazia
  // O ID será gerado no cliente se necessário
  return "";
}
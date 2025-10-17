import { cookies } from "next/headers";
import { v4 as uuidv4 } from 'uuid';

/**
 * Obtém o ID anônimo do usuário a partir dos cookies
 * ou gera um novo se não existir
 */
export function getAnonymousId(): string {
  const cookieStore = cookies();
  let anonymousId = cookieStore.get("anonymous_id")?.value;
  
  if (!anonymousId) {
    // Gera um novo ID se não houver
    anonymousId = uuidv4();
    // Salva no cookie por 30 dias
    cookieStore.set("anonymous_id", anonymousId, { maxAge: 60 * 60 * 24 * 30 });
  }
  
  return anonymousId;
}
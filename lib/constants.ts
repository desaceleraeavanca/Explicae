/**
 * Constantes utilizadas na aplicação
 */

// Limites de uso para usuários anônimos
export const ANONYMOUS_LIMIT = 3;

// Limites de uso para diferentes planos
export const USAGE_LIMITS = {
  FREE: 8,
  BASIC: 50,
  PRO: 200,
  ENTERPRISE: 1000
};

// Configurações de cache
export const CACHE_DURATION = {
  SHORT: 60 * 5, // 5 minutos
  MEDIUM: 60 * 60, // 1 hora
  LONG: 60 * 60 * 24, // 1 dia
};

// Configurações de API
export const API_TIMEOUT = 30000; // 30 segundos
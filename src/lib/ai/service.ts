import { openAIService } from './openai';
import type { TicketAnalysis } from './types';

/**
 * Provider-agnostic AI service interface (PROJECT.md §6/§11). Callers should
 * depend on this interface and {@link getAIService}, never on a concrete
 * provider implementation directly, so a second provider can be added later
 * by adding a branch to the factory rather than rewiring every call site.
 */
export interface AIService {
  analyzeTicket(subject: string, message: string): Promise<TicketAnalysis>;
}

/**
 * Returns the configured {@link AIService} implementation. Currently always
 * OpenAI; a future provider would be selected here (e.g. via an env var),
 * not by changing anything at the call sites.
 */
export function getAIService(): AIService {
  return openAIService;
}

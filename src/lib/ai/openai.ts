import OpenAI from 'openai';

import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '@/lib/utils/constants';
import { ticketAnalysisSchema } from '@/lib/validations/ticket';

import { buildTicketAnalysisUserMessage, TICKET_ANALYSIS_SYSTEM_PROMPT } from './prompts';
import type { AIService } from './service';
import type { TicketAnalysis } from './types';

const REQUEST_TIMEOUT_MS = 10_000;
const RATE_LIMIT_RETRY_DELAY_MS = 1_000;
const MAX_OUTPUT_TOKENS = 500;
const MODEL = 'gpt-4o-mini';

/** OpenAI's native JSON Schema for the structured ticket analysis output (PROJECT.md §12). */
const TICKET_ANALYSIS_JSON_SCHEMA = {
  name: 'ticket_analysis',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      category: { type: 'string', enum: [...TICKET_CATEGORIES] },
      priority: { type: 'string', enum: [...TICKET_PRIORITIES] },
      summary: { type: 'string' },
      suggestedResponse: { type: 'string' },
      confidence: { type: 'number' },
    },
    required: ['category', 'priority', 'summary', 'suggestedResponse', 'confidence'],
    additionalProperties: false,
  },
} as const;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Lazily constructed so this module can be imported before `OPENAI_API_KEY` is configured. */
let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (client) return client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'OPENAI_API_KEY is not set. Configure it in the environment before calling analyzeTicket().',
    );
  }

  client = new OpenAI({ apiKey });
  return client;
}

async function requestAnalysis(subject: string, message: string): Promise<TicketAnalysis> {
  const openai = getClient();

  const response = await openai.chat.completions.create(
    {
      model: MODEL,
      temperature: 0.3,
      max_completion_tokens: MAX_OUTPUT_TOKENS,
      response_format: {
        type: 'json_schema',
        json_schema: TICKET_ANALYSIS_JSON_SCHEMA,
      },
      messages: [
        { role: 'system', content: TICKET_ANALYSIS_SYSTEM_PROMPT },
        { role: 'user', content: buildTicketAnalysisUserMessage(subject, message) },
      ],
    },
    { timeout: REQUEST_TIMEOUT_MS },
  );

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI response contained no content to parse.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI response was not valid JSON.');
  }

  // Belt and suspenders (PROJECT.md §12): OpenAI's `strict: true` schema
  // enforcement is not a substitute for our own runtime validation.
  return ticketAnalysisSchema.parse(parsed);
}

/**
 * OpenAI implementation of {@link AIService}.
 *
 * Fallback strategy (PROJECT.md §11):
 * - 10 second per-request timeout.
 * - Exactly one retry, and only on rate-limit errors, after a 1 second delay.
 * - Every other failure (timeout, invalid key, invalid response) propagates
 *   immediately; the caller is responsible for the `needs_review` fallback.
 */
export const openAIService: AIService = {
  modelName: MODEL,
  async analyzeTicket(subject: string, message: string): Promise<TicketAnalysis> {
    try {
      return await requestAnalysis(subject, message);
    } catch (error) {
      if (error instanceof OpenAI.RateLimitError) {
        await sleep(RATE_LIMIT_RETRY_DELAY_MS);
        return requestAnalysis(subject, message);
      }
      throw error;
    }
  },
};

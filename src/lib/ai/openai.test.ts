import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Unit tests for the OpenAI {@link AIService} implementation (PROJECT.md
 * §21: "AI response parsing ve validation"). The `openai` SDK itself is
 * mocked — these tests exercise this module's own logic: request
 * construction, the rate-limit retry policy, and response
 * parsing/validation (PROJECT.md §11/§12).
 */

const mockCreate = vi.fn();

class MockAPIError extends Error {}
class MockRateLimitError extends MockAPIError {}

vi.mock('openai', () => {
  class OpenAI {
    chat = { completions: { create: mockCreate } };
    static RateLimitError = MockRateLimitError;
    static APIError = MockAPIError;
  }
  return { default: OpenAI };
});

const validAnalysis = {
  category: 'technical',
  priority: 'high',
  summary: 'Customer cannot log in to their account.',
  suggestedResponse:
    'Thanks for reaching out — please try resetting your password via the link on the login page.',
  confidence: 0.87,
};

function chatResponse(content: string) {
  return { choices: [{ message: { content } }] };
}

beforeEach(() => {
  vi.resetModules();
  mockCreate.mockReset();
  process.env.OPENAI_API_KEY = 'test-key';
});

afterEach(() => {
  vi.useRealTimers();
  delete process.env.OPENAI_API_KEY;
});

describe('openAIService.analyzeTicket', () => {
  it('exposes the configured model name', async () => {
    const { openAIService } = await import('./openai');
    expect(openAIService.modelName).toBe('gpt-4o-mini');
  });

  it('parses a valid successful response', async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(JSON.stringify(validAnalysis)));
    const { openAIService } = await import('./openai');

    const result = await openAIService.analyzeTicket('Cannot log in', 'Locked out since morning');

    expect(result).toEqual(validAnalysis);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('throws when OPENAI_API_KEY is not configured', async () => {
    delete process.env.OPENAI_API_KEY;
    const { openAIService } = await import('./openai');

    await expect(openAIService.analyzeTicket('s', 'm')).rejects.toThrow(/OPENAI_API_KEY/);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('retries exactly once after a rate-limit error, then succeeds', async () => {
    vi.useFakeTimers();
    mockCreate
      .mockRejectedValueOnce(new MockRateLimitError('rate limited'))
      .mockResolvedValueOnce(chatResponse(JSON.stringify(validAnalysis)));
    const { openAIService } = await import('./openai');

    const promise = openAIService.analyzeTicket('s', 'm');
    await vi.advanceTimersByTimeAsync(1_000);
    const result = await promise;

    expect(result).toEqual(validAnalysis);
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('propagates a second rate-limit error without a further retry', async () => {
    vi.useFakeTimers();
    mockCreate
      .mockRejectedValueOnce(new MockRateLimitError('rate limited'))
      .mockRejectedValueOnce(new MockRateLimitError('rate limited again'));
    const { openAIService } = await import('./openai');

    const promise = openAIService.analyzeTicket('s', 'm');
    // Attach the rejection assertion before advancing timers so the
    // rejection is observed rather than becoming an unhandled rejection.
    const assertion = expect(promise).rejects.toThrow(MockRateLimitError);
    await vi.advanceTimersByTimeAsync(1_000);
    await assertion;

    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it('propagates a non-rate-limit error without retrying', async () => {
    mockCreate.mockRejectedValueOnce(new Error('502 Bad Gateway'));
    const { openAIService } = await import('./openai');

    await expect(openAIService.analyzeTicket('s', 'm')).rejects.toThrow('502 Bad Gateway');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('throws when the response has no content', async () => {
    mockCreate.mockResolvedValueOnce({ choices: [{ message: {} }] });
    const { openAIService } = await import('./openai');

    await expect(openAIService.analyzeTicket('s', 'm')).rejects.toThrow(/no content/i);
  });

  it('throws when the response content is not valid JSON', async () => {
    mockCreate.mockResolvedValueOnce(chatResponse('not json'));
    const { openAIService } = await import('./openai');

    await expect(openAIService.analyzeTicket('s', 'm')).rejects.toThrow(/not valid JSON/i);
  });

  it('throws when the parsed response fails schema validation (belt and suspenders)', async () => {
    mockCreate.mockResolvedValueOnce(
      chatResponse(JSON.stringify({ ...validAnalysis, category: 'not-a-real-category' })),
    );
    const { openAIService } = await import('./openai');

    await expect(openAIService.analyzeTicket('s', 'm')).rejects.toThrow();
  });

  it('sends the system prompt and user message built from subject/message', async () => {
    mockCreate.mockResolvedValueOnce(chatResponse(JSON.stringify(validAnalysis)));
    const { openAIService } = await import('./openai');

    await openAIService.analyzeTicket('Billing question', 'Why was I charged twice?');

    const [request] = mockCreate.mock.calls[0] as [
      { messages: { role: string; content: string }[] },
    ];
    expect(request.messages[0]?.role).toBe('system');
    expect(request.messages[1]?.content).toContain('Billing question');
    expect(request.messages[1]?.content).toContain('Why was I charged twice?');
  });
});

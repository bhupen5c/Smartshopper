/**
 * Minimal REST client for Google's Gemini API. Used by scraper strategies
 * to extract structured prices from HTML or PDF catalogues.
 *
 * Docs: https://ai.google.dev/gemini-api/docs
 *
 * We deliberately avoid the official @google/genai SDK to keep the
 * package dependency-light — Gemini's REST API is simple and stable.
 */

import { z, type ZodType } from 'zod';
import type { GeminiClient } from './types.js';

const DEFAULT_MODEL = 'gemini-2.5-flash';
const FALLBACK_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

export function createGeminiClient(apiKey: string | undefined, defaultModel?: string): GeminiClient | null {
  if (!apiKey) return null;
  const preferred = defaultModel ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;

  return {
    async generateJson<T>(args: {
      prompt: string;
      inlineDataUrl?: string;
      inlineDataBase64?: string;
      inlineDataMimeType?: string;
      responseSchema: ZodType<T>;
      model?: string;
    }): Promise<T> {
      const tryModel = args.model ?? preferred;
      // If the requested model 404s, fall back in order. Keeps us resilient
      // to Google renaming (e.g. gemini-3-flash not GA yet).
      const candidates = Array.from(new Set([tryModel, ...FALLBACK_MODELS]));

      let lastErr: Error | null = null;
      for (const model of candidates) {
        try {
          const parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> =
            [{ text: args.prompt }];

          if (args.inlineDataBase64 && args.inlineDataMimeType) {
            // Caller already fetched + encoded the asset.
            parts.push({
              inlineData: { mimeType: args.inlineDataMimeType, data: args.inlineDataBase64 },
            });
          } else if (args.inlineDataUrl && args.inlineDataMimeType) {
            // Fetch the asset + base64-encode it. Gemini accepts data inline.
            const res = await fetch(args.inlineDataUrl);
            if (!res.ok) throw new Error(`inlineData fetch ${args.inlineDataUrl} → ${res.status}`);
            const buf = await res.arrayBuffer();
            const b64 = Buffer.from(buf).toString('base64');
            parts.push({ inlineData: { mimeType: args.inlineDataMimeType, data: b64 } });
          }

          const body = {
            contents: [{ role: 'user', parts }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
            },
          };

          const res = await fetch(ENDPOINT(model), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify(body),
          });

          if (!res.ok) {
            const detail = await res.text().catch(() => '');
            throw new Error(`Gemini ${model} → ${res.status} ${detail.slice(0, 200)}`);
          }

          const json = (await res.json()) as {
            candidates?: Array<{
              content?: { parts?: Array<{ text?: string }> };
            }>;
          };

          const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!text) throw new Error(`Gemini ${model} returned no text`);

          const parsed = JSON.parse(text);
          return args.responseSchema.parse(parsed);
        } catch (err) {
          lastErr = err as Error;
          // Only fall through on a 404-like error (model not found).
          if (!/\b404\b/.test(lastErr.message)) throw lastErr;
        }
      }
      throw lastErr ?? new Error('Gemini exhausted all model candidates');
    },
  };
}

// Re-export Zod for strategies — saves them an import.
export { z };

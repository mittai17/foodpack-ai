import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppConfig } from '../config/configuration';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private readonly apiKey?: string;
  private readonly model: string;

  constructor(config: ConfigService) {
    const appConfig = config.get<AppConfig>('app')!;
    this.apiKey = appConfig.gemini.apiKey;
    this.model = appConfig.gemini.model;
  }

  get isConfigured(): boolean {
    return !!this.apiKey;
  }

  /**
   * Sends a prompt to Gemini and returns plain text, or null if Gemini is
   * not configured or the call fails. Never throws — the recommendation
   * pipeline must keep working without AI.
   */
  async generateText(systemInstruction: string, userPrompt: string): Promise<string | null> {
    if (!this.apiKey) return null;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
        }),
      });

      if (!response.ok) {
        this.logger.warn(`Gemini request failed: ${response.status} ${await response.text()}`);
        return null;
      }

      const body = (await response.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const text = body.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('');
      return text?.trim() || null;
    } catch (error) {
      this.logger.warn(`Gemini request error: ${(error as Error).message}`);
      return null;
    }
  }
}

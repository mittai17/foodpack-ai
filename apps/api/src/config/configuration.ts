export interface AppConfig {
  port: number;
  webOrigin: string;
  redisUrl: string;
  gemini: {
    apiKey?: string;
    model: string;
  };
  sentryDsn?: string;
}

export default (): { app: AppConfig } => ({
  app: {
    port: Number(process.env.PORT ?? 4000),
    webOrigin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
    gemini: {
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL ?? 'gemini-2.0-flash',
    },
    sentryDsn: process.env.SENTRY_DSN,
  },
});

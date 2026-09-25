import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'About' };

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-16 md:px-6">
      <h1 className="text-3xl font-semibold tracking-tight">About FoodPack AI</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          FoodPack AI is built for Smart India Hackathon problem statement{' '}
          <strong className="text-foreground">26236</strong> —{' '}
          <em>
            AI-Based Intelligent Food Packaging Material Recommendation System for Food
            Commodities
          </em>
          , proposed by the Ministry of Food Processing Industries (MoFPI).
        </p>
        <p>
          Improper packaging leads to moisture absorption, oxidation, microbial spoilage, and
          nutrient loss — and packaging material selection today depends heavily on expert
          knowledge that small food businesses, farmers, and startups often don&apos;t have easy
          access to.
        </p>
        <p>
          FoodPack AI translates simple, non-technical questions about a food commodity into the
          barrier, mechanical, and gas-exchange requirements that actually determine which
          packaging material and structure will work — using a validated knowledge base and a
          deterministic scoring engine, with an AI model used only to explain the result in plain
          language.
        </p>
        <p>
          It is designed as a decision-support tool to assist industries, farmers, startups, and
          researchers — not a replacement for experimental validation before commercial
          production.
        </p>
      </div>
    </div>
  );
}

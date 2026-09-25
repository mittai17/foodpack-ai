import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'How it works' };

const PIPELINE = [
  'User input',
  'Food knowledge base',
  'Food property resolver',
  'Requirement engine',
  'Packaging candidate generator',
  'Scientific rule engine & scoring',
  'Optimization (by your chosen objective)',
  'Final recommendation',
  'Gemini explanation',
];

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">How it works</h1>
        <p className="text-muted-foreground">
          The critical design decision behind FoodPack AI: the AI model never invents the
          recommendation. It only explains one that a deterministic pipeline already computed.
        </p>
      </div>

      <Card className="mt-10">
        <CardContent className="px-6 py-6">
          <div className="flex flex-wrap items-center gap-2">
            {PIPELINE.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs font-medium">
                  {step}
                </span>
                {i < PIPELINE.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Step
          n={1}
          title="Select your food"
          description="Choose a commodity from a validated database — no packaging jargon needed."
        />
        <Step
          n={2}
          title="Answer simple questions"
          description="Product state, storage, target shelf life, transport distance, and what matters most to you."
        />
        <Step
          n={3}
          title="Get your recommendation"
          description="A scored, explained recommendation with alternatives, cost, sustainability, and sources."
        />
      </div>
    </div>
  );
}

function Step({ n, title, description }: { n: number; title: string; description: string }) {
  return (
    <div className="space-y-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
        {n}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

import type { Metadata } from 'next';
import {
  Beaker,
  Calculator,
  FlaskConical,
  Gauge,
  Recycle,
  ScrollText,
  Sparkles,
  Wind,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = { title: 'Features' };

const FEATURES = [
  {
    icon: FlaskConical,
    title: 'Deterministic recommendation engine',
    description:
      'A rule-based requirement engine, candidate generator, and scoring/optimization pipeline — the material recommendation is computed, not guessed by a language model.',
    status: 'live' as const,
  },
  {
    icon: Wind,
    title: 'Fresh-produce respiration & MAP handling',
    description:
      'Fresh commodities factor in respiration rate and storage conditions, with Modified Atmosphere Packaging suggested only when it is genuinely appropriate.',
    status: 'live' as const,
  },
  {
    icon: Gauge,
    title: 'Transparent scoring',
    description:
      'Every candidate is scored on barrier fit, moisture protection, mechanical strength, sealability, shelf life, cost, sustainability, and MAP suitability — and you can see each number.',
    status: 'live' as const,
  },
  {
    icon: Calculator,
    title: 'Objective-driven optimization',
    description:
      'Choose maximum shelf life, lowest cost, more sustainable, or balanced — the scoring weights shift accordingly.',
    status: 'live' as const,
  },
  {
    icon: Beaker,
    title: 'Advanced Mode',
    description:
      'Professionals can override knowledge-base reference values with lab-measured moisture, pH, fat content, respiration rate, and measured OTR/WVTR.',
    status: 'live' as const,
  },
  {
    icon: Sparkles,
    title: 'AI-explained, not AI-decided',
    description:
      'Gemini turns the already-computed, structured recommendation into a short plain-English explanation. It never invents a material or a number.',
    status: 'live' as const,
  },
  {
    icon: Recycle,
    title: 'Cost & sustainability insight',
    description:
      'Indicative cost ranges and recyclability / mono-material / biodegradability signals for every candidate.',
    status: 'live' as const,
  },
  {
    icon: ScrollText,
    title: '3D packaging viewer, PDF reports, RAG evidence search',
    description:
      'An interactive exploded-layer 3D view, downloadable PDF reports, and semantic search over research documents are on the roadmap.',
    status: 'roadmap' as const,
  },
];

export default function FeaturesPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-6">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Features</h1>
        <p className="text-muted-foreground">
          FoodPack AI is a decision-support platform, not a chatbot. Here is what actually powers a
          recommendation today, and what is coming next.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2">
        {FEATURES.map((feature) => (
          <Card key={feature.title}>
            <CardContent className="space-y-2 px-6 py-6">
              <div className="flex items-center justify-between">
                <feature.icon className="h-5 w-5 text-primary" />
                <Badge variant={feature.status === 'live' ? 'secondary' : 'outline'}>
                  {feature.status === 'live' ? 'Live' : 'Roadmap'}
                </Badge>
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

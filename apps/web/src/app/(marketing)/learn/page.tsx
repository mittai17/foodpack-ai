import type { Metadata } from 'next';
import { Card, CardContent } from '@/components/ui/card';

export const metadata: Metadata = { title: 'Learn' };

const GLOSSARY = [
  {
    term: 'OTR — Oxygen Transmission Rate',
    definition:
      'How much oxygen passes through a packaging film per day, per unit area (cc/m²/day). Lower OTR means a stronger oxygen barrier — important for oxidation-sensitive foods like nuts, chips, and coffee.',
  },
  {
    term: 'WVTR — Water Vapor Transmission Rate',
    definition:
      'How much moisture vapor passes through a film per day, per unit area (g/m²/day). Dry goods need a low WVTR to stay dry; some fresh produce actually needs a moderate WVTR to avoid condensation.',
  },
  {
    term: 'MAP — Modified Atmosphere Packaging',
    definition:
      'Packaging that alters the internal gas composition (O2, CO2) around a fresh product to slow respiration and extend shelf life — done via breathable or micro-perforated films matched to the commodity\'s respiration rate.',
  },
  {
    term: 'Respiration rate',
    definition:
      'Fresh fruits and vegetables keep "breathing" after harvest, consuming O2 and producing CO2. Packaging must let enough gas exchange happen — too little causes anaerobic spoilage, too much wastes the benefit of MAP.',
  },
  {
    term: 'Mono-material construction',
    definition:
      'A package built from a single material (rather than a multilayer laminate) is much easier to recycle — a smaller number of distinct materials is one of the sustainability signals FoodPack AI scores.',
  },
  {
    term: 'Water activity (aw)',
    definition:
      'A measure (0–1) of how much "free" water is available for microbial growth in a food — distinct from moisture content, and a strong predictor of shelf-life risk.',
  },
];

export default function LearnPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 md:px-6">
      <div className="max-w-2xl space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">Learn</h1>
        <p className="text-muted-foreground">
          A short glossary of the packaging-science terms behind every recommendation — so the
          numbers on your results page actually mean something.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {GLOSSARY.map((item) => (
          <Card key={item.term}>
            <CardContent className="space-y-1.5 px-5 py-5">
              <h3 className="font-semibold">{item.term}</h3>
              <p className="text-sm text-muted-foreground">{item.definition}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

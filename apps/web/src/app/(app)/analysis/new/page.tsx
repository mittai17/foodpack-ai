import { Suspense } from 'react';
import { AnalysisWizard } from './wizard';

export const metadata = { title: 'New Analysis' };

export default function NewAnalysisPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">New Packaging Analysis</h1>
        <p className="text-sm text-muted-foreground">
          Answer a few simple questions — we&apos;ll translate them into packaging requirements.
        </p>
      </div>
      <Suspense fallback={null}>
        <AnalysisWizard />
      </Suspense>
    </div>
  );
}

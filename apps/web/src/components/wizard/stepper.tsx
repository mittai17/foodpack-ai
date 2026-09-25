import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface StepDef {
  label: string;
  description: string;
}

export function Stepper({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-x-6 gap-y-3">
      {steps.map((step, index) => {
        const state = index < current ? 'done' : index === current ? 'active' : 'upcoming';
        return (
          <li key={step.label} className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
                state === 'done' && 'bg-primary text-primary-foreground',
                state === 'active' && 'bg-primary text-primary-foreground',
                state === 'upcoming' && 'bg-secondary text-muted-foreground',
              )}
            >
              {state === 'done' ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <div>
              <p className={cn('text-sm font-medium', state === 'upcoming' && 'text-muted-foreground')}>
                {step.label}
              </p>
              <p className="text-xs text-muted-foreground">{step.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

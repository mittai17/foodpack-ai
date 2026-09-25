import { FileText } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export const metadata = { title: 'Reports' };

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Reports</h1>
        <p className="text-sm text-muted-foreground">PDF export of your packaging analyses.</p>
      </div>
      <ComingSoon
        icon={FileText}
        title="PDF report generation is on the roadmap"
        description="Once available, every completed analysis will export a report covering requirements, the recommendation, alternatives, cost, sustainability, and cited sources."
      />
    </div>
  );
}

import { Bookmark } from 'lucide-react';
import { ComingSoon } from '@/components/layout/coming-soon';

export const metadata = { title: 'Saved' };

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Saved</h1>
        <p className="text-sm text-muted-foreground">Bookmark recommendations to compare later.</p>
      </div>
      <ComingSoon
        icon={Bookmark}
        title="Saved items are on the roadmap"
        description="In the meantime, organize related analyses using My Projects."
      />
    </div>
  );
}

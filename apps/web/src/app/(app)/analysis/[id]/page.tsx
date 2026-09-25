import { AnalysisResult } from './analysis-result';

export const metadata = { title: 'Packaging Recommendation' };

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnalysisResult id={id} />;
}

import { MaterialDetail } from './material-detail';

export default async function MaterialDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <MaterialDetail slug={slug} />;
}

import { FoodDetail } from './food-detail';

export default async function FoodDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <FoodDetail slug={slug} />;
}

import { redirect } from 'next/navigation';

type Params = Promise<{ id: string }>;

export default async function DeckRedirect({ params }: { params: Params }) {
  const { id } = await params;
  redirect(`/d/${id}/edit`);
}

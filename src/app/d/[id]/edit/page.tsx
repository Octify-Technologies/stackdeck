import type { Metadata } from 'next';

import { Editor } from '@/editor/Editor';
import '@/editor/editor.css';

export const metadata: Metadata = {
  title: 'Editor',
};

type Params = Promise<{ id: string }>;

export default async function EditDeckPage({ params }: { params: Params }) {
  const { id } = await params;
  return <Editor deckId={id} />;
}

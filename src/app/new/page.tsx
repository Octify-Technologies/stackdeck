import type { Metadata } from 'next';

import { NewDeckGallery } from './NewDeckGallery';
import '@/app/templates/templates.css';

export const metadata: Metadata = {
  title: 'New deck — pick a template',
};

export default function NewDeckPage() {
  return <NewDeckGallery />;
}

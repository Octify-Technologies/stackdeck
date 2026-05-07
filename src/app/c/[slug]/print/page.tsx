import { notFound } from 'next/navigation';
import { getCaseStudy } from '@/lib/case-studies';
import { PrintDoc } from './PrintDoc';
import './print.css';

export default async function PrintPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();
  return <PrintDoc slug={slug} title={study.title} slides={study.slides} />;
}

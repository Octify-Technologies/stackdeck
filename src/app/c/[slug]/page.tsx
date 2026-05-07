import { notFound } from 'next/navigation';
import { getCaseStudy, listCaseStudies } from '@/lib/case-studies';
import { Viewer } from '@/components/Viewer';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  const studies = await listCaseStudies();
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};
  return {
    title: study.title,
    description: study.summary ?? `Octify case study, ${study.client ?? ''}`.trim(),
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  return (
    <Viewer slug={study.slug} title={study.title} client={study.client} slides={study.slides} />
  );
}

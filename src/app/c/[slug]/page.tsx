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
  const titleSuffix = study.client ? `${study.client} · Octify Case Study` : 'Octify Case Study';
  const description =
    study.summary ?? `Octify case study${study.client ? ` for ${study.client}` : ''}.`;
  return {
    title: `${study.title} · ${titleSuffix}`,
    description,
    openGraph: {
      title: `${study.title}${study.client ? ` — ${study.client}` : ''}`,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description,
    },
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

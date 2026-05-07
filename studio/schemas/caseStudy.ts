import { defineField, defineType } from 'sanity';

export const caseStudy = defineType({
  name: 'caseStudy',
  title: 'Case Study',
  type: 'document',
  fieldsets: [
    { name: 'meta', title: 'Metadata', options: { collapsible: true, collapsed: false } },
    { name: 'content', title: 'Slides', options: { collapsible: false } },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Deck title',
      type: 'string',
      validation: (r) => r.required().max(120),
      fieldset: 'meta',
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      description: 'Public URL is /c/<slug>. Use kebab-case, e.g. acme-churn.',
      type: 'slug',
      options: { source: 'title', maxLength: 64 },
      validation: (r) => r.required(),
      fieldset: 'meta',
    }),
    defineField({
      name: 'client',
      title: 'Client name',
      type: 'string',
      fieldset: 'meta',
    }),
    defineField({
      name: 'industry',
      title: 'Industry',
      type: 'string',
      fieldset: 'meta',
    }),
    defineField({
      name: 'date',
      title: 'Project date',
      type: 'date',
      fieldset: 'meta',
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      fieldset: 'meta',
    }),
    defineField({
      name: 'summary',
      title: 'Summary',
      description: 'One or two sentences. Shown on the homepage and in social previews.',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(280),
      fieldset: 'meta',
    }),
    defineField({
      name: 'visibility',
      title: 'Visibility',
      type: 'string',
      initialValue: 'public',
      options: {
        list: [
          { title: 'Public — listed on homepage', value: 'public' },
          { title: 'Unlisted — direct link only', value: 'private' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
      fieldset: 'meta',
    }),
    defineField({
      name: 'coverIndex',
      title: 'Cover slide',
      description:
        'Zero-indexed slide used as the cover thumbnail on the homepage. Defaults to the first slide.',
      type: 'number',
      initialValue: 0,
      validation: (r) => r.min(0).integer(),
      fieldset: 'meta',
    }),
    defineField({
      name: 'slides',
      title: 'Slides',
      description:
        'Each slide is a complete <!doctype html> document at 1920×1080 with inlined CSS and system fonts. See the authoring contract in CLAUDE.md.',
      type: 'array',
      validation: (r) => r.min(1),
      of: [
        defineField({
          name: 'slide',
          title: 'Slide',
          type: 'object',
          fields: [
            defineField({
              name: 'title',
              title: 'Slide title',
              type: 'string',
              description:
                'Optional. Shown in the sidebar Contents and the bottom caption — not rendered into the slide itself.',
            }),
            defineField({
              name: 'html',
              title: 'Slide HTML',
              type: 'text',
              rows: 24,
              description:
                'Paste the full <!doctype html>...</html> document. Body must be 1920×1080 with overflow:hidden. Do not reference external CSS, fonts, or scripts.',
              validation: (r) =>
                r.required().custom((value) => {
                  if (!value) return 'Slide HTML is required';
                  const lower = String(value).toLowerCase();
                  if (!lower.includes('<!doctype'))
                    return 'Must be a complete HTML document starting with <!doctype html>';
                  if (!lower.includes('1920px')) return 'Body must specify width: 1920px';
                  return true;
                }),
            }),
          ],
          preview: {
            select: { title: 'title' },
            prepare({ title }) {
              return { title: title || 'Untitled slide' };
            },
          },
        }),
      ],
      fieldset: 'content',
    }),
  ],
  preview: {
    select: { title: 'title', client: 'client', visibility: 'visibility' },
    prepare({ title, client, visibility }) {
      return {
        title: title || 'Untitled deck',
        subtitle: [client, visibility === 'private' ? '· unlisted' : null]
          .filter(Boolean)
          .join(' '),
      };
    },
  },
  orderings: [
    {
      title: 'Project date, newest first',
      name: 'dateDesc',
      by: [{ field: 'date', direction: 'desc' }],
    },
  ],
});

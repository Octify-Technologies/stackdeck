type InsertItem = {
  label: string;
  description: string;
  snippet: string;
};

export const INSERT_ITEMS: InsertItem[] = [
  {
    label: 'New slide',
    description: 'Add a slide break',
    snippet: '\n\n::slide\n\n',
  },
  {
    label: 'Cover',
    description: 'Title slide for your deck',
    snippet: '\n\n::cover\n# Your title.\nA short subtitle.\n::\n',
  },
  {
    label: 'Section break',
    description: 'Transition between deck parts',
    snippet: '\n\n::section\n# Section name.\n::\n',
  },
  {
    label: 'Stats row',
    description: '2 to 6 numbers across',
    snippet:
      '\n\n::stats\n::stat{value="$3M" label="ARR" delta="+47%" trend="up"}\n::stat{value="71" label="NPS" delta="+9" trend="up"}\n::stat{value="12" label="Markets" delta="+5" trend="up"}\n::\n',
  },
  {
    label: 'KPI grid',
    description: '4 to 8 numbers in a grid',
    snippet:
      '\n\n::kpis\n::stat{value="$3M" label="ARR"}\n::stat{value="47%" label="MoM"}\n::stat{value="71" label="NPS"}\n::stat{value="12" label="Markets"}\n::\n',
  },
  {
    label: 'Compare',
    description: 'Two-sided before/after',
    snippet: '\n\n::compare\n**Before**\n\nThe old way.\n\n:::\n\n**After**\n\nThe new way.\n::\n',
  },
  {
    label: '2 columns',
    description: 'Two-column block',
    snippet: '\n\n::columns{count=2}\nLeft column.\n\n:::\n\nRight column.\n::\n',
  },
  {
    label: '3 columns',
    description: 'Three-column block',
    snippet: '\n\n::columns{count=3}\nFirst.\n\n:::\n\nSecond.\n\n:::\n\nThird.\n::\n',
  },
  {
    label: '2x2 grid',
    description: 'Four cells',
    snippet:
      '\n\n::grid{cols=2 rows=2}\nTop-left.\n\nTop-right.\n\nBottom-left.\n\nBottom-right.\n::\n',
  },
  {
    label: 'Callout',
    description: 'Highlighted note',
    snippet: '\n\n::callout{tone=info}\nThis is the key takeaway.\n::\n',
  },
  {
    label: 'Big quote',
    description: 'Full-bleed takeover quote',
    snippet: '\n\n::quote.big\n> The future is already here.\n> -- William Gibson\n::\n',
  },
  {
    label: 'Bullet list',
    description: 'Markdown unordered list',
    snippet: '\n\n- First point\n- Second point\n- Third point\n',
  },
  {
    label: 'Numbered steps',
    description: 'Ordered procedure',
    snippet: '\n\n::steps\n1. First step.\n2. Second step.\n3. Third step.\n::\n',
  },
  {
    label: 'Code block',
    description: 'Fenced code with syntax',
    snippet: '\n\n```ts\nconst x = 1;\n```\n',
  },
  {
    label: 'Bar chart',
    description: 'Horizontal bars with labels and values',
    snippet:
      '\n\n::chart{kind=bar title="Revenue by quarter"}\nQ1: 120\nQ2: 165\nQ3: 210\nQ4: 280\n::\n',
  },
  {
    label: 'Line chart',
    description: 'Trend over time',
    snippet:
      '\n\n::chart{kind=line title="Active users"}\nJan: 1200\nFeb: 1450\nMar: 1820\nApr: 2240\nMay: 2810\nJun: 3380\n::\n',
  },
  {
    label: 'Donut chart',
    description: 'Share / breakdown',
    snippet:
      '\n\n::chart{kind=donut title="Revenue mix"}\nProduct: 45\nServices: 30\nLicensing: 15\nOther: 10\n::\n',
  },
  {
    label: 'Table',
    description: 'Headered grid of rows and columns',
    snippet:
      '\n\n::table{emphasize=2}\n| Plan | Seats | Price |\n| Starter | 1 | $0 |\n| Pro | 5 | $20 |\n| Team | 25 | $80 |\n| Enterprise | unlimited | Contact us |\n::\n',
  },
];

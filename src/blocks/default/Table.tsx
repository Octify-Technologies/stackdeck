import type { Table as TableBlock } from '@/ir/schema';

export function Table({ block }: { block: TableBlock }) {
  return (
    <div className="block-table-wrap">
      <table className="block-table">
        <thead>
          <tr>
            {block.headers.map((h, i) => (
              <th key={i} data-emphasize={i === block.emphasizeColumn ? 'true' : undefined}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} data-emphasize={ci === block.emphasizeColumn ? 'true' : undefined}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

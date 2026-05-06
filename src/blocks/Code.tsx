import type { Code as CodeBlock } from '@/ir/schema';

export function Code({ block }: { block: CodeBlock }) {
  return (
    <pre className="block block-code">
      <code data-language={block.language ?? ''}>{block.content}</code>
    </pre>
  );
}

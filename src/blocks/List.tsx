import type { List as ListBlock, ListItem } from '@/ir/schema';

import { InlineText } from './InlineText';

function ListItems({ items }: { items: ListItem[] }) {
  return (
    <>
      {items.map((item, idx) => (
        <li key={idx}>
          <InlineText text={item.text} />
          {item.children && item.children.length > 0 ? (
            <ul>
              <ListItems items={item.children} />
            </ul>
          ) : null}
        </li>
      ))}
    </>
  );
}

export function List({ block }: { block: ListBlock }) {
  const Tag = block.ordered ? 'ol' : 'ul';
  const className = `block block-list ${
    block.ordered ? 'block-list-ordered' : 'block-list-unordered'
  }`;
  return (
    <Tag className={className}>
      <ListItems items={block.items} />
    </Tag>
  );
}

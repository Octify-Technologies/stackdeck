import type { ElementType, HTMLAttributes, ReactNode } from 'react';

import './typography.css';

type AsProp<T extends ElementType> = { as?: T };
type Cls = { className?: string };

type HeadingSize = 'xl' | 'lg' | 'md';
type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function Heading({
  level = 1,
  size = 'lg',
  className,
  children,
  ...rest
}: {
  level?: HeadingLevel;
  size?: HeadingSize;
  children: ReactNode;
} & Cls &
  HTMLAttributes<HTMLHeadingElement>) {
  const Tag = `h${level}` as 'h1';
  return (
    <Tag className={cx('t-heading', `t-heading--${size}`, className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Subheading({
  as: Tag = 'p',
  className,
  children,
  ...rest
}: AsProp<'p' | 'div' | 'span' | 'h2' | 'h3'> &
  Cls &
  HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <Tag className={cx('t-subheading', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Body({
  as: Tag = 'p',
  muted,
  strong,
  className,
  children,
  ...rest
}: AsProp<'p' | 'div' | 'span'> &
  Cls &
  HTMLAttributes<HTMLElement> & {
    muted?: boolean;
    strong?: boolean;
    children: ReactNode;
  }) {
  return (
    <Tag
      className={cx(
        't-body',
        muted ? 't-body--muted' : null,
        strong ? 't-body--strong' : null,
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Caption({
  as: Tag = 'p',
  muted,
  className,
  children,
  ...rest
}: AsProp<'p' | 'div' | 'span'> &
  Cls &
  HTMLAttributes<HTMLElement> & { muted?: boolean; children: ReactNode }) {
  return (
    <Tag className={cx('t-caption', muted ? 't-caption--muted' : null, className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Mono({
  as: Tag = 'span',
  className,
  children,
  ...rest
}: AsProp<'span' | 'p' | 'div'> & Cls & HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <Tag className={cx('t-mono', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Label({
  as: Tag = 'span',
  className,
  children,
  ...rest
}: AsProp<'span' | 'p' | 'div'> & Cls & HTMLAttributes<HTMLElement> & { children: ReactNode }) {
  return (
    <Tag className={cx('t-label', className)} {...rest}>
      {children}
    </Tag>
  );
}

function cx(...parts: Array<string | null | undefined | false>): string {
  return parts.filter(Boolean).join(' ');
}

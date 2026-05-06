import Link from 'next/link';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentPropsWithoutRef,
  ReactNode,
} from 'react';

import './button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'link' | 'danger';
export type ButtonSize = 'md' | 'sm' | 'xs';

type SharedProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  className?: string;
  children: ReactNode;
};

type ButtonAsButton = SharedProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'> & {
    as?: 'button';
  };

type ButtonAsAnchor = SharedProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'children' | 'className' | 'href'> & {
    as: 'a';
    href: string;
  };

type ButtonAsLink = SharedProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, 'children' | 'className' | 'href'> & {
    as: 'link';
    href: ComponentPropsWithoutRef<typeof Link>['href'];
  };

export type ButtonProps = ButtonAsButton | ButtonAsAnchor | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { variant = 'secondary', size = 'md', iconOnly = false, className, children } = props;

  const cls = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : null,
    iconOnly ? 'btn--icon' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (props.as === 'a') {
    const {
      variant: _v,
      size: _s,
      iconOnly: _i,
      className: _c,
      children: _ch,
      as: _a,
      ...rest
    } = props;
    void _v;
    void _s;
    void _i;
    void _c;
    void _ch;
    void _a;
    return (
      <a className={cls} {...rest}>
        {children}
      </a>
    );
  }

  if (props.as === 'link') {
    const {
      variant: _v,
      size: _s,
      iconOnly: _i,
      className: _c,
      children: _ch,
      as: _a,
      ...rest
    } = props;
    void _v;
    void _s;
    void _i;
    void _c;
    void _ch;
    void _a;
    return (
      <Link className={cls} {...rest}>
        {children}
      </Link>
    );
  }

  const {
    variant: _v,
    size: _s,
    iconOnly: _i,
    className: _c,
    children: _ch,
    as: _a,
    type,
    ...rest
  } = props;
  void _v;
  void _s;
  void _i;
  void _c;
  void _ch;
  void _a;
  return (
    <button type={type ?? 'button'} className={cls} {...rest}>
      {children}
    </button>
  );
}

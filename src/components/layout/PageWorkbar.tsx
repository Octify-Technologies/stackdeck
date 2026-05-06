import type { ReactNode } from 'react';

import { Heading, Mono, Body } from '@/components/primitives/Text';

import { BackLink } from './BackLink';

import './page.css';

export function PageWorkbar({
  back,
  title,
  count,
  subtitle,
  actions,
}: {
  back?: { href: string; label: string; ariaLabel?: string };
  title: ReactNode;
  count?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  const showRight = actions || subtitle;
  return (
    <div className="page-workbar">
      <div className="page-bar-inner">
        <div className="page-workbar__left">
          {back ? (
            <BackLink href={back.href} ariaLabel={back.ariaLabel}>
              {back.label}
            </BackLink>
          ) : null}
          <Heading size="lg">{title}</Heading>
          {count != null ? <Mono aria-live="polite">{count}</Mono> : null}
        </div>
        {showRight ? (
          <div className="page-workbar__right">
            {actions}
            {subtitle ? (
              <Body as="p" muted className="page-workbar__subtitle">
                {subtitle}
              </Body>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

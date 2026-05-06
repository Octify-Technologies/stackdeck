'use client';

import { useEffect, useRef, useState } from 'react';

import { INSERT_ITEMS } from './insert-items';

type Props = {
  onInsert: (snippet: string) => void;
};

/**
 * Floating "+" pill anchored to the bottom-right of the source pane.
 * Opens an upward-anchored panel listing all insert snippets. The same set
 * of snippets is also available via the slash command in the editor.
 */
export function InsertMenu({ onInsert }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div className="insert-menu" ref={ref}>
      <button
        type="button"
        className={`insert-menu__pill ${open ? 'insert-menu__pill--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Insert block"
        title="Insert block (or type / in the editor)"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
          <path d="M7 3v8M3 7h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
        <span>Insert</span>
        <kbd className="insert-menu__kbd">/</kbd>
      </button>
      {open ? (
        <div className="insert-menu__panel" role="menu">
          <div className="insert-menu__panel-head">
            <span>Insert block</span>
            <span className="insert-menu__panel-hint">type / in editor</span>
          </div>
          <div className="insert-menu__panel-list">
            {INSERT_ITEMS.map((item) => (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className="insert-menu__item"
                onClick={() => {
                  onInsert(item.snippet);
                  setOpen(false);
                }}
              >
                <span className="insert-menu__item-label">{item.label}</span>
                <span className="insert-menu__item-desc">{item.description}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

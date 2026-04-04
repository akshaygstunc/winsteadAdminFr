'use client';

import { ReactNode, useEffect } from 'react';
import clsx from 'clsx';

export function Modal({
  open,
  title,
  subtitle,
  onClose,
  children,
  size = 'lg',
}: {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  size?: 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = {
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <button className="absolute inset-0 cursor-default" aria-label="Close modal backdrop" type="button" onClick={onClose} />
      <div className={clsx('relative w-full overflow-hidden rounded-[30px] border border-line bg-card shadow-2xl', widths[size])}>
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-gold">Admin Form</p>
            <h3 className="mt-2 text-xl font-semibold text-text">{title}</h3>
            {subtitle ? <p className="mt-2 text-sm text-muted">{subtitle}</p> : null}
          </div>
          <button className="rounded-2xl border border-line px-4 py-2 text-sm text-muted transition hover:border-gold/40 hover:text-text" onClick={onClose} type="button">Close</button>
        </div>
        <div className="max-h-[80vh] overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

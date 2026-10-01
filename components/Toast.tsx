'use client';

import { useEffect, useState } from 'react';
import { useRelease } from '@/lib/release-context';
import type { ToastPayload } from '@/lib/types';

/**
 * The `#toast` element from the static site, driven by the release store.
 * The previous message is kept while it slides out so the exit never blanks.
 */
export default function Toast() {
  const { toast, hideToast } = useRelease();
  const [shown, setShown] = useState<ToastPayload | null>(null);

  useEffect(() => {
    if (toast) setShown(toast);
  }, [toast]);

  const visible = !!toast && !!shown;

  return (
    <div className={`toast${visible ? ' show' : ''}`} id="toast" role="status" aria-live="polite">
      {shown ? (
        <>
          <span className="toast-msg">{shown.message}</span>
          {shown.actions.length > 0 && (
            <div className="toast-actions">
              {shown.actions.map((action) =>
                action.href ? (
                  <a
                    key={action.label}
                    className="toast-btn"
                    href={action.href}
                    target="_blank"
                    rel="noopener"
                    onClick={() => {
                      hideToast();
                      action.onClick?.();
                    }}
                  >
                    {action.label}
                  </a>
                ) : (
                  <button
                    key={action.label}
                    type="button"
                    className="toast-btn"
                    onClick={() => {
                      hideToast();
                      action.onClick?.();
                    }}
                  >
                    {action.label}
                  </button>
                ),
              )}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}

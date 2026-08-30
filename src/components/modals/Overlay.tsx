import type { ReactNode } from 'react';
import { useUIStore } from '../../store/uiStore';

export function OverlayScrim() {
  const close = useUIStore((s) => s.close);
  return <div className="mar-overlay-scrim" onClick={close} />;
}

export function CenterModal({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div className="mar-center-modal" style={{ width, maxWidth: 'calc(100vw - 32px)' }}>
      {children}
    </div>
  );
}

export function SideDrawer({ width, children }: { width: number; children: ReactNode }) {
  return (
    <div className="mar-side-drawer" style={{ width: `min(${width}px, 100vw)` }}>
      {children}
    </div>
  );
}

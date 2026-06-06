import React, {useCallback, useEffect, useRef, useState} from 'react';
import Mermaid from '@theme-original/Mermaid';
import type MermaidType from '@theme-original/Mermaid';
import type {WrapperProps} from '@docusaurus/types';
import styles from './styles.module.css';

type Props = WrapperProps<typeof MermaidType>;

const MIN_SCALE = 0.2;
const MAX_SCALE = 50;
const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

/**
 * Wraps the built-in Mermaid renderer to add pan / zoom / fullscreen.
 * - Toolbar buttons: zoom in, zoom out, reset, fullscreen.
 * - Drag to pan; ctrl/cmd + wheel to zoom (plain wheel zooms in fullscreen).
 * Pure CSS-transform overlay — no extra dependencies, original SVG untouched.
 */
export default function MermaidWrapper(props: Props): React.ReactNode {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [isFullscreen, setFullscreen] = useState(false);
  const drag = useRef<{x: number; y: number; tx: number; ty: number} | null>(null);

  const reset = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, []);

  // Track entering/leaving fullscreen; snap back to default view on exit.
  useEffect(() => {
    const onChange = () => {
      const fs = document.fullscreenElement === containerRef.current;
      setFullscreen(fs);
      if (!fs) reset();
    };
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, [reset]);

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void el.requestFullscreen?.();
    }
  }, []);

  // Cursor-anchored wheel zoom via a non-passive listener so preventDefault works.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      // Inline: only zoom with a modifier so normal page scroll is preserved.
      if (!document.fullscreenElement && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      setScale((prev) => {
        const next = clamp(prev * (e.deltaY < 0 ? 1.1 : 1 / 1.1));
        const ratio = next / prev;
        setTx((p) => cx - ratio * (cx - p));
        setTy((p) => cy - ratio * (cy - p));
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, {passive: false});
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    drag.current = {x: e.clientX, y: e.clientY, tx, ty};
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    setTx(drag.current.tx + (e.clientX - drag.current.x));
    setTy(drag.current.ty + (e.clientY - drag.current.y));
  };
  const endDrag = () => {
    drag.current = null;
  };

  const btn: React.CSSProperties = {
    width: 30,
    height: 30,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--ifm-color-emphasis-300)',
    borderRadius: 6,
    background: 'var(--ifm-background-color)',
    color: 'var(--ifm-font-color-base)',
    cursor: 'pointer',
    fontSize: 16,
    lineHeight: 1,
    padding: 0,
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid var(--ifm-color-emphasis-300)',
        borderRadius: 8,
        background: 'var(--ifm-background-surface-color)',
        height: isFullscreen ? '100vh' : undefined,
      }}>
      <div
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          display: 'flex',
          gap: 4,
        }}>
        <button type="button" style={{...btn, width: 'auto', padding: '0 8px', fontSize: 12}} title="Reset view" onClick={reset}>
          Reset
        </button>
        <button type="button" style={{...btn, width: 'auto', padding: '0 8px', fontSize: 12}} title="Toggle fullscreen" onClick={toggleFullscreen}>
          {isFullscreen ? 'Exit' : '⛶ Full'}
        </button>
      </div>
      <div
        className={styles.content}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        style={{
          transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
          transformOrigin: '0 0',
          cursor: drag.current ? 'grabbing' : 'grab',
          touchAction: 'none',
          userSelect: 'none',
          display: 'flex',
          justifyContent: 'center',
          height: isFullscreen ? '100vh' : undefined,
          alignItems: isFullscreen ? 'center' : undefined,
        }}>
        <Mermaid {...props} />
      </div>
    </div>
  );
}

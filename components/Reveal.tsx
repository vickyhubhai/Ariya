'use client';

import type { ComponentType, ElementType, HTMLAttributes, ReactNode, RefObject } from 'react';
import { useReveal } from '@/lib/hooks';

type RevealHostProps = HTMLAttributes<HTMLElement> & { ref?: RefObject<HTMLElement | null> };

interface RevealProps extends HTMLAttributes<HTMLElement> {
  /** Element to render; keeps the original tag structure of the static site. */
  as?: ElementType;
  /** Maps to the `.reveal-delay-N` classes (1-6). */
  delay?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: ReactNode;
}

/**
 * Scroll-in entrance, replacing the global `.reveal` IntersectionObserver.
 * Respects `prefers-reduced-motion` (the stylesheet neutralises the transform)
 * and degrades to "always visible" without IntersectionObserver support.
 */
export default function Reveal({ as, delay, className = '', children, ...rest }: RevealProps) {
  // The tag varies per call site (div/section/h2...), so it is narrowed to one
  // host-prop signature; typing it as ElementType makes JSX build a union of
  // every intrinsic element and blows past the compiler's complexity limit.
  const Tag = (as ?? 'div') as unknown as ComponentType<RevealHostProps>;
  const { ref, visible } = useReveal<HTMLElement>();

  const classes = ['reveal', delay ? `reveal-delay-${delay}` : '', visible ? 'visible' : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Tag ref={ref} className={classes} {...rest}>
      {children}
    </Tag>
  );
}

import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface AvatarProps {
  /** Two-letter monogram. */
  monogram: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'neutral' | 'ink' | 'cobalt';
  /** Small glyph in the bottom-right corner (e.g. channel mark). */
  glyph?: ReactNode;
  className?: string;
  title?: string;
}

export function Avatar({ monogram, size = 'md', tone = 'neutral', glyph, className, title }: AvatarProps) {
  return (
    <span className={cn('avatar', size !== 'md' && `avatar--${size}`, tone !== 'neutral' && `avatar--${tone}`, className)} title={title} aria-hidden="true">
      {monogram.slice(0, 2).toUpperCase()}
      {glyph ? <span className="avatar__glyph">{glyph}</span> : null}
    </span>
  );
}

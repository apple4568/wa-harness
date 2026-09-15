import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'outline' | 'cobalt' | 'mint' | 'success' | 'warning' | 'error' | 'ink';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  mono?: boolean;
  size?: 'sm' | 'md';
  children: ReactNode;
}

export function Badge({ tone = 'neutral', mono = false, size = 'sm', className, children, ...rest }: BadgeProps) {
  return (
    <span className={cn('badge', `badge--${tone}`, mono && 'badge--mono', size === 'md' && 'badge--md', className)} {...rest}>
      {children}
    </span>
  );
}

export function Count({ value, tone = 'cobalt', className }: { value: number; tone?: 'cobalt' | 'warning' | 'neutral'; className?: string }) {
  if (value <= 0) return null;
  return <span className={cn('count', tone !== 'cobalt' && `count--${tone}`, className)}>{value > 99 ? '99+' : value}</span>;
}

export function Dot({ tone = 'neutral', className, title }: { tone?: 'neutral' | 'success' | 'warning' | 'error' | 'cobalt' | 'mint'; className?: string; title?: string }) {
  return <span className={cn('dot', tone !== 'neutral' && `dot--${tone}`, className)} title={title} aria-hidden={title ? undefined : true} />;
}

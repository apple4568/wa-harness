import { clsx, type ClassValue } from 'clsx';

/** Class-name joiner (clsx wrapper). Keeps component markup terse. */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

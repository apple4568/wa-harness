import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Leading icon (16 px). */
  leading?: ReactNode;
  trailing?: ReactNode;
  wrapperClassName?: string;
}

/** Text input wrapped in a bordered field so icons sit inside the border. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ leading, trailing, className, wrapperClassName, ...rest }, ref) {
  return (
    <div className={cn('input', wrapperClassName)}>
      {leading}
      <input ref={ref} className={className} {...rest} />
      {trailing}
    </div>
  );
});

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { forwardRef, useId, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const Switch = forwardRef<ElementRef<typeof SwitchPrimitive.Root>, ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(
  function Switch({ className, ...rest }, ref) {
    return (
      <SwitchPrimitive.Root ref={ref} className={cn('switch', className)} {...rest}>
        <SwitchPrimitive.Thumb className="switch__thumb" />
      </SwitchPrimitive.Root>
    );
  },
);

export interface SwitchFieldProps extends ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  label: ReactNode;
  labelPosition?: 'left' | 'right';
  testId?: string;
}

/** Switch with a clickable text label. */
export function SwitchField({ label, labelPosition = 'right', className, testId, id, ...rest }: SwitchFieldProps) {
  const autoId = useId();
  const switchId = id ?? autoId;
  return (
    <label className={cn('switch-field', className)} htmlFor={switchId}>
      {labelPosition === 'left' ? <span>{label}</span> : null}
      <Switch id={switchId} data-testid={testId} {...rest} />
      {labelPosition === 'right' ? <span>{label}</span> : null}
    </label>
  );
}

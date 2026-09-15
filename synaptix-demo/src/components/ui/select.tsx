import * as SelectPrimitive from '@radix-ui/react-select';
import { Check, ChevronDown } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const Select = SelectPrimitive.Root;
export const SelectValue = SelectPrimitive.Value;
export const SelectGroup = SelectPrimitive.Group;

export const SelectTrigger = forwardRef<ElementRef<typeof SelectPrimitive.Trigger>, ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & { onInk?: boolean }>(
  function SelectTrigger({ className, children, onInk, ...rest }, ref) {
    return (
      <SelectPrimitive.Trigger ref={ref} className={cn('select__trigger', onInk && 'select__trigger--on-ink', className)} {...rest}>
        {children}
        <SelectPrimitive.Icon asChild>
          <ChevronDown />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
    );
  },
);

export const SelectContent = forwardRef<ElementRef<typeof SelectPrimitive.Content>, ComponentPropsWithoutRef<typeof SelectPrimitive.Content>>(
  function SelectContent({ className, position = 'popper', sideOffset = 6, children, ...rest }, ref) {
    return (
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content ref={ref} position={position} sideOffset={sideOffset} collisionPadding={8} className={cn('select__content', className)} {...rest}>
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    );
  },
);

export const SelectItem = forwardRef<
  ElementRef<typeof SelectPrimitive.Item>,
  ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & { description?: ReactNode }
>(function SelectItem({ className, children, description, ...rest }, ref) {
  return (
    <SelectPrimitive.Item ref={ref} className={cn('select__item', className)} {...rest}>
      <span className="select__item-indicator">
        <SelectPrimitive.ItemIndicator>
          <Check />
        </SelectPrimitive.ItemIndicator>
      </span>
      <span>
        <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
        {description ? <span className="select__item-desc">{description}</span> : null}
      </span>
    </SelectPrimitive.Item>
  );
});

export function SelectLabel({ className, ...rest }: ComponentPropsWithoutRef<typeof SelectPrimitive.Label>) {
  return <SelectPrimitive.Label className={cn('menu__label label', className)} {...rest} />;
}

import * as DropdownPrimitive from '@radix-ui/react-dropdown-menu';
import { Check } from 'lucide-react';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '@/lib/cn';

export const DropdownMenu = DropdownPrimitive.Root;
export const DropdownMenuTrigger = DropdownPrimitive.Trigger;
export const DropdownMenuGroup = DropdownPrimitive.Group;
export const DropdownMenuRadioGroup = DropdownPrimitive.RadioGroup;

export const DropdownMenuContent = forwardRef<ElementRef<typeof DropdownPrimitive.Content>, ComponentPropsWithoutRef<typeof DropdownPrimitive.Content>>(
  function DropdownMenuContent({ className, align = 'start', sideOffset = 6, collisionPadding = 8, ...rest }, ref) {
    return (
      <DropdownPrimitive.Portal>
        <DropdownPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} collisionPadding={collisionPadding} className={cn('menu', className)} {...rest} />
      </DropdownPrimitive.Portal>
    );
  },
);

export const DropdownMenuItem = forwardRef<ElementRef<typeof DropdownPrimitive.Item>, ComponentPropsWithoutRef<typeof DropdownPrimitive.Item>>(
  function DropdownMenuItem({ className, ...rest }, ref) {
    return <DropdownPrimitive.Item ref={ref} className={cn('menu__item', className)} {...rest} />;
  },
);

export const DropdownMenuRadioItem = forwardRef<ElementRef<typeof DropdownPrimitive.RadioItem>, ComponentPropsWithoutRef<typeof DropdownPrimitive.RadioItem>>(
  function DropdownMenuRadioItem({ className, children, ...rest }, ref) {
    return (
      <DropdownPrimitive.RadioItem ref={ref} className={cn('menu__item', className)} {...rest}>
        <span className="menu__item-indicator">
          <DropdownPrimitive.ItemIndicator>
            <Check />
          </DropdownPrimitive.ItemIndicator>
        </span>
        {children}
      </DropdownPrimitive.RadioItem>
    );
  },
);

export const DropdownMenuCheckboxItem = forwardRef<ElementRef<typeof DropdownPrimitive.CheckboxItem>, ComponentPropsWithoutRef<typeof DropdownPrimitive.CheckboxItem>>(
  function DropdownMenuCheckboxItem({ className, children, ...rest }, ref) {
    return (
      <DropdownPrimitive.CheckboxItem ref={ref} className={cn('menu__item', className)} {...rest}>
        <span className="menu__item-indicator">
          <DropdownPrimitive.ItemIndicator>
            <Check />
          </DropdownPrimitive.ItemIndicator>
        </span>
        {children}
      </DropdownPrimitive.CheckboxItem>
    );
  },
);

export function DropdownMenuLabel({ className, ...rest }: ComponentPropsWithoutRef<typeof DropdownPrimitive.Label>) {
  return <DropdownPrimitive.Label className={cn('menu__label label', className)} {...rest} />;
}

export function DropdownMenuSeparator({ className, ...rest }: ComponentPropsWithoutRef<typeof DropdownPrimitive.Separator>) {
  return <DropdownPrimitive.Separator className={cn('menu__separator', className)} {...rest} />;
}

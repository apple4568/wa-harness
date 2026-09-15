import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from './button';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export interface DialogContentProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
  testId?: string;
}

/** Centered confirmation panel. Title + description are wired to Radix a11y labels. */
export function DialogContent({ title, description, children, footer, className, testId }: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="dialog__overlay" />
      <DialogPrimitive.Content className={cn('dialog', className)} data-testid={testId}>
        <div className="dialog__header">
          <div>
            <DialogPrimitive.Title className="dialog__title">{title}</DialogPrimitive.Title>
            {description ? <DialogPrimitive.Description className="dialog__description">{description}</DialogPrimitive.Description> : null}
          </div>
          <DialogPrimitive.Close asChild>
            <Button variant="ghost" size="sm" icon aria-label="Close">
              <X />
            </Button>
          </DialogPrimitive.Close>
        </div>
        {children ? <div className="dialog__body">{children}</div> : null}
        {footer ? <div className="dialog__footer">{footer}</div> : null}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef } from 'react';
import { cn } from '@/lib/cn';

export const Tabs = forwardRef<ElementRef<typeof TabsPrimitive.Root>, ComponentPropsWithoutRef<typeof TabsPrimitive.Root> & { onInk?: boolean }>(
  function Tabs({ className, onInk, ...rest }, ref) {
    return <TabsPrimitive.Root ref={ref} className={cn('tabs', onInk && 'tabs--on-ink', className)} {...rest} />;
  },
);

export const TabsList = forwardRef<ElementRef<typeof TabsPrimitive.List>, ComponentPropsWithoutRef<typeof TabsPrimitive.List>>(
  function TabsList({ className, ...rest }, ref) {
    return <TabsPrimitive.List ref={ref} className={cn('tabs__list', className)} {...rest} />;
  },
);

export const TabsTrigger = forwardRef<ElementRef<typeof TabsPrimitive.Trigger>, ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>>(
  function TabsTrigger({ className, ...rest }, ref) {
    return <TabsPrimitive.Trigger ref={ref} className={cn('tabs__trigger', className)} {...rest} />;
  },
);

export const TabsContent = TabsPrimitive.Content;

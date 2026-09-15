import { useMemo, useState, type ReactNode } from 'react';
import { TranslationContext } from './translationContext';

export function TranslationToggleProvider({ children, initial = true }: { children: ReactNode; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  const value = useMemo<[boolean, (v: boolean) => void]>(() => [on, setOn], [on]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

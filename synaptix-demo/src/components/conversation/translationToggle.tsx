import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/** UI-only preference: show the fixed Korean translation under customer/assistant messages. */
const TranslationContext = createContext<[boolean, (v: boolean) => void]>([true, () => {}]);

export function TranslationToggleProvider({ children, initial = true }: { children: ReactNode; initial?: boolean }) {
  const [on, setOn] = useState(initial);
  const value = useMemo<[boolean, (v: boolean) => void]>(() => [on, setOn], [on]);
  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslationToggle() {
  return useContext(TranslationContext);
}

import { createContext, useContext } from 'react';

/** UI-only preference: show the fixed Korean translation under customer/assistant messages. */
export const TranslationContext = createContext<[boolean, (v: boolean) => void]>([true, () => {}]);

export function useTranslationToggle() {
  return useContext(TranslationContext);
}

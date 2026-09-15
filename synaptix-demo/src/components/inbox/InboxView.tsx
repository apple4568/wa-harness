import { ConversationList } from './ConversationList';
import { Workspace } from '@/components/conversation/Workspace';
import { TranslationToggleProvider } from '@/components/conversation/translationToggle';

export function InboxView() {
  return (
    <TranslationToggleProvider>
      <div className="inbox" data-testid="view-inbox">
        <ConversationList />
        <Workspace />
      </div>
    </TranslationToggleProvider>
  );
}

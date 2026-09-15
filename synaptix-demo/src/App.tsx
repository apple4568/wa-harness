import { DemoProvider, useDemo } from '@/lib/store';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout/AppShell';
import { InboxView } from '@/components/inbox/InboxView';
import { KnowledgeView } from '@/components/knowledge/KnowledgeView';
import { SettingsView } from '@/components/settings/SettingsView';

function ViewSwitch() {
  const { state } = useDemo();
  switch (state.view) {
    case 'knowledge':
      return <KnowledgeView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <InboxView />;
  }
}

export default function App() {
  return (
    <DemoProvider>
      <TooltipProvider delayDuration={400} skipDelayDuration={200}>
        <AppShell>
          <ViewSwitch />
        </AppShell>
      </TooltipProvider>
    </DemoProvider>
  );
}

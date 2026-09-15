import { WorkingHoursSection } from './WorkingHoursSection';
import { AssistantSection, ConnectionsSection, EscalationSection } from './SettingsSections';
import '@/styles/views.css';

export function SettingsView() {
  return (
    <section className="view st" data-testid="settings-view" aria-label="Settings">
      <div className="st__col">
        <header className="st__heading">
          <h1 className="st__title">Settings</h1>
          <p className="st__subtitle">Working hours, escalation, connections and the assistant — all simulated for this demo.</p>
        </header>
        <WorkingHoursSection />
        <EscalationSection />
        <ConnectionsSection />
        <AssistantSection />
      </div>
    </section>
  );
}

export default SettingsView;

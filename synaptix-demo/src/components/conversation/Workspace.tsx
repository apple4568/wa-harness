import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useDemo } from '@/state/store';
import { selectCustomer, selectSelectedConversation } from '@/state/selectors';
import { ThreadHeader } from './ThreadHeader';
import { OwnershipBanner, AfterHoursBanner } from './Banners';
import { MessageList } from './MessageList';
import { Composer } from './Composer';
import { BookingPanel } from './BookingPanel';

export function Workspace() {
  const { state } = useDemo();
  const conv = selectSelectedConversation(state);
  const customer = selectCustomer(state, conv?.id);
  const reduced = useReducedMotion();

  if (!conv || !customer) {
    return (
      <section className="workspace" data-testid="workspace">
        <div className="workspace__empty">
          <strong>No conversation selected</strong>
          <span>Choose a conversation from the list, or use ↑ ↓ to move through it.</span>
        </div>
      </section>
    );
  }

  return (
    <section className="workspace" data-testid="workspace" data-conversation-id={conv.id}>
      <div className="workspace__main">
        <ThreadHeader conversation={conv} customer={customer} />
        <AnimatePresence initial={false}>
          {conv.ownership !== 'ai' ? (
            <motion.div
              key={`own-${conv.ownership}`}
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduced ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
              style={{ overflow: 'hidden', flex: 'none' }}
            >
              <OwnershipBanner conversation={conv} />
            </motion.div>
          ) : null}
          {conv.afterHoursQueued ? (
            <motion.div
              key="queued"
              initial={reduced ? false : { height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={reduced ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
              style={{ overflow: 'hidden', flex: 'none' }}
            >
              <AfterHoursBanner />
            </motion.div>
          ) : null}
        </AnimatePresence>
        <MessageList conversation={conv} customer={customer} />
        <Composer conversation={conv} />
      </div>
      <AnimatePresence initial={false}>
        {state.bookingPanelOpen ? (
          <motion.aside
            key="panel"
            className="panel"
            data-testid="booking-panel"
            aria-label="Consultation booking"
            initial={reduced ? false : { x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduced ? undefined : { x: 24, opacity: 0 }}
            transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
          >
            <BookingPanel conversation={conv} customer={customer} />
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

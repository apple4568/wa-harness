import { motion, useReducedMotion } from 'motion/react';
import type { AssistantActivity } from '@/domain/types';
import { NodeGlyph } from '@/components/icons/channels';

const ACTIVITY_TEXT: Record<Exclude<AssistantActivity['kind'], 'idle'>, string> = {
  reading: 'Reading…',
  retrieving: 'Retrieving approved information…',
  composing: 'Composing…',
};

export function AssistantActivityIndicator({ activity }: { activity: AssistantActivity }) {
  const reduced = useReducedMotion();
  if (activity.kind === 'idle') return null;
  return (
    <motion.div
      className="activity"
      data-testid="assistant-activity"
      data-activity={activity.kind}
      role="status"
      initial={reduced ? false : { opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.16, ease: [0.2, 0, 0, 1] }}
    >
      <motion.span
        style={{ display: 'inline-flex' }}
        animate={reduced ? undefined : { opacity: [1, 0.4, 1] }}
        transition={reduced ? undefined : { duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <NodeGlyph size={13} />
      </motion.span>
      Assistant · {ACTIVITY_TEXT[activity.kind]}
    </motion.div>
  );
}

export function TypingIndicator({ name }: { name: string }) {
  const reduced = useReducedMotion();
  return (
    <div className="typing" data-testid="customer-typing" role="status" aria-label={`${name} is typing`}>
      {[0, 1, 2].map((i) => (
        <motion.i
          key={i}
          animate={reduced ? undefined : { opacity: [0.35, 1, 0.35] }}
          transition={reduced ? undefined : { duration: 1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
          style={reduced ? { opacity: 0.7 } : undefined}
        />
      ))}
    </div>
  );
}

import { Hand, Send } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { Conversation } from '@/domain/types';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/lib/store';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Kbd } from '@/components/ui/kbd';
import { Textarea } from '@/components/ui/textarea';
import { PhotoPicker } from './PhotoPicker';

export function Composer({ conversation: conv }: { conversation: Conversation }) {
  const { state, dispatch } = useDemo();
  const me = STAFF_BY_ROLE[state.role];
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  const canReply = conv.ownership === 'human';

  // Drafts are per conversation; clear when switching.
  useEffect(() => {
    setText('');
  }, [conv.id]);

  const send = (photoId?: string) => {
    const trimmed = text.trim();
    if (!canReply) return;
    if (!trimmed && !photoId) return;
    dispatch({ type: 'SEND_STAFF_MESSAGE', conversationId: conv.id, text: trimmed, ...(photoId ? { photoId } : {}) });
    setText('');
    ref.current?.focus();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="composer" data-testid="composer">
      <div className="composer__inner">
        <div className={cn('composer__box', !canReply && 'is-disabled')}>
          {canReply ? (
            <>
              <Textarea
                ref={ref}
                data-testid="composer-input"
                placeholder={`Reply as ${me.name}…`}
                aria-label="Reply"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={onKeyDown}
              />
              <div className="composer__bar">
                <PhotoPicker onPick={(photoId) => send(photoId)} />
                <span className="composer__hint">
                  <Kbd>Enter</Kbd> send · <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd> newline
                </span>
                <Button variant="primary" size="sm" data-testid="btn-send" onClick={() => send()} disabled={!text.trim()}>
                  <Send />
                  Send
                </Button>
              </div>
            </>
          ) : (
            <div className="composer__locked">
              <span>
                {conv.ownership === 'needs_human' ? 'The assistant handed this conversation over. ' : 'The assistant is handling this conversation. '}
                <strong>Take over to reply.</strong>
              </span>
              <Button variant={conv.ownership === 'needs_human' ? 'primary' : 'secondary'} size="sm" data-testid="btn-take-over-composer" onClick={() => dispatch({ type: 'TAKE_OVER', conversationId: conv.id, by: me.name })}>
                <Hand />
                Take over
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

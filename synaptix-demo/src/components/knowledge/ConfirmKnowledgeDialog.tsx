import type { KnowledgeItem } from '@/domain/types';
import { MANAGER } from '@/data/staff';
import { useDemo } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { CATEGORY_LABEL, usageCondition } from './knowledgeLabels';

export type ConfirmIntent = { kind: 'approve' | 'withdraw'; knowledgeId: string } | null;

/** Manager confirmation for Approve / Withdraw. States exactly what changes before dispatching. */
export function ConfirmKnowledgeDialog({ intent, onClose }: { intent: ConfirmIntent; onClose: () => void }) {
  const { state, dispatch } = useDemo();
  const item: KnowledgeItem | undefined = intent ? state.knowledge[intent.knowledgeId] : undefined;
  const open = !!intent && !!item;

  const confirm = () => {
    if (!intent || !item) return;
    if (intent.kind === 'approve') {
      dispatch({ type: 'APPROVE_KNOWLEDGE', knowledgeId: item.id, by: MANAGER.id });
      dispatch({
        type: 'PUSH_NOTIFICATION',
        notification: {
          id: `n-${state.seq}-approve-${item.id}`,
          at: state.clock,
          kind: 'knowledge_approval',
          title: `${item.kind === 'photo' ? 'Photo' : 'Answer'} approved · ${item.title}`,
          body: `${MANAGER.name} approved "${item.title}" — now available to the assistant.`,
          knowledgeId: item.id,
          read: false,
        },
      });
    } else {
      dispatch({ type: 'WITHDRAW_KNOWLEDGE', knowledgeId: item.id, by: MANAGER.id });
    }
    onClose();
  };

  const isApprove = intent?.kind === 'approve';
  const condition = item ? usageCondition(item) : undefined;

  let lead = '';
  if (item && isApprove) {
    lead =
      item.kind === 'photo'
        ? condition
          ? `Approve "${item.title}" — the assistant may send this photo when ${condition}.`
          : `Approve "${item.title}" — the assistant may send this photo where its usage note applies.`
        : `Approve "${item.title}" — the assistant may use this answer for ${CATEGORY_LABEL[item.category].toLowerCase()} questions.`;
  } else if (item) {
    lead = `Withdraw "${item.title}" — it will no longer be selectable; already-sent messages stay in history.`;
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        testId="dialog-confirm-knowledge"
        title={isApprove ? 'Approve this item?' : 'Withdraw this item?'}
        description={isApprove ? `Approval is recorded under ${MANAGER.name} (simulated manager login).` : 'Withdrawal is recorded with the current clinic time.'}
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary">Back</Button>
            </DialogClose>
            <Button variant={isApprove ? 'primary' : 'danger'} data-testid="btn-confirm-knowledge" onClick={confirm}>
              {isApprove ? 'Approve' : 'Withdraw'}
            </Button>
          </>
        }
      >
        {item ? (
          <div className="kb-confirm">
            {item.kind === 'photo' && item.photo ? (
              <span className="kb-confirm__thumb">
                <img src={item.photo.src} alt="" />
              </span>
            ) : null}
            <div className="kb-confirm__text">
              <p>{lead}</p>
              {item.kind === 'photo' && item.photo && isApprove && !condition ? <p>When to send: {item.photo.usage}</p> : null}
              {item.kind === 'text' && isApprove ? <p>Only the fixed, per-language copy stored here is used — there is no live translation.</p> : null}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

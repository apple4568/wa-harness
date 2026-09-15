import { Check, ChevronRight, Clock, Undo2 } from 'lucide-react';
import { useId, useState } from 'react';
import type { KnowledgeItem, KnowledgeState, Role } from '@/domain/types';
import { formatDateTime } from '@/domain/calendar';
import { LANGUAGE_TAG, staffName } from '@/lib/labels';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BODY_LANGUAGES, CATEGORY_LABEL, STATE_LABEL } from './knowledgeLabels';

type Act = (kind: 'approve' | 'withdraw', knowledgeId: string) => void;

interface ItemProps {
  item: KnowledgeItem;
  role: Role;
  onAct: Act;
}

/* ---------- Shared pieces ---------- */

function StateChip({ state }: { state: KnowledgeState }) {
  if (state === 'approved') return <Badge tone="success">{STATE_LABEL.approved}</Badge>;
  if (state === 'withdrawn') return <Badge className="kb-chip--withdrawn">{STATE_LABEL.withdrawn}</Badge>;
  return <Badge tone="outline">{STATE_LABEL.draft}</Badge>;
}

function MetaLine({ item }: { item: KnowledgeItem }) {
  return (
    <span className="kb-meta">
      <span>
        Created by <b>{staffName(item.createdBy)}</b> · {formatDateTime(item.createdAt)}
      </span>
      {item.approvedBy && item.approvedAt ? (
        <span>
          Approved by <b>{staffName(item.approvedBy)}</b> · {formatDateTime(item.approvedAt)}
        </span>
      ) : null}
      {item.withdrawnAt ? <span>Withdrawn · {formatDateTime(item.withdrawnAt)}</span> : null}
    </span>
  );
}

function Actions({ item, role, onAct }: ItemProps) {
  if (role === 'manager') {
    if (item.state === 'draft') {
      return (
        <Button variant="primary" size="sm" data-testid="btn-approve" onClick={() => onAct('approve', item.id)}>
          <Check />
          Approve
        </Button>
      );
    }
    if (item.state === 'approved') {
      return (
        <Button variant="secondary" size="sm" data-testid="btn-withdraw" onClick={() => onAct('withdraw', item.id)}>
          <Undo2 />
          Withdraw
        </Button>
      );
    }
    return null;
  }
  if (item.state === 'draft') {
    return (
      <span className="kb-hint" data-testid="hint-waiting-approval">
        <Clock />
        Waiting for manager approval
      </span>
    );
  }
  return null;
}

/* ---------- Text item ---------- */

export function TextItem({ item, role, onAct }: ItemProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const body = item.body;
  return (
    <article className={cn('kb-text', `is-${item.state}`)} data-testid="knowledge-item" data-knowledge-id={item.id} data-kind="text" data-state={item.state}>
      <div className="kb-text__row">
        <button type="button" className="kb-text__toggle" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
          <ChevronRight className="kb-text__caret" aria-hidden="true" />
          <span className="kb-text__main">
            <span className="kb-text__top">
              <span className="kb-text__title">{item.title}</span>
              <Badge tone="neutral">{CATEGORY_LABEL[item.category]}</Badge>
              <StateChip state={item.state} />
            </span>
            <MetaLine item={item} />
            {body ? (
              <>
                <span className="kb-text__body" lang="en">
                  {body.en}
                </span>
                <span className="kb-text__ko">
                  <span className="kb-tag" aria-hidden="true">
                    KO
                  </span>
                  <span lang="ko">{body.ko}</span>
                </span>
              </>
            ) : null}
          </span>
        </button>
        <div className="kb-text__side">
          <Actions item={item} role={role} onAct={onAct} />
        </div>
      </div>
      {open && body ? (
        <dl className="kb-text__langs" id={panelId} aria-label={`${item.title} — all languages`}>
          {BODY_LANGUAGES.map((lang) => {
            const text = body[lang];
            return (
              <div key={lang} style={{ display: 'contents' }}>
                <dt>{LANGUAGE_TAG[lang]}</dt>
                {text ? (
                  <dd lang={lang}>{text}</dd>
                ) : (
                  <dd className="is-missing">Not provided — the assistant falls back to English for this language.</dd>
                )}
              </div>
            );
          })}
        </dl>
      ) : null}
    </article>
  );
}

/* ---------- Photo item ---------- */

export function PhotoItem({ item, role, onAct }: ItemProps) {
  const photo = item.photo;
  return (
    <article className={cn('kb-photo', `is-${item.state}`)} data-testid="knowledge-item" data-knowledge-id={item.id} data-kind="photo" data-state={item.state}>
      <div className="kb-photo__img">{photo ? <img src={photo.src} alt={photo.alt} /> : null}</div>
      <div className="kb-photo__body">
        <div className="kb-photo__top">
          <span className="kb-photo__title">{item.title}</span>
          <Badge tone="neutral">{CATEGORY_LABEL[item.category]}</Badge>
          <StateChip state={item.state} />
        </div>
        {photo ? (
          <p className="kb-photo__usage">
            <b>When to send:</b> {photo.usage}
          </p>
        ) : null}
        {photo ? <p className="kb-photo__prov">{photo.provenance}</p> : null}
        <MetaLine item={item} />
        <div className="kb-photo__foot">
          <span className="kb-meta">{item.origin === 'session' ? 'Added this session' : 'Seeded'}</span>
          <span className="kb-actions">
            <Actions item={item} role={role} onAct={onAct} />
          </span>
        </div>
      </div>
    </article>
  );
}

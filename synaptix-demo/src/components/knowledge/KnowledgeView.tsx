import { FileText, Image, LayoutList, Plus, ShieldCheck } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import type { KnowledgeCategory, KnowledgeItem, KnowledgeKind, KnowledgeState } from '@/domain/types';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/lib/store';
import { selectKnowledgeList } from '@/state/selectors';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AddPhotoDialog } from './AddPhotoDialog';
import { AddTextDialog } from './AddTextDialog';
import { ConfirmKnowledgeDialog, type ConfirmIntent } from './ConfirmKnowledgeDialog';
import { PhotoItem, TextItem } from './KnowledgeItems';
import { CATEGORY_LABEL, CATEGORY_ORDER, STATE_LABEL, STATE_ORDER } from './knowledgeLabels';
import '@/styles/views.css';

type KindFilter = 'all' | KnowledgeKind;

function FilterButton({ pressed, onClick, testId, icon, label, count }: { pressed: boolean; onClick: () => void; testId?: string; icon?: ReactNode; label: string; count?: number }) {
  return (
    <button type="button" className="kb-filter" aria-pressed={pressed} data-testid={testId} onClick={onClick}>
      {icon}
      <span className="kb-filter__label">{label}</span>
      {count !== undefined ? <span className="kb-filter__count">{count}</span> : null}
    </button>
  );
}

export function KnowledgeView() {
  const { state } = useDemo();
  const items = useMemo(() => selectKnowledgeList(state), [state]);
  const [kind, setKind] = useState<KindFilter>('all');
  const [stateFilter, setStateFilter] = useState<KnowledgeState | null>(null);
  const [category, setCategory] = useState<KnowledgeCategory | null>(null);
  const [addOpen, setAddOpen] = useState<'photo' | 'text' | null>(null);
  const [confirm, setConfirm] = useState<ConfirmIntent>(null);

  const me = STAFF_BY_ROLE[state.role];
  const roleLabel = state.role === 'manager' ? 'Manager' : 'Staff';

  const counts = useMemo(() => {
    const byState: Record<KnowledgeState, number> = { draft: 0, approved: 0, withdrawn: 0 };
    const byCategory: Record<KnowledgeCategory, number> = { facility: 0, services: 0, access: 0, hours: 0, policies: 0, consultation: 0 };
    let text = 0;
    let photo = 0;
    for (const k of items) {
      byState[k.state] += 1;
      byCategory[k.category] += 1;
      if (k.kind === 'text') text += 1;
      else photo += 1;
    }
    return { byState, byCategory, text, photo };
  }, [items]);

  const visible = useMemo(
    () =>
      items.filter((k) => {
        if (kind !== 'all' && k.kind !== kind) return false;
        if (stateFilter && k.state !== stateFilter) return false;
        if (category && k.category !== category) return false;
        return true;
      }),
    [items, kind, stateFilter, category],
  );
  const textItems = visible.filter((k) => k.kind === 'text');
  const photoItems = visible.filter((k) => k.kind === 'photo');

  const act = (intentKind: 'approve' | 'withdraw', knowledgeId: string) => setConfirm({ kind: intentKind, knowledgeId });
  const filtersActive = kind !== 'all' || !!stateFilter || !!category;

  const renderText = (list: KnowledgeItem[]) => list.map((k) => <TextItem key={k.id} item={k} role={state.role} onAct={act} />);
  const renderPhotos = (list: KnowledgeItem[]) => list.map((k) => <PhotoItem key={k.id} item={k} role={state.role} onAct={act} />);

  return (
    <section className="view kb" data-testid="knowledge-view" aria-label="Knowledge library">
      {/* ---- Filters ---- */}
      <aside className="kb__side" aria-label="Knowledge filters">
        <div className="kb__group" role="group" aria-label="Type">
          <FilterButton pressed={kind === 'all'} onClick={() => setKind('all')} testId="knowledge-filter-all" icon={<LayoutList />} label="All" count={items.length} />
          <FilterButton pressed={kind === 'text'} onClick={() => setKind('text')} testId="knowledge-filter-text" icon={<FileText />} label="Text" count={counts.text} />
          <FilterButton pressed={kind === 'photo'} onClick={() => setKind('photo')} testId="knowledge-filter-photo" icon={<Image />} label="Photos" count={counts.photo} />
        </div>
        <div className="kb__group" role="group" aria-label="State">
          <div className="kb__group-title label">State</div>
          {STATE_ORDER.map((s) => (
            <FilterButton key={s} pressed={stateFilter === s} onClick={() => setStateFilter((cur) => (cur === s ? null : s))} testId={`knowledge-filter-${s}`} label={STATE_LABEL[s]} count={counts.byState[s]} />
          ))}
        </div>
        <div className="kb__group" role="group" aria-label="Category">
          <div className="kb__group-title label">Category</div>
          {CATEGORY_ORDER.map((c) => (
            <FilterButton key={c} pressed={category === c} onClick={() => setCategory((cur) => (cur === c ? null : c))} testId={`knowledge-category-${c}`} label={CATEGORY_LABEL[c]} count={counts.byCategory[c]} />
          ))}
        </div>
      </aside>

      {/* ---- Main ---- */}
      <div className="kb__main">
        <header className="kb__header">
          <div className="kb__heading">
            <h1 className="kb__title">Knowledge library</h1>
            <p className="kb__subtitle">Approved information and photos the assistant may use</p>
          </div>
          <div className="kb__header-right">
            <span className="kb__role" data-testid="knowledge-role" title={`${me.name} (${me.nameKo}) · ${me.title}`}>
              Viewing as <strong>{roleLabel}</strong> — simulated role
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="primary" size="sm" data-testid="btn-add-knowledge">
                  <Plus />
                  Add
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid="btn-add-text" onSelect={() => setAddOpen('text')}>
                  <FileText style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                  Add text answer
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="btn-add-photo" onSelect={() => setAddOpen('photo')}>
                  <Image style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                  Add photo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <p className="kb__rule" data-testid="knowledge-rule">
          <ShieldCheck aria-hidden="true" />
          Customer attachments never become knowledge; only approved items are available to the assistant.
        </p>

        <div className="kb__scroll">
          {visible.length === 0 ? (
            <div className="kb__empty" data-testid="knowledge-empty">
              <strong>Nothing matches these filters</strong>
              {filtersActive ? 'Clear a filter or add a new item with the Add button.' : 'The library is empty — add a text answer or a photo.'}
            </div>
          ) : null}

          {kind !== 'photo' && textItems.length > 0 ? (
            <section className="kb__section" aria-label="Text answers">
              <div className="kb__section-head">
                <span className="label">Text answers</span>
                <span className="kb__section-count">{textItems.length}</span>
              </div>
              <div className="kb-list">{renderText(textItems)}</div>
            </section>
          ) : null}
          {kind === 'text' && textItems.length === 0 && visible.length > 0 ? (
            <div className="kb__empty">
              <strong>No text answers match</strong>
            </div>
          ) : null}

          {kind !== 'text' && photoItems.length > 0 ? (
            <section className="kb__section" aria-label="Photos">
              <div className="kb__section-head">
                <span className="label">Photos</span>
                <span className="kb__section-count">{photoItems.length}</span>
              </div>
              <div className="kb-grid">{renderPhotos(photoItems)}</div>
            </section>
          ) : null}
        </div>
      </div>

      <AddPhotoDialog open={addOpen === 'photo'} onOpenChange={(o) => setAddOpen(o ? 'photo' : null)} />
      <AddTextDialog open={addOpen === 'text'} onOpenChange={(o) => setAddOpen(o ? 'text' : null)} />
      <ConfirmKnowledgeDialog intent={confirm} onClose={() => setConfirm(null)} />
    </section>
  );
}

export default KnowledgeView;

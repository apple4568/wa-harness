import { Info } from 'lucide-react';
import { useId, useState } from 'react';
import type { KnowledgeCategory, KnowledgeItem } from '@/domain/types';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABEL, CATEGORY_ORDER, nextKnowledgeId } from './knowledgeLabels';

export function AddTextDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, dispatch } = useDemo();
  const ids = useId();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('services');
  const [en, setEn] = useState('');
  const [ko, setKo] = useState('');
  const [ja, setJa] = useState('');
  const [zhHans, setZhHans] = useState('');
  const [zhHant, setZhHant] = useState('');
  const [showOptional, setShowOptional] = useState(false);

  const reset = () => {
    setTitle('');
    setCategory('services');
    setEn('');
    setKo('');
    setJa('');
    setZhHans('');
    setZhHant('');
    setShowOptional(false);
  };

  const close = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const canCreate = title.trim().length > 0 && en.trim().length > 0 && ko.trim().length > 0;

  const create = () => {
    if (!canCreate) return;
    const me = STAFF_BY_ROLE[state.role];
    const item: KnowledgeItem = {
      id: nextKnowledgeId(state),
      kind: 'text',
      title: title.trim(),
      category,
      state: 'draft',
      origin: 'session',
      createdBy: me.id,
      createdAt: state.clock,
      body: {
        en: en.trim(),
        ko: ko.trim(),
        ...(ja.trim() ? { ja: ja.trim() } : {}),
        ...(zhHans.trim() ? { 'zh-Hans': zhHans.trim() } : {}),
        ...(zhHant.trim() ? { 'zh-Hant': zhHant.trim() } : {}),
      },
    };
    dispatch({ type: 'ADD_KNOWLEDGE', item });
    close(false);
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        testId="dialog-add-text"
        className="dialog--wide"
        title="Add text answer"
        description="Saved as a draft. A manager must approve it before the assistant can use it."
        footer={
          <>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button variant="primary" data-testid="btn-create-draft" disabled={!canCreate} onClick={create}>
              Create draft
            </Button>
          </>
        }
      >
        <div className="form">
          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor={`${ids}-title`}>
                Title
              </label>
              <Input id={`${ids}-title`} data-testid="input-title" value={title} placeholder="e.g. Parking near the clinic" onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="field">
              <label className="field__label" htmlFor={`${ids}-cat`}>
                Category
              </label>
              <Select value={category} onValueChange={(v) => setCategory(v as KnowledgeCategory)}>
                <SelectTrigger id={`${ids}-cat`} className="select__trigger--field" data-testid="select-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_ORDER.map((c) => (
                    <SelectItem key={c} value={c}>
                      {CATEGORY_LABEL[c]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="field">
            <label className="field__label" htmlFor={`${ids}-en`}>
              Answer · English
            </label>
            <textarea id={`${ids}-en`} className="field-textarea" data-testid="input-body-en" lang="en" value={en} placeholder="Fixed copy the assistant may send to English-speaking customers." onChange={(e) => setEn(e.target.value)} />
          </div>
          <div className="field">
            <label className="field__label" htmlFor={`${ids}-ko`}>
              Answer · Korean <em>(staff reference)</em>
            </label>
            <textarea id={`${ids}-ko`} className="field-textarea" data-testid="input-body-ko" lang="ko" value={ko} placeholder="직원 확인용 한국어 문안" onChange={(e) => setKo(e.target.value)} />
          </div>

          {showOptional ? (
            <>
              <div className="field">
                <label className="field__label" htmlFor={`${ids}-ja`}>
                  Answer · Japanese <em>(optional)</em>
                </label>
                <textarea id={`${ids}-ja`} className="field-textarea" lang="ja" value={ja} onChange={(e) => setJa(e.target.value)} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="field__label" htmlFor={`${ids}-zhs`}>
                    Chinese (Simplified) <em>(optional)</em>
                  </label>
                  <textarea id={`${ids}-zhs`} className="field-textarea" lang="zh-Hans" value={zhHans} onChange={(e) => setZhHans(e.target.value)} />
                </div>
                <div className="field">
                  <label className="field__label" htmlFor={`${ids}-zht`}>
                    Chinese (Traditional) <em>(optional)</em>
                  </label>
                  <textarea id={`${ids}-zht`} className="field-textarea" lang="zh-Hant" value={zhHant} onChange={(e) => setZhHant(e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <div>
              <Button variant="ghost" size="sm" aria-expanded={false} onClick={() => setShowOptional(true)}>
                Add Japanese / Chinese versions
              </Button>
            </div>
          )}

          <p className="form__note">
            <Info />
            <span>No live translation: languages left empty fall back to English when the assistant replies.</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

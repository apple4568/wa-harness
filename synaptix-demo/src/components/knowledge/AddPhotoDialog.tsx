import { Check, Info } from 'lucide-react';
import { useEffect, useId, useRef, useState, type ChangeEvent } from 'react';
import type { KnowledgeCategory, KnowledgeItem } from '@/domain/types';
import { STAFF_BY_ROLE } from '@/data/staff';
import { useDemo } from '@/lib/store';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORY_LABEL, CATEGORY_ORDER, SAMPLE_ASSETS, SAMPLE_PROVENANCE, UPLOAD_PROVENANCE, nextKnowledgeId, type SampleAsset } from './knowledgeLabels';

type Source = { kind: 'sample'; asset: SampleAsset } | { kind: 'upload'; file: File; objectUrl: string } | null;

const RECOVERY_LOUNGE_SRC = '/photos/recovery-lounge.svg';

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

export function AddPhotoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { state, dispatch } = useDemo();
  const ids = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<KnowledgeCategory>('facility');
  const [usage, setUsage] = useState('');
  const [source, setSource] = useState<Source>(null);
  const objectUrlRef = useRef<string | null>(null);

  // Revoke a never-used object URL when the dialog unmounts.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const releaseUpload = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  };

  const reset = (keepObjectUrl = false) => {
    if (!keepObjectUrl) releaseUpload();
    objectUrlRef.current = null;
    setTitle('');
    setCategory('facility');
    setUsage('');
    setSource(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const close = (o: boolean) => {
    if (!o) reset();
    onOpenChange(o);
  };

  const pickSample = (asset: SampleAsset) => {
    releaseUpload();
    if (fileRef.current) fileRef.current.value = '';
    setSource({ kind: 'sample', asset });
    // Prefill empty fields from the sample so the demo path is one click.
    setTitle((t) => (t.trim() ? t : asset.title));
    setUsage((u) => (u.trim() ? u : asset.usage));
  };

  const onFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    releaseUpload();
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSource({ kind: 'upload', file, objectUrl });
    setTitle((t) => (t.trim() ? t : file.name.replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ')));
  };

  const canCreate = !!source && title.trim().length > 0 && usage.trim().length > 0;

  const create = () => {
    if (!source || !canCreate) return;
    const me = STAFF_BY_ROLE[state.role];
    const isRecoverySample = source.kind === 'sample' && source.asset.src === RECOVERY_LOUNGE_SRC;
    const item: KnowledgeItem = {
      id: nextKnowledgeId(state, isRecoverySample ? 'ph-recovery-lounge' : undefined),
      kind: 'photo',
      title: title.trim(),
      category,
      state: 'draft',
      origin: 'session',
      createdBy: me.id,
      createdAt: state.clock,
      photo:
        source.kind === 'sample'
          ? { src: source.asset.src, alt: source.asset.alt, usage: usage.trim(), provenance: SAMPLE_PROVENANCE }
          : { src: source.objectUrl, alt: `Photo uploaded by staff: ${title.trim()}`, usage: usage.trim(), provenance: UPLOAD_PROVENANCE },
    };
    dispatch({ type: 'ADD_KNOWLEDGE', item });
    // The object URL now belongs to the knowledge item for the rest of the session.
    reset(true);
    onOpenChange(false);
  };

  const preview = source ? (source.kind === 'sample' ? source.asset.src : source.objectUrl) : null;

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent
        testId="dialog-add-photo"
        className="dialog--wide"
        title="Add photo"
        description="Saved as a draft. Only a manager can approve it; until then the assistant cannot select it."
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
          <div className="kb-src">
            <div className="kb-src__group" role="group" aria-labelledby={`${ids}-samples`}>
              <span className="field__label" id={`${ids}-samples`}>
                Use bundled sample
              </span>
              <div className="kb-samples">
                {SAMPLE_ASSETS.map((asset) => {
                  const selected = source?.kind === 'sample' && source.asset.src === asset.src;
                  return (
                    <button key={asset.src} type="button" className="kb-sample" aria-pressed={selected} data-testid="sample-asset" data-src={asset.src} onClick={() => pickSample(asset)}>
                      <span className="kb-sample__thumb">
                        <img src={asset.src} alt="" />
                      </span>
                      <span className="kb-sample__name">
                        {asset.title}
                        <span className="kb-sample__path">{asset.src}</span>
                      </span>
                      {selected ? <Check aria-hidden="true" /> : null}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="kb-src__group">
              <label className="field__label" htmlFor={`${ids}-file`}>
                Upload from this device
              </label>
              <div className={cn('kb-upload', source?.kind === 'upload' && 'is-active')}>
                <input ref={fileRef} id={`${ids}-file`} type="file" accept="image/*" data-testid="file-input" onChange={onFile} />
                {source?.kind === 'upload' ? (
                  <div className="kb-preview">
                    <span className="kb-preview__img">
                      <img src={source.objectUrl} alt="Preview of the selected file" />
                    </span>
                    <span className="kb-preview__meta">
                      {source.file.name}
                      <br />
                      <span className="mono">
                        {source.file.type || 'image'} · {formatBytes(source.file.size)}
                      </span>
                    </span>
                  </div>
                ) : (
                  <span className="field__hint">Uploads stay local to this browser session — nothing is sent anywhere.</span>
                )}
              </div>
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label className="field__label" htmlFor={`${ids}-title`}>
                Title
              </label>
              <Input id={`${ids}-title`} data-testid="input-title" value={title} placeholder="e.g. Recovery lounge" onChange={(e) => setTitle(e.target.value)} />
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
            <label className="field__label" htmlFor={`${ids}-usage`}>
              When to send <em>(guides staff and the assistant)</em>
            </label>
            <textarea id={`${ids}-usage`} className="field-textarea" data-testid="input-usage" value={usage} placeholder="Send when a customer asks …" onChange={(e) => setUsage(e.target.value)} />
          </div>

          {preview && source?.kind === 'sample' ? (
            <div className="kb-preview" aria-live="polite">
              <span className="kb-preview__img">
                <img src={preview} alt="" />
              </span>
              <span className="kb-preview__meta">
                {source.asset.title}
                <br />
                <span className="mono">{SAMPLE_PROVENANCE}</span>
              </span>
            </div>
          ) : null}

          <p className="form__note">
            <Info />
            <span>Customer attachments never become knowledge. Uploaded files are kept in this browser session only and are labelled as illustrative.</span>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

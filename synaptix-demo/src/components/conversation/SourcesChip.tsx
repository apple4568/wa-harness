import { BookOpen, Image } from 'lucide-react';
import { useDemo } from '@/lib/store';
import { formatDate } from '@/domain/calendar';
import { staffName } from '@/lib/labels';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';

/** Staff-only source detail for an assistant message. */
export function SourcesChip({ sourceIds }: { sourceIds: string[] }) {
  const { state } = useDemo();
  const items = sourceIds.map((id) => state.knowledge[id]).filter((k) => !!k);
  if (sourceIds.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="sources-chip" data-testid="sources-chip" aria-label={`Sources: ${items.length}`}>
          <BookOpen />
          Sources · {sourceIds.length}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" style={{ width: 320 }}>
        <div className="popover__header">
          <span>Approved sources used</span>
          <span className="meta">staff only</span>
        </div>
        <div className="popover__body">
          {items.length === 0 ? <div className="meta">Source items are not in the library any more.</div> : null}
          {items.map((k) => (
            <div key={k.id} className="source-item">
              <div className="source-item__title">
                {k.kind === 'photo' ? <Image size={13} /> : <BookOpen size={13} />}
                <span className="truncate">{k.title}</span>
                <Badge tone="neutral" style={{ marginLeft: 'auto' }}>
                  {k.category}
                </Badge>
              </div>
              <div className="source-item__meta">
                {k.state === 'approved' && k.approvedBy && k.approvedAt
                  ? `Approved by ${staffName(k.approvedBy)} on ${formatDate(k.approvedAt)}`
                  : `State: ${k.state}`}
              </div>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

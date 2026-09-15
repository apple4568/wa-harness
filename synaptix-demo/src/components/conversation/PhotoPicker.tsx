import { Image } from 'lucide-react';
import { useState } from 'react';
import { useDemo } from '@/state/store';
import { selectApprovedPhotos } from '@/state/selectors';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip } from '@/components/ui/tooltip';

/** Lists ONLY approved photo knowledge items. */
export function PhotoPicker({ onPick }: { onPick: (photoId: string) => void }) {
  const { state } = useDemo();
  const photos = selectApprovedPhotos(state);
  const [open, setOpen] = useState(false);

  if (photos.length === 0) {
    return (
      <Tooltip content="No approved photos in the knowledge library. A manager must approve a photo before it can be sent.">
        <span style={{ display: 'inline-flex' }}>
          <Button variant="ghost" size="sm" data-testid="btn-photo" disabled aria-disabled="true">
            <Image />
            Photo
          </Button>
        </span>
      </Tooltip>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" data-testid="btn-photo">
          <Image />
          Photo
        </Button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" style={{ width: 340 }}>
        <div className="popover__header">
          <span>Send an approved photo</span>
          <span className="meta">{photos.length} approved</span>
        </div>
        <div className="popover__list">
          {photos.map((k) => (
            <button
              key={k.id}
              type="button"
              className="photo-pick"
              data-testid="photo-option"
              data-photo-id={k.id}
              onClick={() => {
                setOpen(false);
                onPick(k.id);
              }}
            >
              <span className="photo-pick__thumb">{k.photo ? <img src={k.photo.src} alt="" /> : null}</span>
              <span style={{ minWidth: 0 }}>
                <span className="photo-pick__title">{k.title}</span>
                <span className="photo-pick__usage">{k.photo?.usage}</span>
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

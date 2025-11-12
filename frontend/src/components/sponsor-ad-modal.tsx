'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { SponsorAd } from '@/lib/types';
import { ExternalLink } from 'lucide-react';

type SponsorAdModalProps = {
  ad: SponsorAd;
  open: boolean;
  onContinue: () => void;
};

export function SponsorAdModal({ ad, open, onContinue }: SponsorAdModalProps) {
  const initialCountdown = useMemo(() => Math.max(ad.autoCloseSeconds ?? 5, 0), [ad.autoCloseSeconds]);
  const [secondsLeft, setSecondsLeft] = useState(initialCountdown);
  const [canContinue, setCanContinue] = useState(initialCountdown === 0);

  useEffect(() => {
    if (!open) {
      return;
    }

    setSecondsLeft(initialCountdown);
    setCanContinue(initialCountdown === 0);

    if (initialCountdown === 0) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanContinue(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [initialCountdown, open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      return;
    }

    if (canContinue) {
      onContinue();
    }
  };

  const handleContinue = () => {
    if (!canContinue) {
      return;
    }
    onContinue();
  };

  const handleVisitSponsor = () => {
    if (ad.clickUrl) {
      window.open(ad.clickUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        onPointerDownOutside={(event) => {
          if (!canContinue) {
            event.preventDefault();
          }
        }}
        onEscapeKeyDown={(event) => {
          if (!canContinue) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{ad.headline || 'Sponsored message'}</DialogTitle>
          <DialogDescription>
            {ad.description || 'Thanks to our sponsor for supporting this event.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-xl bg-black">
            <video
              src={ad.videoUrl}
              poster={ad.thumbnailUrl}
              className="w-full h-full"
              controls
              autoPlay
              playsInline
              muted
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {canContinue ? 'You may continue to complete your RSVP.' : `You can continue in ${secondsLeft}s`}
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:gap-3">
              {ad.clickUrl && (
                <Button variant="secondary" onClick={handleVisitSponsor} className="w-full sm:w-auto">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  {ad.ctaText || 'Visit sponsor'}
                </Button>
              )}
              <Button onClick={handleContinue} disabled={!canContinue} className="w-full sm:w-auto">
                {canContinue ? 'Continue to RSVP' : `Continue in ${secondsLeft}s`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


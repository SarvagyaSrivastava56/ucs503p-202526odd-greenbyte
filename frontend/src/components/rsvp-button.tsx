'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useFirebase } from '@/firebase/provider';
import { createRsvp, cancelRsvp, getRsvpStatus, type RsvpStatus } from '@/lib/rsvp';
import { Check, Clock, X, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import Image from 'next/image';

interface RsvpButtonProps {
  eventId: string;
  eventTitle: string;
  capacity: number;
  currentRsvps: number;
}

export function RsvpButton({ eventId, eventTitle, capacity, currentRsvps }: RsvpButtonProps) {
  const { user } = useFirebase();
  const { toast } = useToast();
  const [status, setStatus] = useState<RsvpStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [showQrDialog, setShowQrDialog] = useState(false);
  const handleDownload = (url: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${eventTitle}-QR.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  useEffect(() => {
    if (user) {
      loadRsvpStatus();
    }
  }, [user, eventId]);

  const loadRsvpStatus = async () => {
    if (!user) return;
    
    try {
      const rsvpData = await getRsvpStatus(user.uid, eventId);
      if (rsvpData && rsvpData.status !== 'cancelled') {
        setStatus(rsvpData.status);
        setQrCode(rsvpData.qrCodeUrl || null);
      } else {
        setStatus(null);
      }
    } catch (error) {
      console.error('Failed to load RSVP status:', error);
    }
  };

  const handleRsvp = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Authentication Required',
        description: 'Please sign in to RSVP to events.',
      });
      return;
    }

    setLoading(true);

    try {
      const result = await createRsvp(user.uid, eventId);
      setStatus(result.status);
      setQrCode(result.qrCodeUrl || null);

      if (result.status === 'rsvped') {
        // Show confetti animation
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });

        toast({
          title: '🎉 RSVP Confirmed!',
          description: `You're all set for ${eventTitle}. Check your QR code for check-in.`,
        });

        if (result.qrCodeUrl) {
          setShowQrDialog(true);
          handleDownload(result.qrCodeUrl);
        }
      } else if (result.status === 'waitlisted') {
        toast({
          title: 'Added to Waitlist',
          description: 'Event is at capacity. You\'ll be notified if a spot opens up.',
        });
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'RSVP Failed',
        description: error.message || 'Failed to RSVP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!user) return;

    setLoading(true);

    try {
      await cancelRsvp(user.uid, eventId);
      setStatus(null);
      setQrCode(null);

      toast({
        title: 'RSVP Cancelled',
        description: 'Your RSVP has been cancelled.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel RSVP. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Button onClick={handleRsvp} size="lg" className="w-full sm:w-auto">
        Sign In to RSVP
      </Button>
    );
  }

  if (loading) {
    return (
      <Button disabled size="lg" className="w-full sm:w-auto">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Processing...
      </Button>
    );
  }

  if (status === 'rsvped') {
    return (
      <>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowQrDialog(true)}
            size="lg"
            className="flex-1 sm:flex-none"
          >
            <Check className="mr-2 h-4 w-4" />
            RSVP'd - View QR
          </Button>
          <Button
            onClick={handleCancel}
            variant="outline"
            size="lg"
            className="flex-1 sm:flex-none"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Your Event QR Code</DialogTitle>
              <DialogDescription>
                Show this QR code at check-in to confirm your attendance.
              </DialogDescription>
            </DialogHeader>
            {qrCode && (
              <div className="flex flex-col items-center gap-4 py-4">
                <Image
                  src={qrCode}
                  alt="Event QR Code"
                  width={300}
                  height={300}
                  className="border-4 border-primary rounded-lg"
                />
                <p className="text-sm text-muted-foreground text-center">
                  Save or screenshot this QR code for easy check-in
                </p>
                <Button onClick={() => handleDownload(qrCode)} size="sm">
                  Download QR
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }

  if (status === 'waitlisted') {
    return (
      <div className="flex gap-2">
        <Button disabled size="lg" variant="secondary" className="flex-1 sm:flex-none">
          <Clock className="mr-2 h-4 w-4" />
          Waitlisted
        </Button>
        <Button
          onClick={handleCancel}
          variant="outline"
          size="lg"
          className="flex-1 sm:flex-none"
        >
          <X className="mr-2 h-4 w-4" />
          Leave Waitlist
        </Button>
      </div>
    );
  }

  const isFull = currentRsvps >= capacity && capacity > 0;

  return (
    <Button
      onClick={handleRsvp}
      size="lg"
      className="w-full sm:w-auto"
      variant={isFull ? 'secondary' : 'default'}
    >
      {isFull ? 'Join Waitlist' : 'RSVP Now'}
    </Button>
  );
}


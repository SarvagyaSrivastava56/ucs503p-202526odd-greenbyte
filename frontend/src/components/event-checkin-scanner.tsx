'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Camera, CameraOff, CheckCircle2, Loader2, RefreshCcw } from 'lucide-react';
import { functions } from '@/firebase';
import { httpsCallable } from 'firebase/functions';
import { cn } from '@/lib/utils';

interface EventCheckInScannerProps {
  eventId: string;
  onCheckIn: (attendee: {
    id: string;
    name: string;
    email: string;
    time: string;
    alreadyCheckedIn: boolean;
  }) => void;
}

type CameraDevice = {
  id: string;
  label: string;
};

type CheckInResponse = {
  success: boolean;
  alreadyCheckedIn: boolean;
  checkInAt: string;
  attendee?: {
    id: string;
    name: string;
    email: string;
  };
  message?: string;
};

export function EventCheckInScanner({ eventId, onCheckIn }: EventCheckInScannerProps) {
  const scannerRegionId = useMemo(() => `qr-reader-${eventId}`, [eventId]);
  const html5QrCodeInstanceRef = useRef<any>(null);
  const html5QrCodeModuleRef = useRef<any>(null);
  const processingRef = useRef(false);

  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [isLoadingCameras, setIsLoadingCameras] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [isStartingScanner, setIsStartingScanner] = useState(false);
  const [lastScanMessage, setLastScanMessage] = useState<string | null>(null);
  const [lastScanStatus, setLastScanStatus] = useState<'success' | 'warning' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadScanner = async () => {
      try {
        const module = await import('html5-qrcode');
        if (!isMounted) return;
        html5QrCodeModuleRef.current = module;
        const cameras = await module.Html5Qrcode.getCameras();
        if (!isMounted) return;
        const formattedCameras = cameras.map((camera) => ({
          id: camera.id,
          label: camera.label || `Camera ${camera.id}`,
        }));
        setAvailableCameras(formattedCameras);
        setSelectedCameraId(formattedCameras[0]?.id || null);
        setErrorMessage(formattedCameras.length === 0 ? 'No camera devices detected.' : null);
      } catch (err: any) {
        console.error('Failed to initialise QR scanner:', err);
        if (isMounted) {
          setErrorMessage(err?.message || 'Failed to access camera. Please grant camera permissions.');
        }
      } finally {
        if (isMounted) {
          setIsLoadingCameras(false);
        }
      }
    };

    loadScanner();

    return () => {
      isMounted = false;
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const stopScanner = useCallback(async () => {
    if (html5QrCodeInstanceRef.current) {
      try {
        await html5QrCodeInstanceRef.current.stop();
        await html5QrCodeInstanceRef.current.clear();
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
      } finally {
        html5QrCodeInstanceRef.current = null;
        setIsScanning(false);
      }
    }
  }, []);

  const handleScanSuccess = useCallback(async (decodedText: string) => {
    if (processingRef.current) {
      return;
    }
    processingRef.current = true;

    try {
      const payload = JSON.parse(decodedText);

      if (!payload.eventId || !payload.userId) {
        throw new Error('QR code does not include expected data.');
      }

      if (payload.eventId !== eventId) {
        setLastScanStatus('warning');
        setLastScanMessage('This QR code belongs to a different event.');
        return;
      }

      const callable = httpsCallable(functions, 'checkInVerify');
      const response = await callable({
        eventId: payload.eventId,
        userId: payload.userId,
        qrData: decodedText,
      });

      const data = response.data as CheckInResponse;

      if (data.success) {
        const attendee = {
          id: payload.userId,
          name: data.attendee?.name || 'Attendee',
          email: data.attendee?.email || '',
          time: data.checkInAt,
          alreadyCheckedIn: data.alreadyCheckedIn,
        };

        onCheckIn(attendee);
        setLastScanStatus(data.alreadyCheckedIn ? 'warning' : 'success');
        setLastScanMessage(
          data.alreadyCheckedIn
            ? `${attendee.name} was already checked in at ${new Date(attendee.time).toLocaleTimeString()}.`
            : `${attendee.name} successfully checked in!`
        );
      } else {
        setLastScanStatus('error');
        setLastScanMessage(data.message || 'Failed to verify attendee.');
      }
    } catch (err: any) {
      console.error('QR scan error:', err);
      setLastScanStatus('error');
      setLastScanMessage(err?.message || 'Invalid QR code.');
    } finally {
      setTimeout(() => {
        processingRef.current = false;
      }, 1200);
    }
  }, [eventId, onCheckIn]);

  const startScanner = useCallback(async () => {
    if (!selectedCameraId) {
      setErrorMessage('No camera available.');
      return;
    }

    if (!html5QrCodeModuleRef.current) {
      setErrorMessage('Scanner is still initialising. Please try again.');
      return;
    }

    setIsStartingScanner(true);
    setErrorMessage(null);

    try {
      await stopScanner();
      const { Html5Qrcode } = html5QrCodeModuleRef.current;
      const html5QrCode = new Html5Qrcode(scannerRegionId);
      html5QrCodeInstanceRef.current = html5QrCode;

      await html5QrCode.start(
        { deviceId: { exact: selectedCameraId } },
        {
          fps: 10,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1,
        },
        handleScanSuccess,
        () => {
          /* ignore scan failure callbacks */
        }
      );

      setIsScanning(true);
      setLastScanStatus(null);
      setLastScanMessage(null);
    } catch (err: any) {
      console.error('Failed to start QR scanner:', err);
      setErrorMessage(err?.message || 'Failed to start camera.');
      await stopScanner();
    } finally {
      setIsStartingScanner(false);
    }
  }, [handleScanSuccess, scannerRegionId, selectedCameraId, stopScanner]);

  const handleSwitchCamera = useCallback(async () => {
    if (availableCameras.length < 2) {
      setErrorMessage('Only one camera detected on this device.');
      return;
    }

    const currentIndex = availableCameras.findIndex((cam) => cam.id === selectedCameraId);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % availableCameras.length;
    const nextCamera = availableCameras[nextIndex];

    setSelectedCameraId(nextCamera.id);

    if (isScanning) {
      await startScanner();
    }
  }, [availableCameras, isScanning, selectedCameraId, startScanner]);

  const statusBadge = lastScanStatus
    ? {
        success: {
          label: 'Success',
          icon: <CheckCircle2 className="h-4 w-4" />,
          className: 'bg-emerald-500/10 text-emerald-600 border border-emerald-200',
        },
        warning: {
          label: 'Already Checked In',
          icon: <AlertTriangle className="h-4 w-4" />,
          className: 'bg-amber-500/10 text-amber-600 border border-amber-200',
        },
        error: {
          label: 'Error',
          icon: <AlertTriangle className="h-4 w-4" />,
          className: 'bg-destructive/10 text-destructive border border-destructive/50',
        },
      }[lastScanStatus]
    : null;

  return (
    <div className="space-y-4">
      <div className={cn('relative w-full rounded-xl border', isScanning ? 'border-primary' : 'border-dashed border-muted-foreground/40')}>
        <div
          id={scannerRegionId}
          className={cn(
            'w-full rounded-xl bg-black/80 flex items-center justify-center overflow-hidden min-h-[320px] sm:min-h-[360px]',
            !isScanning && 'bg-muted'
          )}
        >
          {!isScanning && (
            <div className="text-center space-y-3 px-6">
              <Camera className="h-10 w-10 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {isLoadingCameras ? 'Detecting cameras…' : 'Start the scanner to begin validating attendee QR codes.'}
              </p>
            </div>
          )}
        </div>
        {isScanning && (
          <div className="pointer-events-none absolute inset-x-6 inset-y-6 border-2 border-primary/60 rounded-xl" />
        )}
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <p>{errorMessage}</p>
        </div>
      )}

      {statusBadge && lastScanMessage && (
        <div className={cn('flex items-center gap-2 rounded-lg px-4 py-3 text-sm', statusBadge.className)}>
          {statusBadge.icon}
          <p>{lastScanMessage}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {!isScanning ? (
          <Button onClick={startScanner} disabled={isStartingScanner || isLoadingCameras || !selectedCameraId}>
            {isStartingScanner ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting…
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanner
              </>
            )}
          </Button>
        ) : (
          <Button onClick={stopScanner} variant="destructive">
            <CameraOff className="mr-2 h-4 w-4" />
            Stop Scanner
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={handleSwitchCamera}
          disabled={availableCameras.length < 2 || isLoadingCameras}
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Switch Camera
        </Button>

        <Badge variant="outline" className="ml-auto">
          {availableCameras.length > 0
            ? `${availableCameras.length} camera${availableCameras.length === 1 ? '' : 's'} detected`
            : 'No cameras detected'}
        </Badge>
      </div>
    </div>
  );
}

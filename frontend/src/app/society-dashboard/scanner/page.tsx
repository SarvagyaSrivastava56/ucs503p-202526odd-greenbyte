'use client';

import { useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import dynamic from 'next/dynamic';
import { firebaseApp } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Scan } from 'lucide-react';

const QrScanner: any = dynamic(
  () =>
    import('@yudiel/react-qr-scanner').then((mod: any) => {
      const Comp = mod?.QrScanner || mod?.Scanner || mod?.default;
      return { default: Comp || (() => null) } as any;
    }),
  { ssr: false }
);

export default function ScannerPage() {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [inputPayload, setInputPayload] = useState('');
  const [verifying, setVerifying] = useState(false);
  const processingRef = useRef(false);
  const [scanStatus, setScanStatus] = useState<null | { ok: boolean; message: string }>(null);

  const verify = async (payload: string) => {
    if (processingRef.current) return;
    processingRef.current = true;
    let parsed: any;
    try {
      parsed = JSON.parse(payload);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Invalid QR', description: 'Payload must be valid JSON.' });
      setScanStatus({ ok: false, message: 'Invalid QR: not JSON' });
      processingRef.current = false;
      return;
    }

    if (!parsed?.eventId || !parsed?.userId) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'QR payload must include eventId and userId.' });
      setScanStatus({ ok: false, message: 'Invalid QR: missing eventId/userId' });
      processingRef.current = false;
      return;
    }

    setVerifying(true);
    try {
      const region = (process.env.NEXT_PUBLIC_FUNCTIONS_REGION as string) || 'us-central1';
      const functions = getFunctions(firebaseApp, region);
      const checkInVerify = httpsCallable(functions, 'checkInVerify');
      const withTimeout = <T,>(p: Promise<T>, ms = 12000) =>
        Promise.race<T>([
          p,
          new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms)) as unknown as Promise<T>,
        ]);

      const res: any = await withTimeout(
        checkInVerify({
          eventId: parsed.eventId,
          userId: parsed.userId,
          qrPayload: payload,
        }) as Promise<any>,
        12000
      );

      const data = res?.data as { success: boolean; alreadyCheckedIn?: boolean; checkInAt?: string; message?: string } | undefined;
      if (data?.success) {
        toast({
          title: data.alreadyCheckedIn ? 'Already Checked In' : 'Check-in Successful',
          description: data.message || 'Attendee verified and checked in.',
        });
        setInputPayload('');
        setScanStatus({ ok: true, message: data.alreadyCheckedIn ? 'Already checked in' : 'Check-in successful' });
      } else {
        toast({ variant: 'destructive', title: 'Verification Failed', description: data?.message || 'Could not verify QR.' });
        setScanStatus({ ok: false, message: data?.message || 'Verification failed' });
      }
    } catch (err: any) {
      const msg = err?.message === 'timeout' ? 'Verification timed out. Check network/region.' : (err?.message || 'Function call failed.');
      toast({ variant: 'destructive', title: 'Verification Error', description: msg });
      setScanStatus({ ok: false, message: msg });
    } finally {
      setVerifying(false);
      processingRef.current = false;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Scan Attendee QR</CardTitle>
          <CardDescription>Use your device camera to scan attendee check-in codes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
            {!scanning ? (
              <div className="text-center space-y-4">
                <Scan className="h-16 w-16 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Click below to start scanning</p>
                <Button onClick={() => setScanning(true)}>
                  <Scan className="mr-2 h-4 w-4" />
                  Start Scanner
                </Button>
              </div>
            ) : (
              <div className="w-full space-y-4">
                <div className="mx-auto max-w-sm overflow-hidden rounded-lg border">
                  <QrScanner
                    onDecode={(text: string) => {
                      setScanning(false);
                      setInputPayload(text);
                      // Debounced verify to avoid double-calls from rapid decodes
                      setTimeout(() => verify(text), 50);
                    }}
                    onError={(e: any) => {
                      // Ignore transient decode errors
                    }}
                    constraints={{ facingMode: 'environment' }}
                    styles={{ container: { width: '100%' } }}
                  />
                </div>
                <div className="text-center">
                  <Button variant="outline" onClick={() => setScanning(false)}>
                    Stop Scanner
                  </Button>
                </div>
              </div>
            )}
          </div>

          {scanStatus && (
            <div className={`p-3 rounded-md ${scanStatus.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`}>
              {scanStatus.message}
            </div>
          )}

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Or paste QR payload manually</p>
            <Textarea
              value={inputPayload}
              onChange={(e) => setInputPayload(e.target.value)}
              placeholder='{"eventId":"...","userId":"...","timestamp":...}'
              className="min-h-24"
            />
            <div className="flex justify-end">
              <Button onClick={() => verify(inputPayload)} disabled={verifying || !inputPayload}>
                {verifying ? 'Verifying...' : 'Verify & Check-in'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { useRef, useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  QrCode, 
  Scan,
  UserCheck,
  CheckCircle2,
  XCircle,
  Download,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Event } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import QRCode from 'qrcode';
import { Textarea } from '@/components/ui/textarea';
import { firebaseApp } from '@/firebase';
import { getFunctions, httpsCallable } from 'firebase/functions';
import dynamic from 'next/dynamic';
const QrScanner: any = dynamic(
  async () => {
    const mod: any = await import('@yudiel/react-qr-scanner');
    return mod.QrScanner || mod.default;
  },
  { ssr: false }
);

interface QRCheckInProps {
  event: Event;
}

export function QRCheckIn({ event }: QRCheckInProps) {
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [inputPayload, setInputPayload] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [recentCheckIns, setRecentCheckIns] = useState<Array<{
    id: string;
    userName: string;
    time: string;
  }>>([]);
  const processingRef = useRef(false);
  const [scanStatus, setScanStatus] = useState<null | { ok: boolean; message: string }>(null);

  useEffect(() => {
    // Generate QR code for the event
    const generateQR = async () => {
      try {
        const checkInData = JSON.stringify({
          eventId: event.id,
          timestamp: Date.now(),
        });
        
        const url = await QRCode.toDataURL(checkInData, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
        });
        
        setQrCodeUrl(url);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [event.id]);

  const handleDownloadQR = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement('a');
    link.download = `${event.title}-checkin-qr.png`;
    link.href = qrCodeUrl;
    link.click();

    toast({
      title: 'QR Code Downloaded',
      description: 'Check-in QR code has been downloaded',
    });
  };

  const verifyQrManually = async () => {
    if (!inputPayload) return;
    if (processingRef.current) return;
    processingRef.current = true;
    let parsed: any;
    try {
      parsed = JSON.parse(inputPayload);
    } catch (e) {
      toast({
        title: 'Invalid Payload',
        description: 'Paste the exact QR payload (JSON) from the attendee.',
        variant: 'destructive',
      });
      setScanStatus({ ok: false, message: 'Invalid QR: not JSON' });
      processingRef.current = false;
      return;
    }

    if (!parsed?.eventId || !parsed?.userId) {
      toast({
        title: 'Missing Fields',
        description: 'Payload must include eventId and userId.',
        variant: 'destructive',
      });
      setScanStatus({ ok: false, message: 'Invalid QR: missing eventId/userId' });
      processingRef.current = false;
      return;
    }

    if (parsed.eventId !== event.id) {
      toast({
        title: 'Wrong Event',
        description: 'This QR belongs to a different event.',
        variant: 'destructive',
      });
      return;
    }

    setVerifying(true);
    try {
      const functions = getFunctions(firebaseApp);
      const checkInVerify = httpsCallable(functions, 'checkInVerify');
      const res: any = await checkInVerify({
        eventId: event.id,
        userId: parsed.userId,
        qrPayload: inputPayload,
      });

      const data = res?.data as { success: boolean; alreadyCheckedIn?: boolean; checkInAt?: string; message?: string };
      if (data?.success) {
        setRecentCheckIns(prev => [{
          id: parsed.userId,
          userName: parsed.userId,
          time: data.checkInAt ? new Date(data.checkInAt).toLocaleTimeString() : new Date().toLocaleTimeString(),
        }, ...prev.slice(0, 9)]);
        toast({
          title: data.alreadyCheckedIn ? 'Already Checked In' : 'Check-in Successful',
          description: data.message || 'Attendee verified and checked in.',
        });
        setInputPayload('');
        setScanStatus({ ok: true, message: data.alreadyCheckedIn ? 'Already checked in' : 'Check-in successful' });
      } else {
        toast({
          title: 'Verification Failed',
          description: data?.message || 'Could not verify QR.',
          variant: 'destructive',
        });
        setScanStatus({ ok: false, message: data?.message || 'Verification failed' });
      }
    } catch (error: any) {
      toast({
        title: 'Verification Error',
        description: error?.message || 'Failed to verify QR. Ensure you are signed in as a society admin.',
        variant: 'destructive',
      });
      setScanStatus({ ok: false, message: 'Verification error' });
    } finally {
      setVerifying(false);
      processingRef.current = false;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="qr" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="qr">
            <QrCode className="mr-2 h-4 w-4" />
            QR Code
          </TabsTrigger>
          <TabsTrigger value="scanner">
            <Scan className="mr-2 h-4 w-4" />
            Scanner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="qr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Check-in QR Code</CardTitle>
              <CardDescription>
                Display this QR code at your event entrance
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center space-y-4">
              {qrCodeUrl && (
                <>
                  <div className="p-4 bg-white rounded-lg border-2 border-border">
                    <img 
                      src={qrCodeUrl} 
                      alt="Event Check-in QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Scan this code to check in
                    </p>
                  </div>
                  <Button onClick={handleDownloadQR}>
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Check-in Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{event.counters?.checkIns || 0}</div>
                  <p className="text-sm text-muted-foreground">Checked In</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">{event.counters?.rsvpCount || 0}</div>
                  <p className="text-sm text-muted-foreground">Expected</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">
                    {event.counters?.rsvpCount 
                      ? Math.round(((event.counters?.checkIns || 0) / event.counters.rsvpCount) * 100)
                      : 0}%
                  </div>
                  <p className="text-sm text-muted-foreground">Attendance Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scanner" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scan Attendee QR Codes</CardTitle>
              <CardDescription>
                Use your device camera to scan attendee check-in codes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                {!scanning ? (
                  <div className="text-center space-y-4">
                    <Scan className="h-16 w-16 mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground">
                      Click below to start scanning
                    </p>
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
                          setTimeout(() => {
                            void verifyQrManually();
                          }, 50);
                        }}
                        onError={(e: any) => { /* ignore frame decode errors */ }}
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
                <p className="text-sm text-muted-foreground">Or paste QR payload (from attendee QR) to verify and check in</p>
                <Textarea
                  value={inputPayload}
                  onChange={(e) => setInputPayload(e.target.value)}
                  placeholder='{"eventId":"...","userId":"...","timestamp":...}'
                  className="min-h-24"
                />
                <div className="flex justify-end">
                  <Button onClick={verifyQrManually} disabled={verifying || !inputPayload}>
                    {verifying ? 'Verifying...' : 'Verify & Check-in'}
                  </Button>
                </div>
              </div>

              {/* Recent Check-ins */}
              {recentCheckIns.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Check-ins</h4>
                  <div className="space-y-2">
                    {recentCheckIns.map((checkIn) => (
                      <div 
                        key={checkIn.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                          <div>
                            <p className="font-medium">{checkIn.userName}</p>
                            <p className="text-sm text-muted-foreground">{checkIn.time}</p>
                          </div>
                        </div>
                        <Badge variant="default">Checked In</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


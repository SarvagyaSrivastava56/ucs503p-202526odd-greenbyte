'use client';

import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { getFunctions, httpsCallable } from 'firebase/functions';

const QRReader = () => {
  const [data, setData] = useState('No result');
  const [isScanning, setIsScanning] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [error, setError] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [isMarkingAttendance, setIsMarkingAttendance] = useState(false);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [scannedPayload, setScannedPayload] = useState<string | null>(null);
  const [parsedPayload, setParsedPayload] = useState<any>(null);
  const html5QrCodeRef = useRef(null);
  const isMountedRef = useRef(true);
  const qrCodeRegionId = "qr-reader";

  useEffect(() => {
    isMountedRef.current = true;
    
    Html5Qrcode.getCameras().then(devices => {
      if (devices && devices.length && isMountedRef.current) {
        setCameras(devices);
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
        setError(null);
      } else if (isMountedRef.current) {
        setError('No cameras found on this device');
      }
    }).catch(err => {
      console.error("Error getting cameras:", err);
      if (isMountedRef.current) {
        setError('Failed to access cameras. Please grant camera permissions.');
      }
    });

    return () => {
      isMountedRef.current = false;
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop()
          .then(() => {
            if (html5QrCodeRef.current) {
              html5QrCodeRef.current.clear();
            }
          })
          .catch(err => console.error("Error stopping scanner:", err));
      }
    };
  }, []);

  const startScanning = async () => {
    if (!selectedCamera) {
      setError("No camera available");
      return;
    }

    setError(null);

    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error("Error stopping previous scanner:", err);
      }
    }

    try {
      html5QrCodeRef.current = new Html5Qrcode(qrCodeRegionId);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        disableFlip: false,
        videoConstraints: {
          facingMode: "environment"
        }
      };
      
      await html5QrCodeRef.current.start(
        selectedCamera,
        config,
        (decodedText, decodedResult) => {
          if (isMountedRef.current && !isMarkingAttendance) {
            setData(decodedText);
            setError(null);
            setAttendanceMarked(false);
            setStudentDetails(null);
            console.log("QR Code detected:", decodedText);
            // Hold the scanned data for user confirmation
            setScannedPayload(decodedText);
            try {
              setParsedPayload(JSON.parse(decodedText));
            } catch {
              setParsedPayload(null);
            }
            // Stop scanning to prevent multiple captures
            stopScanning();
          }
        },
        (errorMessage) => {
          // Error callback (called continuously while scanning)
          // We can ignore these as they're just "no QR code found" messages
        }
      );
      
      if (isMountedRef.current) {
        setIsScanning(true);
        setError(null);
      }
    } catch (err) {
      console.error("Error starting scanner:", err);
      const errorMsg = err.message || err.toString();
      setError("Failed to start camera: " + errorMsg);
      if (isMountedRef.current) {
        setIsScanning(false);
      }
    }
  };

  const stopScanning = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
        if (isMountedRef.current) {
          setIsScanning(false);
        }
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const switchCamera = async () => {
    if (cameras.length < 2) {
      setError("Only one camera available");
      return;
    }

    const wasScanning = isScanning;
    const currentIndex = cameras.findIndex(cam => cam.id === selectedCamera);
    const nextIndex = (currentIndex + 1) % cameras.length;
    const nextCamera = cameras[nextIndex].id;

    await stopScanning();
    setSelectedCamera(nextCamera);
    
    if (wasScanning) {
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };

  const markAttendance = async (qrCodeData: unknown) => {
    setIsMarkingAttendance(true);
    setError(null);
    try {
      console.log('raw qrCodeData:', qrCodeData);
      let parsed: any = qrCodeData;
      if (typeof qrCodeData === 'string') {
        try {
          parsed = JSON.parse(qrCodeData);
        } catch (e) {
          // Keep as plain string if not JSON
        }
      }
      console.log('parsed qrCodeData:', parsed);

      // Call backend callable function to verify and check-in
      const functions = getFunctions();
      const verify = httpsCallable(functions, 'checkInVerify');
      const payload = typeof qrCodeData === 'string' ? qrCodeData : JSON.stringify(qrCodeData);
      const res: any = await verify({ payload });
      console.log('checkInVerify result:', res?.data);

      if (res?.data?.success) {
        setAttendanceMarked(true);
        setError(null);
      } else {
        setAttendanceMarked(false);
        setError(res?.data?.message || 'Failed to verify check-in');
      }
    } catch (e: any) {
      console.error('Error while handling QR data:', e);
      setAttendanceMarked(false);
      setError(e?.message || 'Failed to verify check-in');
    } finally {
      setIsMarkingAttendance(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-5 max-w-xl mx-auto">
      <h1 className="mb-2 text-2xl font-semibold">QR Check-in</h1>
      <p className="mb-5 text-sm text-muted-foreground">Scan a QR code to read its content.</p>
      
      {error && (
        <div className="w-full p-3 mb-5 rounded-md border text-center bg-destructive/15 text-destructive border-destructive">
          {error}
        </div>
      )}
      
      <div className="w-full max-w-lg mb-5 relative border-2 border-foreground rounded-xl overflow-hidden bg-black">
        <div id={qrCodeRegionId} className="w-full min-h-[400px] text-white" />
        
        {!isScanning && (
          <div className="absolute inset-0 flex items-center justify-center text-center text-muted-foreground">
            <p className="px-5">Click "Start Scanning" to begin</p>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-2 rounded text-xs pointer-events-none">
            Position QR code in the green box
          </div>
        )}
      </div>

      <div className="flex gap-2 mb-5 flex-wrap justify-center">
        {!isScanning ? (
          <Button onClick={startScanning} disabled={!selectedCamera} className={!selectedCamera ? 'opacity-50 cursor-not-allowed' : ''}>
            Start Scanning
          </Button>
        ) : (
          <Button onClick={stopScanning} variant="destructive">
            Stop Scanning
          </Button>
        )}
        {cameras.length > 1 && (
          <Button onClick={switchCamera} variant="secondary">
            Switch Camera
          </Button>
        )}
      </div>

      <div className="w-full p-5 bg-muted rounded-md border mt-2">
        <h3 className="m-0 mb-2 text-lg font-medium">Status</h3>
        
        {isMarkingAttendance && (
          <div className="p-3 text-center font-semibold rounded-md border bg-yellow-100 text-yellow-800 border-yellow-300">
            ⏳ Processing scanned data...
          </div>
        )}
        
        {!isMarkingAttendance && data === 'No result' && (
          <div className="p-3 text-center rounded-md border bg-blue-50 text-blue-700 border-blue-300">
            📱 Waiting for QR code scan...
          </div>
        )}
        
        {!isMarkingAttendance && attendanceMarked && (
          <div className="p-3 text-center rounded-md border bg-emerald-50 text-emerald-700 border-emerald-300">
            ✓ Check-in successful.
          </div>
        )}

        {!isMarkingAttendance && !attendanceMarked && scannedPayload && (
          <div className="p-3 rounded-md border bg-background">
            <p className="text-sm text-muted-foreground mb-2">Scanned payload:</p>
            <pre className="text-xs whitespace-pre-wrap break-words bg-muted p-3 rounded mb-3 max-h-60 overflow-auto">{scannedPayload}</pre>
            {parsedPayload && (
              <div className="mb-3">
                <p className="text-sm text-muted-foreground mb-1">Parsed JSON:</p>
                <pre className="text-xs whitespace-pre-wrap break-words bg-muted p-3 rounded max-h-60 overflow-auto">{JSON.stringify(parsedPayload, null, 2)}</pre>
              </div>
            )}
            <div className="flex gap-2">
              <Button onClick={() => markAttendance(scannedPayload)} className="flex-1">Check-in</Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setScannedPayload(null);
                  setParsedPayload(null);
                  setData('No result');
                  setAttendanceMarked(false);
                  setError(null);
                  startScanning();
                }}
              >
                Rescan
              </Button>
            </div>
          </div>
        )}
      </div>

      {studentDetails && (
        <div className="w-full p-5 bg-background rounded-md border-2 border-emerald-500 mt-5 shadow">
          <h3 className="m-0 mb-3 text-lg font-semibold text-emerald-600 border-b border-emerald-500 pb-2">Welcome!</h3>
          <div className="leading-8 text-sm">
            {/* Placeholder preview; real details will come when backend is wired */}
            <p className="my-2"><strong>Event ID:</strong> {studentDetails.eventId || 'N/A'}</p>
            <div className="mt-3 p-3 bg-emerald-50 rounded text-center">
              <p className="m-0"><strong>Status:</strong> <span className="text-emerald-700 font-bold">PRESENT (Preview)</span></p>
            </div>
          </div>
          <Button
            onClick={() => {
              setData('No result');
              setStudentDetails(null);
              setAttendanceMarked(false);
              setError(null);
              startScanning();
            }}
            className="mt-5 w-full"
            variant="secondary"
          >
            Scan Next Student
          </Button>
        </div>
      )}
    </div>
  );
};

export default QRReader;
"use client";

import { Scanner } from "@yudiel/react-qr-scanner";
import { Camera, CameraOff, CheckCircle, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gearboxe-market/ui/card";

type QRScannerProps = {
  onScan: (data: string) => void;
  onError?: (error: Error) => void;
  title?: string;
};

export function QRScannerComponent({
  onScan,
  onError,
  title = "QR Code Scanner",
}: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );
  const scannerRef = useRef<any>(null);

  const handleScan = (result: string) => {
    setLastResult(result);
    setScanStatus("success");
    onScan(result);

    // Stop scanning after successful scan
    setTimeout(() => {
      setIsScanning(false);
      setScanStatus("idle");
    }, 2000);
  };

  const handleError = (error: unknown) => {
    setScanStatus("error");
    if (error instanceof Error) {
      onError?.(error);
    }

    setTimeout(() => {
      setScanStatus("idle");
    }, 2000);
  };

  const toggleScanning = () => {
    setIsScanning(!isScanning);
    setScanStatus("idle");
    setLastResult(null);
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex justify-center">
          <Button
            onClick={toggleScanning}
            size="sm"
            variant={isScanning ? "destructive" : "default"}
          >
            {isScanning ? (
              <>
                <CameraOff className="mr-2 h-4 w-4" />
                Stop Scanning
              </>
            ) : (
              <>
                <Camera className="mr-2 h-4 w-4" />
                Start Scanning
              </>
            )}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isScanning ? (
          <div className="relative">
            <Scanner
              onScan={(result) => {
                if (result?.[0]?.rawValue) {
                  handleScan(result[0].rawValue);
                }
              }}
              onError={handleError}
              styles={{
                container: {
                  width: "100%",
                  height: "300px",
                  borderRadius: "8px",
                  overflow: "hidden",
                },
                video: {
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                },
              }}
            />

            {/* Overlay with scanning status */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="rounded-lg bg-black/50 px-4 py-2 text-white">
                {scanStatus === "success" && (
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span>Scan Successful!</span>
                  </div>
                )}
                {scanStatus === "error" && (
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-400" />
                    <span>Scan Error</span>
                  </div>
                )}
                {scanStatus === "idle" && <span>Point camera at QR code</span>}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-64 w-full items-center justify-center rounded-lg bg-gray-200">
            <div className="text-center text-gray-500">
              <Camera className="mx-auto mb-2 h-12 w-12" />
              <p>Click "Start Scanning" to begin</p>
            </div>
          </div>
        )}

        {lastResult && (
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="mb-1 font-medium text-gray-700 text-sm">
              Last Scan Result:
            </p>
            <p className="break-all text-gray-600 text-xs">{lastResult}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

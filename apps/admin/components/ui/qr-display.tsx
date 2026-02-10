"use client";

import { Download, Share } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gearboxe-market/ui/card";

type QRDisplayProps = {
  qrCodeData: string;
  title?: string;
  description?: string;
};

export function QRDisplay({
  qrCodeData,
  title = "QR Code",
  description,
}: QRDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const url = await QRCode.toDataURL(qrCodeData, {
          width: 256,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        setQrCodeUrl(url);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, [qrCodeData]);

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `qr-code-${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!qrCodeUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `qr-code-${Date.now()}.png`, {
          type: "image/png",
        });

        await navigator.share({
          title,
          text: description,
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback: copy to clipboard or download
      handleDownload();
    }
  };

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <p className="text-gray-600 text-sm">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        {qrCodeUrl ? (
          <div className="flex justify-center">
            <img
              alt="QR Code"
              className="rounded-lg border"
              height={256}
              src={qrCodeUrl}
              width={256}
            />
          </div>
        ) : (
          <div className="flex h-64 w-64 items-center justify-center rounded-lg bg-gray-200">
            <span className="text-gray-500">Generating QR Code...</span>
          </div>
        )}

        <div className="flex justify-center gap-2">
          <Button onClick={handleDownload} size="sm" variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button onClick={handleShare} size="sm" variant="outline">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

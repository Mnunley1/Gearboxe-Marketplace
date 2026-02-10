"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gearboxe-market/ui/card";
import { useQuery } from "convex/react";
import { CheckCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Footer } from "../../../../../components/footer";
import { Navbar } from "../../../../../components/navbar";
import { QRDisplay } from "../../../../../components/qr-display";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);

  // Try to find registration by checking Stripe payment
  useEffect(() => {
    if (!sessionId) return;

    const verifyPayment = async () => {
      try {
        // Query Stripe component for payment details
        // Note: This is a simplified approach - in production you might want
        // to create a query that looks up registration by session ID
        setIsVerifying(false);
      } catch (error) {
        console.error("Error verifying payment:", error);
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  // Get registration if we have the ID
  const registration = useQuery(
    api.registrations.getRegistrationById,
    registrationId ? { id: registrationId as any } : "skip"
  );

  if (isVerifying) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-primary border-b-2" />
              <p className="text-gray-600">Verifying your payment...</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (!registration || registration.registration.paymentStatus !== "completed") {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="mb-2 font-semibold text-gray-900 text-xl">
                Payment Processing
              </h2>
              <p className="mb-6 text-gray-600">
                Your payment is being processed. You'll receive a confirmation email shortly.
                If you don't receive it within a few minutes, please check your spam folder.
              </p>
              <Button asChild>
                <Link href="/myAccount/my-listings">View My Listings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const { registration: reg, vehicle, event, user } = registration;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <CardTitle>Payment Successful!</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-green-800">
                Your registration for <strong>{event.name}</strong> has been confirmed!
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                Event Details
              </h3>
              <div className="space-y-2 rounded-lg bg-gray-50 p-4">
                <p><strong>Event:</strong> {event.name}</p>
                <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}</p>
                <p><strong>Location:</strong> {event.location}</p>
                <p><strong>Vehicle:</strong> {vehicle.year} {vehicle.make} {vehicle.model}</p>
              </div>
            </div>

            {reg.qrCodeData && (
              <div>
                <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                  Your Check-in QR Code
                </h3>
                <div className="rounded-lg border-2 border-primary p-6">
                  <QRDisplay
                    qrCodeData={reg.qrCodeData}
                    title="Event Check-in"
                    description="Show this QR code at the event for check-in"
                  />
                </div>
                <p className="mt-4 text-center text-gray-600 text-sm">
                  A confirmation email with this QR code has been sent to {user.email}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="flex-1">
                <Link href="/myAccount/my-listings">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  View My Listings
                </Link>
              </Button>
              {reg.qrCodeData && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    // Trigger resend email
                    // This would call a mutation to resend the email
                    alert("Resend email functionality coming soon!");
                  }}
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Email
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gearboxe-market/ui/card";
import { useAction, useQuery } from "convex/react";
import { CreditCard, ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useCurrentUser();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const registrationId = searchParams.get("registrationId");
  const vehicleId = searchParams.get("vehicleId");
  const eventId = searchParams.get("eventId");

  const registration = useQuery(
    api.registrations.getRegistrationById,
    registrationId ? { id: registrationId as any } : "skip"
  );
  const vehicle = useQuery(
    api.vehicles.getVehicleById,
    vehicleId ? { id: vehicleId as any } : "skip"
  );
  const event = useQuery(
    api.events.getEventById,
    eventId ? { id: eventId as any } : "skip"
  );
  const capacity = useQuery(
    api.events.getEventCapacity,
    eventId ? { eventId: eventId as any } : "skip"
  );
  const createCheckout = useAction(api.payments.createEventRegistrationCheckout);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/sign-in");
    return null;
  }

  if (!((registrationId && vehicleId ) && eventId)) {
    router.push("/myAccount/my-listings");
    return null;
  }

  if (!((vehicle && event ) && registration)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // Check if already paid
  if (registration.registration.paymentStatus === "completed") {
    router.push(`/myAccount/my-listings?paid=${vehicleId}`);
    return null;
  }

  // Check capacity
  if (capacity?.isFull) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-16 w-16 text-red-500" />
              <h2 className="mb-2 font-semibold text-gray-900 text-xl">
                Event is Full
              </h2>
              <p className="mb-6 text-gray-600">
                This event has reached its capacity. Please select a different event.
              </p>
              <Button asChild>
                <Link href="/myAccount/my-listings">Back to Listings</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const handlePayment = async () => {
    if (!event.vendorPrice || event.vendorPrice <= 0) {
      toast({
        title: "No Payment Required",
        description: "This event does not require payment.",
        variant: "destructive",
      });
      router.push("/myAccount/my-listings");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await createCheckout({
        registrationId: registrationId as any,
        eventId: eventId as any,
        vehicleId: vehicleId as any,
        userId: registration.registration.userId,
        amount: event.vendorPrice / 100, // Convert cents to dollars
      });

      if (result.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error processing payment:", error);
      toast({
        title: "Payment Error",
        description: error?.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const priceInDollars = (event.vendorPrice / 100).toFixed(2);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto max-w-3xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm">
            <Link href="/myAccount/my-listings">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Listings
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Complete Your Event Registration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                Registration Summary
              </h3>
              
              <div className="space-y-3 rounded-lg bg-gray-50 p-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium text-gray-900">{event.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(event.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium text-gray-900">{event.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium text-gray-900">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </span>
                </div>
                {capacity && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Spots Available:</span>
                    <span className="font-medium text-gray-900">
                      {capacity.available} of {capacity.capacity}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-gray-900 text-lg">Registration Fee:</span>
                <span className="font-bold text-2xl text-primary">
                  ${priceInDollars}
                </span>
              </div>
              <p className="mb-6 text-gray-600 text-sm">
                Complete your payment to secure your spot at the event. You'll receive a confirmation email with your QR code for check-in.
              </p>
            </div>

            <Button
              className="w-full text-white"
              disabled={isProcessing || capacity?.isFull}
              onClick={handlePayment}
              size="lg"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              {isProcessing ? "Processing..." : `Pay $${priceInDollars}`}
            </Button>

            <p className="text-center text-gray-500 text-xs">
              Secure payment powered by Stripe
            </p>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}

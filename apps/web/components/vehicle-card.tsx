"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardFooter } from "@car-market/ui/card";
import { useMutation, useQuery } from "convex/react";
import { Car, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";

type Vehicle = {
  _id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  photos?: string[]; // Storage IDs - for backward compatibility
  photoUrls?: string[]; // Resolved URLs from R2
  status: "pending" | "approved" | "rejected";
  saleStatus?: "available" | "salePending" | "sold";
};

type Event = {
  _id: string;
  name: string;
  location: string;
  address: string;
  date: number;
};

type VehicleCardProps = {
  vehicle: Vehicle;
  event?: Event | null;
  showFavorite?: boolean;
};

export function VehicleCard({
  vehicle,
  event,
  showFavorite = true,
}: VehicleCardProps) {
  const { user: convexUser, isAuthenticated, isLoading: userLoading } = useCurrentUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const isFavoritedQuery = useQuery(
    api.favorites.isFavorited,
    convexUser?._id
      ? { userId: convexUser._id, vehicleId: vehicle._id as any }
      : "skip"
  );

  // Update local state when query result changes
  useEffect(() => {
    if (isFavoritedQuery !== undefined) {
      setIsFavorited(isFavoritedQuery);
    }
  }, [isFavoritedQuery]);

  // Handle Escape key to close dialog
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showAuthDialog) {
        setShowAuthDialog(false);
      }
    };

    if (showAuthDialog) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when dialog is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [showAuthDialog]);


  const handleFavoriteToggle = () => {
    // Wait for user loading to complete
    if (userLoading) {
      return;
    }

    // If user is not logged in, show auth dialog
    if (!isAuthenticated || !convexUser) {
      setShowAuthDialog(true);
      return;
    }

    // User is authenticated, toggle favorite
    if (isLoading) return;

    setIsLoading(true);
    const toggleFavorite = async () => {
      try {
        if (isFavorited) {
          await removeFavorite({
            userId: convexUser._id,
            vehicleId: vehicle._id as any,
          });
          setIsFavorited(false);
          toast({
            title: "Removed from favorites",
            description: `${vehicle.title} has been removed from your favorites`,
          });
        } else {
          await addFavorite({
            userId: convexUser._id,
            vehicleId: vehicle._id as any,
          });
          setIsFavorited(true);
          toast({
            title: "Added to favorites",
            description: `${vehicle.title} has been added to your favorites`,
          });
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: "Error",
          description: "Failed to update favorites. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    toggleFavorite();
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const formatMileage = (mileage: number) =>
    new Intl.NumberFormat("en-US").format(mileage);

  return (
    <>
      <Card className="group overflow-hidden border-gray-200 bg-white transition-all duration-200 hover:border-gray-300 hover:shadow-xl">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {(vehicle.photoUrls?.length ?? vehicle.photos?.length ?? 0) > 0 ? (
            <Image
              alt={vehicle.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              height={300}
              src={vehicle.photoUrls?.[0] ?? vehicle.photos?.[0] ?? ""}
              width={400}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <Car className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Sale Status Badge */}
          {vehicle.saleStatus && vehicle.saleStatus !== "available" && (
            <div
              className={`absolute top-3 left-3 z-10 rounded-full px-3 py-1 text-xs font-bold shadow-md ${
                vehicle.saleStatus === "sold"
                  ? "bg-red-600 text-white"
                  : vehicle.saleStatus === "salePending"
                    ? "bg-yellow-500 text-white"
                    : ""
              }`}
            >
              {vehicle.saleStatus === "sold"
                ? "SOLD"
                : vehicle.saleStatus === "salePending"
                  ? "SALE PENDING"
                  : ""}
            </div>
          )}

          {/* Photo count badge */}
          {(vehicle.photoUrls?.length ?? vehicle.photos?.length ?? 0) > 1 && (
            <div className="absolute bottom-3 right-3 z-10 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
              {(vehicle.photoUrls?.length ?? vehicle.photos?.length ?? 0)} photos
            </div>
          )}

          {showFavorite && (
            <Button
              className="absolute top-3 right-3 z-20 h-9 w-9 rounded-full bg-white/90 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              disabled={isLoading || userLoading}
              onClick={handleFavoriteToggle}
              size="icon"
              variant="ghost"
            >
              <Heart
                className={`h-4 w-4 transition-all ${
                  isFavorited ? "fill-red-500 text-red-500" : "text-gray-700"
                } ${isLoading || userLoading ? "opacity-50" : ""}`}
              />
            </Button>
          )}
        </div>

        <CardContent className="p-5">
          <div className="space-y-3">
            {/* Price - Prominent */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="line-clamp-2 font-bold text-gray-900 text-lg leading-tight">
                  {vehicle.title}
                </h3>
                <p className="mt-1 text-gray-600 text-sm">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </div>
              <div className="ml-3 text-right">
                <div className="font-bold text-primary text-xl">
                  {formatPrice(vehicle.price)}
                </div>
              </div>
            </div>

            {/* Key Details */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-gray-100 pt-3">
              <div className="flex items-center text-gray-600 text-sm">
                <svg
                  className="mr-1.5 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
                {formatMileage(vehicle.mileage)} mi
              </div>
              {event && (
                <div className="flex items-center text-gray-600 text-sm">
                  <svg
                    className="mr-1.5 h-4 w-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                    <path
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                  {event.location}
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 p-0">
          <Button
            asChild
            className="w-full rounded-none border-0 bg-transparent font-semibold text-primary hover:bg-gray-50"
            variant="ghost"
          >
            <Link href={`/vehicles/${vehicle._id}`}>
              View Details
              <svg
                className="ml-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M9 5l7 7-7 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </Link>
          </Button>
        </CardFooter>
      </Card>

      {/* Auth Dialog - render outside fragment to avoid transform issues */}
      {showAuthDialog && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in-0"
          onClick={() => setShowAuthDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`auth-dialog-title-${vehicle._id}`}
          aria-describedby={`auth-dialog-description-${vehicle._id}`}
          style={{ position: "fixed" }}
        >
          <div
            className="relative w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-2xl animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowAuthDialog(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none"
              aria-label="Close dialog"
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">Close</span>
            </button>

            {/* Content */}
            <div className="p-6">
              {/* Icon */}
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Heart className="h-6 w-6 text-primary" fill="currentColor" />
              </div>

              <div className="mb-6 text-center">
                  <h2
                    id={`auth-dialog-title-${vehicle._id}`}
                    className="mb-2 font-semibold text-gray-900 text-xl"
                  >
                    Sign in to favorite vehicles
                  </h2>
                  <p
                    id={`auth-dialog-description-${vehicle._id}`}
                    className="text-gray-600 text-sm"
                  >
                  Create an account or sign in to save vehicles to your
                  favorites list and get notified about price changes.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <Button
                  asChild
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => setShowAuthDialog(false)}
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
                <Button
                  asChild
                  className="w-full text-white sm:w-auto"
                  onClick={() => setShowAuthDialog(false)}
                >
                  <Link href="/sign-up">Create Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

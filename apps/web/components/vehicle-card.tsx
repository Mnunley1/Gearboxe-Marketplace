"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardFooter } from "@car-market/ui/card";
import { useMutation, useQuery } from "convex/react";
import { ArrowRight, Car, Gauge, Heart, MapPin } from "lucide-react";
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

  const photoCount = vehicle.photoUrls?.length ?? vehicle.photos?.length ?? 0;
  const primaryPhoto = vehicle.photoUrls?.[0] ?? vehicle.photos?.[0];

  return (
    <>
      <Card className="group relative overflow-hidden border-gray-200/60 bg-white hover:border-gray-300/80 hover:shadow-xl hover:shadow-gray-200/50">
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {primaryPhoto ? (
            <Image
              alt={vehicle.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              height={300}
              src={primaryPhoto}
              width={400}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-gray-200/80 p-4">
                  <Car className="h-8 w-8 text-gray-400" />
                </div>
                <span className="text-xs text-gray-400">No image</span>
              </div>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Sale Status Badge */}
          {vehicle.saleStatus && vehicle.saleStatus !== "available" && (
            <div
              className={`absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold uppercase tracking-wide shadow-lg ${
                vehicle.saleStatus === "sold"
                  ? "bg-red-500 text-white"
                  : vehicle.saleStatus === "salePending"
                    ? "bg-amber-500 text-white"
                    : ""
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-75 animate-pulse" />
              {vehicle.saleStatus === "sold"
                ? "Sold"
                : vehicle.saleStatus === "salePending"
                  ? "Sale Pending"
                  : ""}
            </div>
          )}

          {/* Photo count badge */}
          {photoCount > 1 && (
            <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {photoCount}
            </div>
          )}

          {/* Favorite Button */}
          {showFavorite && (
            <Button
              className={`absolute top-3 right-3 z-20 rounded-full shadow-lg backdrop-blur-sm ${
                isFavorited
                  ? "bg-red-500 text-white border-transparent hover:bg-red-600 active:bg-red-700"
                  : "bg-white/90 text-gray-700 border-transparent hover:bg-white active:bg-gray-100"
              }`}
              disabled={isLoading || userLoading}
              onClick={handleFavoriteToggle}
              size="icon"
              variant="outline"
            >
              <Heart
                className={`h-4.5 w-4.5 transition-all duration-200 ${
                  isFavorited ? "fill-current scale-110" : ""
                } ${isLoading || userLoading ? "opacity-50" : ""}`}
              />
            </Button>
          )}

          {/* Quick View Overlay - appears on hover */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Link
              href={`/vehicles/${vehicle._id}`}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-medium text-sm text-gray-900 shadow-xl transition-transform duration-200 hover:scale-105"
            >
              Quick View
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <CardContent className="p-5">
          <div className="space-y-3">
            {/* Title and Price Row */}
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold text-gray-900 text-base leading-tight group-hover:text-primary transition-colors duration-200">
                  {vehicle.title}
                </h3>
                <p className="mt-0.5 text-gray-500 text-sm">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-primary text-lg tabular-nums tracking-tight">
                  {formatPrice(vehicle.price)}
                </div>
              </div>
            </div>

            {/* Details Row */}
            <div className="flex items-center gap-4 border-t border-gray-100 pt-3">
              <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                <Gauge className="h-4 w-4 text-gray-400" />
                <span className="tabular-nums">{formatMileage(vehicle.mileage)}</span>
                <span className="text-gray-400">mi</span>
              </div>
              {event && (
                <div className="flex items-center gap-1.5 text-gray-600 text-sm">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="border-t border-gray-100 p-0">
          <Link
            href={`/vehicles/${vehicle._id}`}
            className="flex w-full items-center justify-center gap-2 py-3.5 font-medium text-sm text-primary transition-all duration-200 hover:bg-primary/5 hover:gap-3"
          >
            View Details
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </CardFooter>
      </Card>

      {/* Auth Dialog - render outside fragment to avoid transform issues */}
      {showAuthDialog && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in-0 duration-200"
          onClick={() => setShowAuthDialog(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby={`auth-dialog-title-${vehicle._id}`}
          aria-describedby={`auth-dialog-description-${vehicle._id}`}
          style={{ position: "fixed" }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-2xl animate-in zoom-in-95 fade-in-0 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowAuthDialog(false)}
              className="absolute right-4 top-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              aria-label="Close dialog"
            >
              <svg
                className="h-5 w-5"
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
            </button>

            {/* Content */}
            <div className="text-center">
              {/* Icon */}
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                <Heart className="h-8 w-8 text-primary" />
              </div>

              <h2
                id={`auth-dialog-title-${vehicle._id}`}
                className="mb-2 font-semibold text-gray-900 text-xl"
              >
                Save Your Favorites
              </h2>
              <p
                id={`auth-dialog-description-${vehicle._id}`}
                className="mb-8 text-gray-600 text-sm leading-relaxed"
              >
                Create an account or sign in to save vehicles to your favorites and get notified about price changes.
              </p>

              <div className="flex flex-col gap-3">
                <Button
                  asChild
                  className="w-full shadow-md shadow-primary/20"
                  onClick={() => setShowAuthDialog(false)}
                >
                  <Link href="/sign-up">Create Account</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowAuthDialog(false)}
                >
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

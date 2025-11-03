"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardFooter } from "@car-market/ui/card";
import { useMutation, useQuery } from "convex/react";
import { Heart } from "lucide-react";
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
  photos: string[];
  status: "pending" | "approved" | "rejected";
};

type VehicleCardProps = {
  vehicle: Vehicle;
  showFavorite?: boolean;
};

export function VehicleCard({
  vehicle,
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
      <Card className="overflow-hidden border-gray-200 bg-white transition-shadow hover:shadow-lg">
        <div className="relative">
          {vehicle.photos.length > 0 ? (
            <Image
              alt={vehicle.title}
              className="h-48 w-full object-cover"
              height={300}
              src={vehicle.photos[0]}
              width={400}
            />
          ) : (
            <div className="flex h-48 w-full items-center justify-center bg-gray-100">
              <span className="text-gray-500">No Image</span>
            </div>
          )}

          {showFavorite && (
            <Button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white"
              disabled={isLoading || userLoading}
              onClick={handleFavoriteToggle}
              size="icon"
              variant="ghost"
            >
              <Heart
                className={`h-4 w-4 transition-colors ${
                  isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
                } ${isLoading || userLoading ? "opacity-50" : ""}`}
              />
            </Button>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <h3 className="line-clamp-1 font-semibold text-gray-900 text-lg">
              {vehicle.title}
            </h3>
            <p className="text-gray-600 text-sm">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
            <div className="flex items-center justify-between text-gray-600 text-sm">
              <span>{formatMileage(vehicle.mileage)} miles</span>
              <span className="font-semibold text-lg text-primary">
                {formatPrice(vehicle.price)}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button asChild className="w-full text-white">
            <Link href={`/vehicles/${vehicle._id}`}>View Details</Link>
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

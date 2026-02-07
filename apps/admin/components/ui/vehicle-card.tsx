"use client";

import { api } from "@car-market/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardFooter } from "@car-market/ui/card";
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
  const { user: convexUser } = useCurrentUser();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleFavoriteToggle = async () => {
    if (!convexUser || isLoading) return;

    setIsLoading(true);
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

        {showFavorite && convexUser && (
          <Button
            className="absolute top-2 right-2 bg-white/80"
            disabled={isLoading}
            onClick={handleFavoriteToggle}
            size="icon"
            variant="ghost"
          >
            <Heart
              className={`h-4 w-4 transition-colors ${
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
              } ${isLoading ? "opacity-50" : ""}`}
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
  );
}

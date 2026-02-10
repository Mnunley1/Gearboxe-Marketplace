"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent } from "@gearboxe-market/ui/card";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { Eye, Heart, SortAsc } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";

export default function FavoritesPage() {
  const { isLoading, isAuthenticated, user } = useCurrentUser();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "price-low" | "price-high"
  >("newest");
  const { toast } = useToast();

  // Always call hooks to maintain hook order
  const favorites = useQuery(
    api.favorites.getFavoritesByUser,
    user?._id ? { userId: user._id } : "skip"
  );
  const removeFavorite = useMutation(api.favorites.removeFavorite);

  // Show loading while auth is being determined
  if (!authLoaded || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading favorites...</p>
        </div>
      </div>
    );
  }

  // Only redirect if Clerk auth is not loaded or user is not signed in
  if (!isSignedIn) {
    redirect("/sign-in");
  }

  // Show loading while Convex user data is being fetched
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  const handleRemoveFavorite = async (vehicleId: string) => {
    try {
      const vehicle = favorites?.find((v) => v._id === vehicleId);
      await removeFavorite({
        userId: user._id,
        vehicleId: vehicleId as any,
      });
      toast({
        title: "Removed from favorites",
        description: vehicle
          ? `${vehicle.title} has been removed from your favorites`
          : "Vehicle removed from favorites",
      });
    } catch (error) {
      console.error("Error removing favorite:", error);
      toast({
        title: "Error",
        description: "Failed to remove from favorites. Please try again.",
        variant: "destructive",
      });
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

  // Sort favorites based on selected sort option
  const sortedFavorites = favorites
    ? [...favorites].sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return b.createdAt - a.createdAt;
          case "oldest":
            return a.createdAt - b.createdAt;
          case "price-low":
            return a.price - b.price;
          case "price-high":
            return b.price - a.price;
          default:
            return 0;
        }
      })
    : [];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-bold text-3xl text-gray-900">My Favorites</h1>
              <p className="text-gray-600">
                {favorites
                  ? `${favorites.length} vehicles saved`
                  : "Vehicles you've saved for later"}
              </p>
            </div>

            {/* Controls */}
            {favorites && favorites.length > 0 && (
              <div className="mt-4 flex items-center space-x-4 sm:mt-0">
                {/* Sort Dropdown */}
                <div className="flex items-center space-x-2">
                  <SortAsc className="h-4 w-4 text-gray-500" />
                  <select
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 text-sm transition-colors hover:border-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) => setSortBy(e.target.value as any)}
                    value={sortBy}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Favorites Grid */}
        {sortedFavorites && sortedFavorites.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sortedFavorites.map((vehicle) => (
              <Card
                className="overflow-hidden transition-shadow hover:shadow-lg"
                key={vehicle._id}
              >
                <div className="relative">
                  {vehicle.photos.length > 0 ? (
                    <img
                      alt={vehicle.title}
                      className="h-48 w-full object-cover"
                      src={vehicle.photos[0]}
                    />
                  ) : (
                    <div className="flex h-48 w-full items-center justify-center bg-gray-200">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}

                  {/* Remove from favorites button */}
                  <Button
                    className="absolute top-2 right-2 bg-white/90 text-red-600"
                    onClick={() => handleRemoveFavorite(vehicle._id)}
                    size="sm"
                    variant="ghost"
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div>
                    <h3 className="mb-2 line-clamp-1 font-semibold text-lg">
                      {vehicle.title}
                    </h3>
                    <p className="mb-2 text-gray-600 text-sm">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <div className="mb-4 flex items-center justify-between text-gray-600 text-sm">
                      <span>{formatMileage(vehicle.mileage)} miles</span>
                      <span className="font-semibold text-lg text-primary">
                        {formatPrice(vehicle.price)}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild className="w-full">
                      <Link href={`/vehicles/${vehicle._id}`}>
                        <Eye className="mr-1 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="w-full">
            <Card className="border-0 shadow-md">
              <CardContent className="py-20 text-center">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                  <Heart className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mb-3 font-semibold text-2xl text-gray-900">
                  No favorites yet
                </h3>
                <p className="mx-auto mb-8 max-w-md text-gray-600 leading-relaxed">
                  Start browsing vehicles and save your favorites for easy
                  access. Favorited vehicles will appear here so you can
                  quickly find them later.
                </p>
                <Button asChild>
                  <Link href="/vehicles">
                    <Eye className="mr-2 h-4 w-4" />
                    Browse Vehicles
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

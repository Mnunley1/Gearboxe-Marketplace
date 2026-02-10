"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import { useAuth } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  Award,
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Gauge,
  Heart,
  Mail,
  MapPin,
  Share2,
  Shield,
  Star,
  User,
  Users,
  X,
} from "lucide-react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useCallback, useEffect, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useToast } from "@/hooks/useToast";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";

interface VehiclePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function VehiclePage({ params }: VehiclePageProps) {
  const { isAuthenticated } = useConvexAuth();
  const { isSignedIn } = useAuth();
  const { user: convexUser, isAuthenticated: isUserAuthenticated, isLoading: userLoading } = useCurrentUser();
  const unwrappedParams = use(params);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { toast } = useToast();

  const vehicle = useQuery(api.vehicles.getVehicleById, {
    id: unwrappedParams.id as any,
  });
  const seller = useQuery(
    api.users.getUserById,
    vehicle?.userId ? { id: vehicle.userId } : "skip"
  );
  const vehicleEvent = useQuery(
    api.registrations.getRegistrationByVehicle,
    vehicle?._id ? { vehicleId: vehicle._id as any } : "skip"
  );
  const relatedVehicles = useQuery(api.vehicles.getVehicles, {
    status: "approved",
    make: vehicle?.make,
  });
  const addFavorite = useMutation(api.favorites.addFavorite);
  const removeFavorite = useMutation(api.favorites.removeFavorite);
  const trackView = useMutation(api.analytics.trackView);
  const trackShare = useMutation(api.analytics.trackShare);
  const isFavoritedQuery = useQuery(
    api.favorites.isFavorited,
    convexUser?._id && vehicle?._id
      ? { userId: convexUser._id, vehicleId: vehicle._id as any }
      : "skip"
  );

  // Filter out current vehicle from related vehicles
  const filteredRelatedVehicles =
    relatedVehicles?.vehicles?.filter((v) => v._id !== vehicle?._id).slice(0, 3) || [];

  useEffect(() => {
    // Set page title
    if (vehicle) {
      document.title = `${vehicle.title} - Gearboxe Market`;
    }
  }, [vehicle]);

  // Track view when vehicle loads
  useEffect(() => {
    if (vehicle?._id) {
      trackView({ vehicleId: vehicle._id as any }).catch((error) => {
        // Silently fail - don't block page render
        console.error("Error tracking view:", error);
      });
    }
  }, [vehicle?._id, trackView]);

  // Update favorite state when query result changes
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

  const nextPhoto = useCallback(() => {
    if (!vehicle) return;
    setCurrentPhotoIndex((prev) =>
      prev === vehicle.photos.length - 1 ? 0 : prev + 1
    );
  }, [vehicle]);

  const prevPhoto = useCallback(() => {
    if (!vehicle) return;
    setCurrentPhotoIndex((prev) =>
      prev === 0 ? vehicle.photos.length - 1 : prev - 1
    );
  }, [vehicle]);

  useEffect(() => {
    // Keyboard navigation for photo modal
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPhotoModalOpen) return;

      switch (e.key) {
        case "Escape":
          setIsPhotoModalOpen(false);
          break;
        case "ArrowLeft":
          prevPhoto();
          break;
        case "ArrowRight":
          nextPhoto();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isPhotoModalOpen, prevPhoto, nextPhoto]);

  useEffect(() => {
    // Close share menu when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      if (showShareMenu) {
        const target = e.target as Element;
        if (!target.closest("[data-share-menu]")) {
          setShowShareMenu(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showShareMenu]);

  // Loading state
  if (vehicle === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
        <Navbar />
        <div className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-6 h-6 w-1/4 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="rounded-xl bg-white p-6">
                  <div className="mb-4 h-8 w-3/4 rounded bg-gray-200" />
                  <div className="mb-4 h-6 w-1/2 rounded bg-gray-200" />
                  <div className="h-12 w-1/3 rounded bg-gray-200" />
                </div>
                <div className="h-96 rounded-xl bg-white" />
              </div>
              <div className="space-y-6">
                <div className="h-64 rounded-xl bg-white p-6" />
                <div className="h-48 rounded-xl bg-white p-6" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return notFound();
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);

  const formatMileage = (mileage: number) =>
    new Intl.NumberFormat("en-US").format(mileage);

  const formatDate = (timestamp: number) =>
    new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied!",
        description: "Vehicle link has been copied to your clipboard",
      });
      setShowShareMenu(false);
      // Track share
      if (vehicle?._id) {
        trackShare({ vehicleId: vehicle._id as any }).catch((error) => {
          console.error("Error tracking share:", error);
        });
      }
    } catch (error) {
      console.error("Error copying link:", error);
      toast({
        title: "Error",
        description: "Failed to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShareEmail = () => {
    const subject = `Check out this ${vehicle.year} ${vehicle.make} ${vehicle.model}`;
    const body = `I found this vehicle on Gearboxe Market and thought you might be interested:\n\n${vehicle.title}\n${vehicle.year} ${vehicle.make} ${vehicle.model}\nPrice: ${formatPrice(vehicle.price)}\n\nView it here: ${window.location.href}`;
    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink);
    setShowShareMenu(false);
    // Track share
    if (vehicle?._id) {
      trackShare({ vehicleId: vehicle._id as any }).catch((error) => {
        console.error("Error tracking share:", error);
      });
    }
  };

  const handleFavoriteToggle = async () => {
    // Wait for user loading to complete
    if (userLoading) return;

    // If user is not logged in, show auth dialog
    if (!(isUserAuthenticated && convexUser)) {
      setShowAuthDialog(true);
      return;
    }

    if (!vehicle || isFavoriteLoading) return;

    setIsFavoriteLoading(true);
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
      setIsFavoriteLoading(false);
    }
  };

  // Loading state
  if (vehicle === undefined) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
        <Navbar />
        <div className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="mb-6 h-6 w-1/4 rounded bg-gray-200" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-8 lg:col-span-2">
                <div className="rounded-xl bg-white p-6">
                  <div className="mb-4 h-8 w-3/4 rounded bg-gray-200" />
                  <div className="mb-4 h-6 w-1/2 rounded bg-gray-200" />
                  <div className="h-12 w-1/3 rounded bg-gray-200" />
                </div>
                <div className="h-96 rounded-xl bg-white" />
              </div>
              <div className="space-y-6">
                <div className="h-64 rounded-xl bg-white p-6" />
                <div className="h-48 rounded-xl bg-white p-6" />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!vehicle) {
    return notFound();
  }

  return (
    <>
      <Head>
        <title>{vehicle.title} - Gearboxe Market</title>
        <meta
          content={`${vehicle.year} ${vehicle.make} ${vehicle.model} for sale - ${formatPrice(vehicle.price)}. ${vehicle.description.substring(0, 160)}...`}
          name="description"
        />
        <meta content={`${vehicle.title} - Gearboxe Market`} property="og:title" />
        <meta
          content={`${vehicle.year} ${vehicle.make} ${vehicle.model} for sale - ${formatPrice(vehicle.price)}`}
          property="og:description"
        />
        <meta
          content={vehicle.photos[0] || "/placeholder-car.jpg"}
          property="og:image"
        />
        <meta
          content={`${typeof window !== "undefined" ? window.location.href : ""}`}
          property="og:url"
        />
        <meta content="summary_large_image" name="twitter:card" />
        <script
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Car",
              name: vehicle.title,
              brand: vehicle.make,
              model: vehicle.model,
              vehicleModelDate: vehicle.year,
              mileageFromOdometer: {
                "@type": "QuantitativeValue",
                value: vehicle.mileage,
                unitCode: "SMI",
              },
              offers: {
                "@type": "Offer",
                price: vehicle.price,
                priceCurrency: "USD",
              },
              description: vehicle.description,
              image: vehicle.photos,
            }),
          }}
          type="application/ld+json"
        />
      </Head>

      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />

        <div className="mx-auto max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm" aria-label="Breadcrumb">
            <Link
              className="flex items-center gap-1 text-gray-500 transition-colors hover:text-primary"
              href="/vehicles"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>All Vehicles</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="max-w-[200px] truncate font-medium text-gray-900 sm:max-w-none">{vehicle.title}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-8 lg:col-span-2">
              {/* Vehicle Header */}
              <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm sm:p-8">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h1 className="mb-2 font-bold text-2xl text-gray-900 tracking-tight sm:text-3xl">
                      {vehicle.title}
                    </h1>
                    <p className="mb-4 text-gray-600 text-lg">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700 text-sm">
                        <Gauge className="h-4 w-4 text-gray-500" />
                        <span className="tabular-nums">{formatMileage(vehicle.mileage)}</span>
                        <span className="text-gray-500">mi</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{vehicle.year}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                        <Clock className="h-4 w-4" />
                        <span>Listed {formatDate(vehicle.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center space-x-2 sm:mt-0">
                    <div className="relative" data-share-menu>
                      <Button
                        className="flex items-center"
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        size="sm"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </Button>

                      {/* Share Menu Dropdown */}
                      {showShareMenu && (
                        <div className="absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                          <div className="border-gray-100 border-b p-3">
                            <h3 className="font-semibold text-gray-900 text-sm">
                              Share this vehicle
                            </h3>
                            <p className="mt-1 text-gray-600 text-xs">
                              {vehicle.title}
                            </p>
                          </div>

                          <div className="p-2">
                            {/* Copy Link */}
                            <button
                              className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
                              onClick={handleCopyLink}
                            >
                              <Copy className="h-4 w-4 text-green-500" />
                              <span>Copy link</span>
                            </button>

                            {/* Email */}
                            <button
                              className="flex w-full items-center space-x-3 rounded-md px-3 py-2 text-gray-700 text-sm transition-colors hover:bg-gray-50"
                              onClick={handleShareEmail}
                            >
                              <Mail className="h-4 w-4 text-red-500" />
                              <span>Email</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      className="flex items-center"
                      disabled={isFavoriteLoading}
                      onClick={handleFavoriteToggle}
                      size="sm"
                      variant="outline"
                    >
                      <Heart
                        className={`mr-2 h-4 w-4 transition-colors ${
                          isFavorited ? "fill-red-500 text-red-500" : ""
                        } ${isFavoriteLoading ? "opacity-50" : ""}`}
                      />
                      {isFavorited ? "Saved" : "Save"}
                    </Button>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between border-gray-100 border-t pt-6">
                  <div>
                    <div className="font-medium text-gray-500 text-sm uppercase tracking-wider">Price</div>
                    <div className="font-bold text-3xl text-primary tabular-nums tracking-tight sm:text-4xl">
                      {formatPrice(vehicle.price)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 font-medium text-emerald-700 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>Verified</span>
                  </div>
                </div>
              </div>

              {/* Main Photo */}
              {vehicle.photos.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                  <div className="relative">
                    <Image
                      alt={`${vehicle.title} - Photo ${currentPhotoIndex + 1}`}
                      className="h-96 w-full cursor-pointer object-cover"
                      height={500}
                      onClick={() => setIsPhotoModalOpen(true)}
                      src={vehicle.photos[currentPhotoIndex]}
                      width={800}
                    />

                    {/* Sale Status Overlay */}
                    {vehicle.saleStatus && vehicle.saleStatus !== "available" && (
                      <div
                        className={`absolute right-0 bottom-0 left-0 z-10 flex items-center justify-center py-4 font-bold text-xl shadow-lg ${
                          vehicle.saleStatus === "sold"
                            ? "bg-red-200/80 text-red-900"
                            : vehicle.saleStatus === "salePending"
                              ? "bg-yellow-200/80 text-yellow-900"
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

                    {/* Photo Navigation */}
                    {vehicle.photos.length > 1 && (
                      <>
                        <Button
                          className="-translate-y-1/2 absolute top-1/2 left-4 transform border-gray-300 bg-gray-100 shadow-xl hover:bg-gray-200"
                          onClick={prevPhoto}
                          size="icon"
                          variant="outline"
                        >
                          <ChevronLeft className="h-6 w-6 text-primary" />
                        </Button>
                        <Button
                          className="-translate-y-1/2 absolute top-1/2 right-4 transform border-gray-300 bg-gray-100 shadow-xl hover:bg-gray-200"
                          onClick={nextPhoto}
                          size="icon"
                          variant="outline"
                        >
                          <ChevronRight className="h-6 w-6 text-primary" />
                        </Button>
                      </>
                    )}

                    {/* Photo Counter */}
                    <div className="absolute top-4 right-4 rounded-full bg-black/70 px-3 py-1 text-sm text-white">
                      {currentPhotoIndex + 1} / {vehicle.photos.length}
                    </div>
                  </div>

                  {/* Photo Thumbnails */}
                  {vehicle.photos.length > 1 && (
                    <div className="bg-gray-50 p-4">
                      <div className="flex space-x-2 overflow-x-auto">
                        {vehicle.photos.map((photo, index) => (
                          <button
                            className={`h-16 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 ${
                              index === currentPhotoIndex
                                ? "border-primary"
                                : "border-gray-200"
                            }`}
                            key={index}
                            onClick={() => setCurrentPhotoIndex(index)}
                          >
                            <Image
                              alt={`Thumbnail ${index + 1}`}
                              className="h-full w-full object-cover"
                              height={64}
                              src={photo}
                              width={80}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Vehicle Details */}
              <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="p-6">
                  <h2 className="font-semibold text-gray-900 text-xl">
                    Vehicle Details
                  </h2>
                </div>
                <div className="border-gray-200 border-b" />
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Vehicle Information */}
                    <div>
                      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                        Vehicle Information
                      </h3>
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                        <div className="space-y-4">
                          <div className="flex justify-between border-gray-100 border-b py-3">
                            <span className="font-medium text-gray-600 text-sm">
                              Make
                            </span>
                            <span className="font-medium text-gray-900">
                              {vehicle.make}
                            </span>
                          </div>
                          <div className="flex justify-between border-gray-100 border-b py-3">
                            <span className="font-medium text-gray-600 text-sm">
                              Model
                            </span>
                            <span className="font-medium text-gray-900">
                              {vehicle.model}
                            </span>
                          </div>
                          <div className="flex justify-between border-gray-100 border-b py-3">
                            <span className="font-medium text-gray-600 text-sm">
                              Year
                            </span>
                            <span className="font-medium text-gray-900">
                              {vehicle.year}
                            </span>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div className="flex justify-between border-gray-100 border-b py-3">
                            <span className="font-medium text-gray-600 text-sm">
                              Mileage
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatMileage(vehicle.mileage)} miles
                            </span>
                          </div>
                          <div className="flex justify-between border-gray-100 border-b py-3">
                            <span className="font-medium text-gray-600 text-sm">
                              Price
                            </span>
                            <span className="font-semibold text-lg text-primary">
                              {formatPrice(vehicle.price)}
                            </span>
                          </div>
                          {vehicle.vin && (
                            <div className="flex justify-between border-gray-100 border-b py-3">
                              <span className="font-medium text-gray-600 text-sm">
                                VIN
                              </span>
                              <span className="font-mono text-gray-900 text-sm">
                                {vehicle.vin}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                        Description
                      </h3>
                      <div className="rounded-xl bg-gray-50/80 p-5">
                        <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                          {vehicle.description}
                        </p>
                      </div>
                    </div>

                    {/* Features & Highlights */}
                    <div>
                      <h3 className="mb-4 font-semibold text-gray-900 text-lg">
                        Highlights
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                            <Shield className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Verified</div>
                            <div className="text-gray-500 text-xs">Listing checked</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-blue-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                            <Award className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Quality</div>
                            <div className="text-gray-500 text-xs">Standards met</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 rounded-xl bg-violet-50 p-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-100">
                            <Users className="h-5 w-5 text-violet-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm">Community</div>
                            <div className="text-gray-500 text-xs">Member verified</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Seller Info */}
              {seller && (
                <div className="rounded-2xl border border-gray-200/60 bg-white p-6 shadow-sm">
                  <div className="mb-5 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary/10 to-primary/5">
                      <User className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                      <Link href={`/profile/${seller._id}`} className="font-semibold text-gray-900 text-lg transition-colors hover:text-primary">
                        {seller.name}
                      </Link>
                      <div className="flex items-center gap-1.5 text-sm">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium text-amber-600">Verified Seller</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 space-y-3 rounded-xl bg-gray-50 p-4">
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="truncate">{vehicle.contactInfo}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span>Local Seller</span>
                    </div>
                  </div>

                  {isAuthenticated || isSignedIn ? (
                    <Button asChild className="w-full">
                      <Link
                        href={`/myAccount/messages/${vehicle._id}/${vehicle.userId}`}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Message Seller
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild className="w-full">
                      <Link href="/sign-in">Sign In to Contact Seller</Link>
                    </Button>
                  )}
                </div>
              )}

              {/* Related Vehicles */}
              {filteredRelatedVehicles.length > 0 && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h3 className="mb-4 font-semibold text-gray-900">
                    Similar Vehicles
                  </h3>
                  <div className="space-y-4">
                    {filteredRelatedVehicles.map((relatedVehicle) => (
                      <Link
                        className="group block"
                        href={`/vehicles/${relatedVehicle._id}`}
                        key={relatedVehicle._id}
                      >
                        <div className="flex space-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50">
                          {relatedVehicle.photos.length > 0 ? (
                            <Image
                              alt={relatedVehicle.title}
                              className="h-15 w-20 rounded-lg object-cover"
                              height={60}
                              src={relatedVehicle.photos[0]}
                              width={80}
                            />
                          ) : (
                            <div className="flex h-15 w-20 items-center justify-center rounded-lg bg-gray-200">
                              <Car className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <h4 className="truncate font-medium text-gray-900 transition-colors group-hover:text-primary">
                              {relatedVehicle.title}
                            </h4>
                            <p className="text-gray-600 text-sm">
                              {relatedVehicle.year} {relatedVehicle.make}{" "}
                              {relatedVehicle.model}
                            </p>
                            <p className="font-semibold text-primary text-sm">
                              {formatPrice(relatedVehicle.price)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <Button asChild className="mt-4 w-full" variant="outline">
                    <Link href="/vehicles">View All Vehicles</Link>
                  </Button>
                </div>
              )}

              {/* Upcoming Event */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 font-semibold text-gray-900">
                  Upcoming Event
                </h3>
                {vehicleEvent?.event ? (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Calendar className="mt-0.5 h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {vehicleEvent.event.name}
                        </h4>
                        <p className="mt-1 text-gray-600 text-sm">
                          {new Date(vehicleEvent.event.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {vehicleEvent.event.location}
                        </p>
                        <p className="mt-1 text-gray-500 text-sm">
                          {vehicleEvent.event.address}
                        </p>
                      </div>
                    </div>
                    <div className="border-gray-100 border-t pt-2">
                      <p className="mb-3 text-gray-600 text-xs">
                        This vehicle will be displayed at this event.
                      </p>
                      <Button asChild className="w-full" variant="outline">
                        <Link href="/events">View All Events</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <Calendar className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                    <p className="mb-4 text-gray-600 text-sm">
                      This vehicle is not currently registered for any events.
                    </p>
                    <Button asChild className="w-full" variant="outline">
                      <Link href="/events">View All Events</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <Footer />

        {/* Photo Modal */}
        {isPhotoModalOpen && vehicle.photos.length > 0 && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <div className="relative max-h-full max-w-4xl">
              <Button
                className="absolute top-4 right-4 z-10 border-gray-300 bg-gray-100 shadow-xl hover:bg-gray-200"
                onClick={() => setIsPhotoModalOpen(false)}
                size="icon"
                variant="outline"
              >
                <X className="h-6 w-6 text-primary" />
              </Button>

              <div className="relative">
                <Image
                  alt={`${vehicle.title} - Photo ${currentPhotoIndex + 1}`}
                  className="max-h-[80vh] max-w-full rounded-lg object-contain"
                  height={800}
                  src={vehicle.photos[currentPhotoIndex]}
                  width={1200}
                />

                {vehicle.photos.length > 1 && (
                  <>
                    <Button
                      className="-translate-y-1/2 absolute top-1/2 left-4 transform border-gray-300 bg-gray-100 shadow-xl hover:bg-gray-200"
                      onClick={prevPhoto}
                      size="icon"
                      variant="outline"
                    >
                      <ChevronLeft className="h-6 w-6 text-primary" />
                    </Button>
                    <Button
                      className="-translate-y-1/2 absolute top-1/2 right-4 transform border-gray-300 bg-gray-100 shadow-xl hover:bg-gray-200"
                      onClick={nextPhoto}
                      size="icon"
                      variant="outline"
                    >
                      <ChevronRight className="h-6 w-6 text-primary" />
                    </Button>
                  </>
                )}
              </div>

              <div className="mt-4 text-center text-white">
                <p className="text-sm">
                  {currentPhotoIndex + 1} of {vehicle.photos.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Auth Dialog */}
        {showAuthDialog && (
          <div
            className="fade-in-0 fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowAuthDialog(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-dialog-title"
            aria-describedby="auth-dialog-description"
          >
            <div
              className="zoom-in-95 fade-in-0 slide-in-from-bottom-4 relative w-full max-w-md animate-in rounded-xl border border-gray-200 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setShowAuthDialog(false)}
                className="absolute top-4 right-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-950 focus:ring-offset-2 disabled:pointer-events-none"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4 text-gray-500" />
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
                    id="auth-dialog-title"
                    className="mb-2 font-semibold text-gray-900 text-xl"
                  >
                    Sign in to favorite vehicles
                  </h2>
                  <p
                    id="auth-dialog-description"
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
                    className="w-full sm:w-auto"
                    onClick={() => setShowAuthDialog(false)}
                  >
                    <Link href="/sign-up">Create Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

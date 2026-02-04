"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import { Card, CardContent, CardFooter } from "@car-market/ui/card";
import { Input } from "@car-market/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@car-market/ui/select";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import {
  BarChart3,
  Camera,
  Car,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Gauge,
  Grid,
  Heart,
  LayoutList,
  Mail,
  Plus,
  QrCode,
  Search,
  Share2,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { redirect, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useToast } from "@/hooks/useToast";
import { Footer } from "../../../../components/footer";
import { Navbar } from "../../../../components/navbar";
import { QRDisplay } from "../../../../components/qr-display";

type VehicleAnalyticsProps = {
  vehicleId: string;
  formatNumber: (num: number) => string;
};

function VehicleAnalytics({ vehicleId, formatNumber }: VehicleAnalyticsProps) {
  const analytics = useQuery(
    api.analytics.getVehicleAnalytics,
    vehicleId ? { vehicleId: vehicleId as any } : "skip"
  );

  if (!analytics) return null;

  return (
    <div className="flex items-center gap-4 text-gray-600 text-sm">
      <div className="flex items-center gap-1">
        <Eye className="h-4 w-4" />
        <span>{formatNumber(analytics.views)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Share2 className="h-4 w-4" />
        <span>{formatNumber(analytics.shares)}</span>
      </div>
      <div className="flex items-center gap-1">
        <Heart className="h-4 w-4" />
        <span>{formatNumber(analytics.favorites)}</span>
      </div>
    </div>
  );
}

export default function MyListingsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user } = useUser();
  const { toast } = useToast();
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [vehicleToDelete, setVehicleToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [searchQuery, setSearchQuery] = useState("");

  // Always call hooks to maintain hook order
  const currentUser = useQuery(
    api.users.getUser,
    user?.id ? { clerkId: user.id } : "skip"
  );
  const userVehicles = useQuery(
    api.vehicles.getVehiclesByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const userRegistrations = useQuery(
    api.registrations.getRegistrationsByUser,
    currentUser?._id ? { userId: currentUser._id } : "skip"
  );
  const deleteVehicle = useMutation(api.vehicles.deleteVehicle);
  const updateSaleStatus = useMutation(api.vehicles.updateSaleStatus);
  const resendConfirmationEmail = useMutation(api.registrations.resendConfirmationEmail);
  const [resendingEmail, setResendingEmail] = useState<string | null>(null);

  // Derived data
  const stats = useMemo(() => {
    if (!userVehicles) return { total: 0, active: 0, pending: 0, sold: 0 };
    return {
      total: userVehicles.length,
      active: userVehicles.filter((v: any) => v.status === "approved" && v.saleStatus !== "sold").length,
      pending: userVehicles.filter((v: any) => v.status === "pending").length,
      sold: userVehicles.filter((v: any) => v.saleStatus === "sold").length,
    };
  }, [userVehicles]);

  const filteredVehicles = useMemo(() => {
    if (!userVehicles) return [];
    let filtered = [...userVehicles];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(v =>
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.year.toString().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "salePending") {
        filtered = filtered.filter(v => v.saleStatus === "salePending");
      } else if (statusFilter === "sold") {
        filtered = filtered.filter(v => v.saleStatus === "sold");
      } else {
        filtered = filtered.filter(v => v.status === statusFilter);
      }
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "oldest": return a._creationTime - b._creationTime;
        case "priceHigh": return b.price - a.price;
        case "priceLow": return a.price - b.price;
        default: return b._creationTime - a._creationTime;
      }
    });

    return filtered;
  }, [userVehicles, searchQuery, statusFilter, sortBy]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
          {/* Skeleton header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
              <div className="mt-2 h-4 w-72 animate-pulse rounded-lg bg-gray-100" />
            </div>
            <div className="h-10 w-32 animate-pulse rounded-lg bg-gray-200" />
          </div>
          {/* Skeleton stats */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4" key={i}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-100" />
                  <div className="space-y-2">
                    <div className="h-6 w-8 rounded bg-gray-200" />
                    <div className="h-3 w-16 rounded bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div className="animate-pulse rounded-xl border border-gray-100 bg-white p-4" key={i}>
                <div className="mb-4 aspect-[4/3] rounded-lg bg-gray-100" />
                <div className="space-y-3">
                  <div className="h-5 w-3/4 rounded-lg bg-gray-100" />
                  <div className="h-4 w-1/2 rounded-lg bg-gray-100" />
                  <div className="flex justify-between pt-2">
                    <div className="h-6 w-1/3 rounded-lg bg-gray-100" />
                    <div className="h-4 w-1/4 rounded-lg bg-gray-100" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!(isAuthenticated && user)) {
    redirect("/sign-in");
  }

  const createdVehicleId = searchParams.get("created");

  const handleDeleteVehicle = async () => {
    if (!vehicleToDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      await deleteVehicle({ id: vehicleToDelete.id as any });
      toast({
        title: "Listing Deleted",
        description: `${vehicleToDelete.title} has been deleted successfully.`,
      });
      router.refresh();
    } catch (error: any) {
      console.error("Error deleting vehicle:", error);
      const errorMessage =
        error?.message || "Failed to delete listing. Please try again.";
      toast({
        title: "Error Deleting Listing",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setVehicleToDelete(null);
    }
  };

  const handleSaleStatusChange = async (
    vehicleId: string,
    saleStatus: "available" | "salePending" | "sold"
  ) => {
    try {
      setUpdatingStatus(vehicleId);
      await updateSaleStatus({ id: vehicleId as any, saleStatus });
      toast({
        title: "Status Updated",
        description: "Sale status has been updated successfully.",
      });
      router.refresh();
    } catch (error: any) {
      console.error("Error updating sale status:", error);
      const errorMessage =
        error?.message || "Failed to update sale status. Please try again.";
      toast({
        title: "Error Updating Status",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
      case "pending":
        return <Clock className="h-3.5 w-3.5 text-yellow-600" />;
      case "rejected":
        return <XCircle className="h-3.5 w-3.5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  const getDaysAgo = (creationTime: number) => {
    const now = Date.now();
    const diff = now - creationTime;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const statusFilterOptions = [
    { value: "all", label: "All" },
    { value: "approved", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "salePending", label: "Sale Pending" },
    { value: "sold", label: "Sold" },
    { value: "rejected", label: "Rejected" },
  ];

  const renderVehicleContent = (vehicle: any) => {
    const registration = userRegistrations?.find(
      (reg: any) => reg.vehicleId === vehicle._id
    );

    return (
      <div className="space-y-2.5">
        {/* Title + Price row */}
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 truncate font-semibold text-gray-900 text-base leading-tight">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <span className="flex-shrink-0 font-bold text-primary text-lg tabular-nums">
            ${vehicle.price.toLocaleString()}
          </span>
        </div>

        {/* Secondary info row: mileage + status badge + analytics */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {vehicle.mileage && (
            <div className="flex items-center gap-1 text-gray-500 text-xs">
              <Gauge className="h-3.5 w-3.5" />
              <span className="tabular-nums">{vehicle.mileage.toLocaleString()}</span>
              <span className="text-gray-400">mi</span>
            </div>
          )}
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(vehicle.status)}`}
          >
            {getStatusIcon(vehicle.status)}
            <span className="capitalize">{vehicle.status}</span>
          </span>
          {vehicle.status === "pending" && (
            <span className="text-xs text-gray-400">
              {getDaysAgo(vehicle._creationTime)}d ago
            </span>
          )}
          {vehicle.status === "rejected" && (
            <span className="text-xs text-red-500">
              Did not meet guidelines
            </span>
          )}
        </div>

        {/* Analytics */}
        <VehicleAnalytics
          formatNumber={formatNumber}
          vehicleId={vehicle._id}
        />

        {/* Registration Info - compact */}
        {registration && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <span className="font-medium text-gray-700">
              {registration.event?.name}
            </span>
            {registration.event?.date && (
              <span className="text-gray-400">
                {new Date(registration.event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
            {registration.paymentStatus === "completed" && registration.qrCodeData && (
              <Button
                className="h-6 px-2 text-xs"
                disabled={resendingEmail === registration._id}
                onClick={async () => {
                  try {
                    setResendingEmail(registration._id);
                    await resendConfirmationEmail({
                      registrationId: registration._id as any,
                    });
                    toast({
                      title: "Email Sent",
                      description: "Confirmation email with QR code has been resent.",
                    });
                  } catch (error: any) {
                    toast({
                      title: "Error",
                      description: error?.message || "Failed to resend email.",
                      variant: "destructive",
                    });
                  } finally {
                    setResendingEmail(null);
                  }
                }}
                size="sm"
                variant="outline"
              >
                <Mail className="mr-1 h-3 w-3" />
                {resendingEmail === registration._id ? "Sending..." : "Resend QR"}
              </Button>
            )}
            {registration.paymentStatus === "pending" && (
              <Button
                asChild
                className="h-6 px-2 text-xs"
                size="sm"
              >
                <Link href={`/myAccount/payment?registrationId=${registration._id}&vehicleId=${vehicle._id}&eventId=${registration.eventId}`}>
                  Complete Payment
                </Link>
              </Button>
            )}
          </div>
        )}

        {/* Event Location - compact */}
        {vehicle.event && (
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700">{vehicle.event.name}</span>
            {vehicle.event.location && <span>{vehicle.event.location}</span>}
            {vehicle.event.date && (
              <span>
                {new Date(vehicle.event.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            )}
          </div>
        )}

      </div>
    );
  };

  const renderSaleStatus = (vehicle: any) => {
    if (vehicle.status !== "approved") return null;
    return (
      <div className="flex items-center gap-3 border-t border-gray-100 px-5 py-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sale Status</span>
        <Select
          value={vehicle.saleStatus || "available"}
          onValueChange={(value) =>
            handleSaleStatusChange(
              vehicle._id,
              value as "available" | "salePending" | "sold"
            )
          }
          disabled={updatingStatus === vehicle._id}
        >
          <SelectTrigger className="h-8 w-[140px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="salePending">Sale Pending</SelectItem>
            <SelectItem value="sold">Sold</SelectItem>
          </SelectContent>
        </Select>
        {updatingStatus === vehicle._id && (
          <span className="text-xs text-gray-400 animate-pulse">Updating...</span>
        )}
      </div>
    );
  };

  const renderActionButtons = (vehicle: any) => (
    <CardFooter className="flex items-center gap-2 border-t border-gray-100 px-5 py-3">
      <Button
        asChild
        className="flex-1 h-9"
        size="sm"
        variant="outline"
      >
        <Link href={`/myAccount/edit-listing/${vehicle._id}`}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Link>
      </Button>
      <Button
        asChild
        className="flex-1 h-9"
        size="sm"
        variant="outline"
      >
        <Link href={`/vehicles/${vehicle._id}`}>
          <Eye className="mr-2 h-4 w-4" />
          View Live
        </Link>
      </Button>
      <Button
        className="flex-1 h-9"
        onClick={() =>
          setVehicleToDelete({
            id: vehicle._id,
            title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
          })
        }
        size="sm"
        variant="outline"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </CardFooter>
  );

  const renderVehicleImage = (vehicle: any, className: string) => {
    const registration = userRegistrations?.find(
      (reg: any) => reg.vehicleId === vehicle._id
    );

    return (
      <div className={`group relative overflow-hidden ${className}`}>
        {vehicle.photos.length > 0 ? (
          <img
            alt={vehicle.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            src={vehicle.photos[0]}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
            <div className="flex flex-col items-center gap-2">
              <div className="rounded-full bg-gray-200/80 p-4">
                <Car className="h-8 w-8 text-gray-400" />
              </div>
              <span className="text-xs text-gray-400">No image</span>
            </div>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Photo count badge */}
        {vehicle.photos.length > 1 && (
          <div className={`absolute z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm ${
            vehicle.saleStatus && vehicle.saleStatus !== "available" ? "bottom-3 left-3" : "bottom-3 left-3"
          }`}>
            <Camera className="h-3.5 w-3.5" />
            {vehicle.photos.length}
          </div>
        )}

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

        {/* Registration Status */}
        {registration && (
          <div className="absolute top-2 right-2">
            <div className="flex items-center space-x-2">
              <span
                className={`rounded-full px-2 py-1 text-xs ${
                  registration.checkedIn
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {registration.checkedIn
                  ? "Checked In"
                  : "Not Checked In"}
              </span>
              {registration.qrCodeData && (
                <Button
                  className="bg-white/80"
                  onClick={() =>
                    setSelectedQR(registration.qrCodeData!)
                  }
                  size="sm"
                  variant="ghost"
                >
                  <QrCode className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-bold text-3xl text-gray-900">My Listings</h1>
              <p className="text-gray-600">
                Manage your vehicle listings and registrations
              </p>
            </div>
            <Button asChild>
              <Link href="/myAccount/new-listing">
                <Plus className="mr-2 h-5 w-5" />
                New Listing
              </Link>
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {createdVehicleId && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center">
              <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
              <p className="text-green-800">
                Your listing has been created successfully! It will be reviewed
                by our team.
              </p>
            </div>
          </div>
        )}

        {/* Enhancement 1: Summary Stats Bar */}
        {userVehicles && userVehicles.length > 0 && (
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="border-gray-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-gray-900">{stats.total}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-green-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-gray-900">{stats.active}</p>
                  <p className="text-xs text-gray-500">Active</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-yellow-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
                  <Clock className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-gray-900">{stats.pending}</p>
                  <p className="text-xs text-gray-500">Pending</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-red-200">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <Car className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-bold text-2xl text-gray-900">{stats.sold}</p>
                  <p className="text-xs text-gray-500">Sold</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhancement 2: Search Bar + Filter/Sort Toolbar */}
        {userVehicles && userVehicles.length > 0 && (
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-10"
                placeholder="Search by make, model, or year..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter pills + Sort + View toggle */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* Status filter pills */}
              <div className="flex flex-wrap gap-2">
                {statusFilterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setStatusFilter(option.value)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      statusFilter === option.value
                        ? "bg-primary text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Sort + View toggle */}
              <div className="flex items-center gap-3">
                <Select
                  onValueChange={(value) => setSortBy(value)}
                  value={sortBy}
                >
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="priceHigh">Price: High to Low</SelectItem>
                    <SelectItem value="priceLow">Price: Low to High</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle */}
                <div className="hidden items-center rounded-lg border border-gray-200 bg-gray-50 p-1 sm:flex">
                  <Button
                    onClick={() => setViewMode("grid")}
                    size="icon-sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className={viewMode === "grid" ? "shadow-sm" : ""}
                  >
                    <Grid className="h-4 w-4" />
                    <span className="sr-only">Grid view</span>
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    size="icon-sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className={viewMode === "list" ? "shadow-sm" : ""}
                  >
                    <LayoutList className="h-4 w-4" />
                    <span className="sr-only">List view</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Listings */}
        {userVehicles && userVehicles.length > 0 ? (
          filteredVehicles.length > 0 ? (
            viewMode === "grid" ? (
              /* Enhancement 3: Grid View */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                  <Card
                    className="group overflow-hidden rounded-xl border-gray-200/60 bg-white transition-all duration-300 hover:border-gray-300/80 hover:shadow-xl hover:shadow-gray-200/50 hover:-translate-y-0.5"
                    key={vehicle._id}
                  >
                    {/* Image */}
                    {renderVehicleImage(vehicle, "aspect-[4/3]")}

                    {/* Content */}
                    <CardContent className="px-5 py-4">
                      {renderVehicleContent(vehicle)}
                    </CardContent>

                    {/* Sale Status */}
                    {renderSaleStatus(vehicle)}

                    {/* Actions */}
                    {renderActionButtons(vehicle)}
                  </Card>
                ))}
              </div>
            ) : (
              /* Enhancement 3: List View */
              <div className="space-y-4">
                {filteredVehicles.map((vehicle) => (
                  <Card
                    className="group overflow-hidden rounded-xl border-gray-200/60 bg-white transition-all duration-300 hover:border-gray-300/80 hover:shadow-lg hover:shadow-gray-200/40"
                    key={vehicle._id}
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Image */}
                      {renderVehicleImage(vehicle, "h-48 w-full flex-shrink-0 sm:h-auto sm:w-[280px] sm:min-h-[180px]")}

                      {/* Content */}
                      <CardContent className="flex flex-1 flex-col justify-center px-5 py-4">
                        {renderVehicleContent(vehicle)}
                      </CardContent>
                    </div>

                    {/* Sale Status */}
                    {renderSaleStatus(vehicle)}

                    {/* Actions */}
                    {renderActionButtons(vehicle)}
                  </Card>
                ))}
              </div>
            )
          ) : (
            /* Enhancement 10: Filtered Empty State */
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                No matching listings
              </h3>
              <p className="mb-6 max-w-sm text-gray-600">
                Try adjusting your search or filters to find what you are looking for.
              </p>
              <Button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setSortBy("newest");
                }}
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            </div>
          )
        ) : (
          /* Original empty state */
          <div className="w-full">
            <Card>
              <CardContent className="py-16 text-center">
                <div className="mb-4 text-gray-400">
                  <svg
                    className="mx-auto h-16 w-16"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                    />
                    <path
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                    />
                  </svg>
                </div>
                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                  No Listings Yet
                </h3>
                <p className="mb-6 text-gray-600">
                  Create your first vehicle listing to get started selling at
                  our events.
                </p>
                <Button asChild>
                  <Link href="/myAccount/new-listing">
                    Create Your First Listing
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {vehicleToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Delete vehicle?
                </h3>
                <p className="mt-1 text-sm text-gray-600">
                  This will permanently remove {vehicleToDelete.title} from your
                  listings. This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={() => setVehicleToDelete(null)}
                size="icon"
                variant="ghost"
              >
                X
              </Button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                onClick={() => setVehicleToDelete(null)}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                disabled={isDeleting}
                onClick={handleDeleteVehicle}
                size="sm"
                variant="destructive"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-lg">Event QR Code</h3>
              <Button
                onClick={() => setSelectedQR(null)}
                size="sm"
                variant="ghost"
              >
                ×
              </Button>
            </div>
            <QRDisplay
              description="Show this QR code at the event for check-in"
              qrCodeData={selectedQR}
              title="Check-in QR Code"
            />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

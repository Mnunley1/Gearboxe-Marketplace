"use client";

import { api } from "@car-market/convex/_generated/api";
import { Button } from "@car-market/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@car-market/ui/select";
import { useQuery } from "convex/react";
import { Car, Filter, Grid, List } from "lucide-react";
import { useState } from "react";
import { Footer } from "../../../components/footer";
import { Navbar } from "../../../components/navbar";
import { Pagination } from "../../../components/pagination";
import { VehicleCard } from "../../../components/vehicle-card";
import { VehicleFilters } from "../../../components/vehicle-filters";

type SortOption =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "year_desc"
  | "year_asc"
  | "mileage_asc"
  | "mileage_desc";

export default function VehiclesPage() {
  const [filters, setFilters] = useState({
    make: undefined,
    model: undefined,
    minPrice: undefined,
    maxPrice: undefined,
    minYear: undefined,
    maxYear: undefined,
    minMileage: undefined,
    maxMileage: undefined,
  });
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const pageSize = 24;

  const result = useQuery(api.vehicles.getVehicles, {
    status: "approved",
    ...filters,
    sortBy,
    page: currentPage,
    pageSize,
  });

  // Reset to page 1 when filters change
  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  // Reset to page 1 when sort changes
  const handleSortChange = (newSort: SortOption) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  const vehicles = result?.vehicles ?? [];
  const total = result?.total ?? 0;
  const totalPages = result?.totalPages ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Navbar />

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="mb-2 font-bold text-3xl text-gray-900 sm:text-4xl">
            Browse Vehicles
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Discover amazing cars from local sellers. Find your next vehicle
            today.
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
            <div className="sticky top-6">
              <VehicleFilters onFiltersChange={handleFiltersChange} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="mb-4 flex items-center justify-between lg:hidden">
              <Button
                onClick={() => setIsMobileFiltersOpen(true)}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {result && result.total > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-white">
                    {result.total}
                  </span>
                )}
              </Button>
            </div>

            {/* Mobile Filters Overlay */}
            <div className="lg:hidden">
              <VehicleFilters
                isMobileOpen={isMobileFiltersOpen}
                onFiltersChange={handleFiltersChange}
                onMobileClose={() => setIsMobileFiltersOpen(false)}
              />
            </div>

            {/* Results Header */}
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <h2 className="font-semibold text-gray-900 text-base sm:text-lg">
                  {result
                    ? `${total.toLocaleString()} vehicle${total !== 1 ? "s" : ""} found`
                    : "Loading..."}
                </h2>
                {result && totalPages > 1 && (
                  <span className="hidden text-gray-500 text-sm sm:inline">
                    Page {currentPage} of {totalPages}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Sort Dropdown */}
                <Select
                  onValueChange={(value) => handleSortChange(value as SortOption)}
                  value={sortBy}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                    <SelectItem value="year_desc">Year: Newest</SelectItem>
                    <SelectItem value="year_asc">Year: Oldest</SelectItem>
                    <SelectItem value="mileage_asc">Mileage: Low to High</SelectItem>
                    <SelectItem value="mileage_desc">Mileage: High to Low</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode Toggle - Desktop Only */}
                <div className="hidden items-center gap-1 rounded-md border border-gray-200 p-1 sm:flex">
                  <Button
                    onClick={() => setViewMode("grid")}
                    size="sm"
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className="h-8"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => setViewMode("list")}
                    size="sm"
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className="h-8"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Vehicles Grid/List */}
            {result && vehicles.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                      : "space-y-4"
                  }
                >
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle._id} vehicle={vehicle} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      totalPages={totalPages}
                    />
                  </div>
                )}
              </>
            ) : result && vehicles.length === 0 ? (
              <div className="py-16 text-center">
                <Car className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                <h3 className="mb-2 font-semibold text-gray-900 text-xl">
                  No vehicles found
                </h3>
                <p className="mb-4 text-gray-600">
                  Try adjusting your filters or check back later for new
                  listings.
                </p>
                <Button
                  onClick={() => {
                    handleFiltersChange({
                      make: undefined,
                      model: undefined,
                      minPrice: undefined,
                      maxPrice: undefined,
                      minYear: undefined,
                      maxYear: undefined,
                      minMileage: undefined,
                      maxMileage: undefined,
                    });
                  }}
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-gray-200 border-t-primary" />
                <p className="text-gray-600">Loading vehicles...</p>
              </div>
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

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
import { Car, Filter, Grid, LayoutList, SlidersHorizontal, X } from "lucide-react";
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

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "year_desc", label: "Year: Newest" },
  { value: "year_asc", label: "Year: Oldest" },
  { value: "mileage_asc", label: "Mileage: Lowest" },
  { value: "mileage_desc", label: "Mileage: Highest" },
];

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

  // Count active filters
  const activeFilterCount = Object.entries(filters).filter(([_, value]) => value !== undefined).length;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Browse Vehicles
            </h1>
            <p className="text-gray-600">
              Discover quality pre-owned vehicles from verified local sellers
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex gap-8">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0">
            <div className="sticky top-24">
              <VehicleFilters onFiltersChange={handleFiltersChange} />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              {/* Left side - Results count and mobile filter button */}
              <div className="flex items-center gap-4">
                {/* Mobile Filter Button */}
                <Button
                  onClick={() => setIsMobileFiltersOpen(true)}
                  size="sm"
                  variant="outline"
                  className="lg:hidden"
                >
                  <SlidersHorizontal className="mr-2 h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                {/* Results Count */}
                <div className="text-sm text-gray-600">
                  {result ? (
                    <span>
                      <span className="font-semibold text-gray-900">{total.toLocaleString()}</span>
                      {" "}vehicle{total !== 1 ? "s" : ""} found
                      {totalPages > 1 && (
                        <span className="hidden sm:inline text-gray-400">
                          {" "}| Page {currentPage} of {totalPages}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-gray-400">Loading...</span>
                  )}
                </div>
              </div>

              {/* Right side - Sort and View toggle */}
              <div className="flex items-center gap-3">
                {/* Sort Dropdown */}
                <Select
                  onValueChange={(value) => handleSortChange(value as SortOption)}
                  value={sortBy}
                >
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
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

            {/* Mobile Filters Overlay */}
            <div className="lg:hidden">
              <VehicleFilters
                isMobileOpen={isMobileFiltersOpen}
                onFiltersChange={handleFiltersChange}
                onMobileClose={() => setIsMobileFiltersOpen(false)}
              />
            </div>

            {/* Active Filters Chips */}
            {activeFilterCount > 0 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                <span className="text-sm text-gray-500">Active filters:</span>
                {filters.make && (
                  <FilterChip
                    label={`Make: ${filters.make}`}
                    onRemove={() => handleFiltersChange({ ...filters, make: undefined })}
                  />
                )}
                {filters.model && (
                  <FilterChip
                    label={`Model: ${filters.model}`}
                    onRemove={() => handleFiltersChange({ ...filters, model: undefined })}
                  />
                )}
                {(filters.minPrice || filters.maxPrice) && (
                  <FilterChip
                    label={`Price: ${filters.minPrice ? `$${filters.minPrice.toLocaleString()}` : "Any"} - ${filters.maxPrice ? `$${filters.maxPrice.toLocaleString()}` : "Any"}`}
                    onRemove={() => handleFiltersChange({ ...filters, minPrice: undefined, maxPrice: undefined })}
                  />
                )}
                {(filters.minYear || filters.maxYear) && (
                  <FilterChip
                    label={`Year: ${filters.minYear || "Any"} - ${filters.maxYear || "Any"}`}
                    onRemove={() => handleFiltersChange({ ...filters, minYear: undefined, maxYear: undefined })}
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700"
                  onClick={() => handleFiltersChange({
                    make: undefined,
                    model: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    minYear: undefined,
                    maxYear: undefined,
                    minMileage: undefined,
                    maxMileage: undefined,
                  })}
                >
                  Clear all
                </Button>
              </div>
            )}

            {/* Vehicles Grid/List */}
            {result && vehicles.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3"
                      : "flex flex-col gap-4"
                  }
                >
                  {vehicles.map((vehicle) => (
                    <VehicleCard key={vehicle._id} vehicle={vehicle} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      totalPages={totalPages}
                    />
                  </div>
                )}
              </>
            ) : result && vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white py-20 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <Car className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                  No vehicles found
                </h3>
                <p className="mb-6 max-w-sm text-gray-600">
                  Try adjusting your filters or check back later for new listings.
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
                  <X className="mr-2 h-4 w-4" />
                  Clear All Filters
                </Button>
              </div>
            ) : (
              /* Loading State */
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
            )}
          </main>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Filter Chip Component
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
      {label}
      <button
        onClick={onRemove}
        className="ml-1 rounded-full p-0.5 hover:bg-primary/20 transition-colors"
        aria-label={`Remove ${label} filter`}
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

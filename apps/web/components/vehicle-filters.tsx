"use client";

import { Button } from "@gearboxe-market/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@gearboxe-market/ui/card";
import { Input } from "@gearboxe-market/ui/input";
import { Label } from "@gearboxe-market/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gearboxe-market/ui/select";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";

type VehicleFiltersProps = {
  onFiltersChange: (filters: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
    minMileage?: number;
    maxMileage?: number;
  }) => void;
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
};

const makes = [
  "Acura",
  "Audi",
  "BMW",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Dodge",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Mazda",
  "Mercedes-Benz",
  "MINI",
  "Mitsubishi",
  "Nissan",
  "Porsche",
  "Ram",
  "Subaru",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 30 }, (_, i) => currentYear - i);

export function VehicleFilters({
  onFiltersChange,
  className,
  isMobileOpen = false,
  onMobileClose,
}: VehicleFiltersProps) {
  const [filters, setFilters] = useState({
    make: "all",
    model: "",
    minPrice: "",
    maxPrice: "",
    minYear: "any",
    maxYear: "any",
    minMileage: "",
    maxMileage: "",
  });

  const [isExpanded, setIsExpanded] = useState(true);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    // Convert to numbers for numeric fields and handle special values
    const processedFilters = {
      make:
        newFilters.make && newFilters.make !== "all"
          ? newFilters.make
          : undefined,
      model: newFilters.model || undefined,
      minPrice: newFilters.minPrice
        ? Number.parseInt(newFilters.minPrice, 10)
        : undefined,
      maxPrice: newFilters.maxPrice
        ? Number.parseInt(newFilters.maxPrice, 10)
        : undefined,
      minYear:
        newFilters.minYear && newFilters.minYear !== "any"
          ? Number.parseInt(newFilters.minYear, 10)
          : undefined,
      maxYear:
        newFilters.maxYear && newFilters.maxYear !== "any"
          ? Number.parseInt(newFilters.maxYear, 10)
          : undefined,
      minMileage: newFilters.minMileage
        ? Number.parseInt(newFilters.minMileage, 10)
        : undefined,
      maxMileage: newFilters.maxMileage
        ? Number.parseInt(newFilters.maxMileage, 10)
        : undefined,
    };

    onFiltersChange(processedFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      make: "all",
      model: "",
      minPrice: "",
      maxPrice: "",
      minYear: "any",
      maxYear: "any",
      minMileage: "",
      maxMileage: "",
    };
    setFilters(clearedFilters);
    onFiltersChange({});
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (key === "make" && value === "all") return false;
    if ((key === "minYear" || key === "maxYear") && value === "any")
      return false;
    return value !== "";
  });

  const filterContent = (
    <>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 font-semibold text-gray-900 text-lg">
            <SlidersHorizontal className="h-5 w-5 text-primary" />
            Filters
          </CardTitle>
          <div className="flex items-center gap-1">
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                size="sm"
                variant="ghost"
                className="gap-1"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            )}
            {onMobileClose && (
              <Button
                onClick={onMobileClose}
                size="icon-sm"
                variant="ghost"
                className="lg:hidden"
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Close filters</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Make & Model */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 text-sm">Make & Model</h3>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="make" className="text-gray-600 text-xs">
                Make
              </Label>
              <Select
                onValueChange={(value) => handleFilterChange("make", value)}
                value={filters.make}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Makes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {makes.map((make) => (
                    <SelectItem key={make} value={make}>
                      {make}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model" className="text-gray-600 text-xs">
                Model
              </Label>
              <Input
                id="model"
                onChange={(e) => handleFilterChange("model", e.target.value)}
                placeholder="Any model"
                value={filters.model}
                className="bg-white"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-gray-100 border-t" />

        {/* Price Range */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 text-sm">Price Range</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="minPrice" className="text-gray-600 text-xs">
                Min
              </Label>
              <Input
                id="minPrice"
                onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                placeholder="$0"
                type="number"
                value={filters.minPrice}
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxPrice" className="text-gray-600 text-xs">
                Max
              </Label>
              <Input
                id="maxPrice"
                onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                placeholder="Any"
                type="number"
                value={filters.maxPrice}
                className="bg-white"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-gray-100 border-t" />

        {/* Year Range */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 text-sm">Year</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="minYear" className="text-gray-600 text-xs">
                From
              </Label>
              <Select
                onValueChange={(value) => handleFilterChange("minYear", value)}
                value={filters.minYear}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxYear" className="text-gray-600 text-xs">
                To
              </Label>
              <Select
                onValueChange={(value) => handleFilterChange("maxYear", value)}
                value={filters.maxYear}
              >
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-gray-100 border-t" />

        {/* Mileage Range */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900 text-sm">Mileage</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="minMileage" className="text-gray-600 text-xs">
                Min
              </Label>
              <Input
                id="minMileage"
                onChange={(e) => handleFilterChange("minMileage", e.target.value)}
                placeholder="0"
                type="number"
                value={filters.minMileage}
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="maxMileage" className="text-gray-600 text-xs">
                Max
              </Label>
              <Input
                id="maxMileage"
                onChange={(e) => handleFilterChange("maxMileage", e.target.value)}
                placeholder="Any"
                type="number"
                value={filters.maxMileage}
                className="bg-white"
              />
            </div>
          </div>
        </div>

        {/* Mobile Apply Button */}
        {onMobileClose && (
          <div className="pt-4 lg:hidden">
            <Button
              onClick={onMobileClose}
              className="w-full text-white"
            >
              Apply Filters
            </Button>
          </div>
        )}
      </CardContent>
    </>
  );

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fade-in-0 fixed inset-0 z-40 animate-in bg-black/50 backdrop-blur-sm duration-200 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Desktop Card */}
      <Card
        className={`${className} hidden border-gray-200 shadow-sm lg:block`}
      >
        {filterContent}
      </Card>

      {/* Mobile Slide-in Panel */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          {filterContent}
        </div>
      </div>
    </>
  );
}

"use client";

import { Filter, X } from "lucide-react";
import { useState } from "react";
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

type VehicleFiltersProps = {
  onFiltersChange: (filters: {
    make?: string;
    model?: string;
    minPrice?: number;
    maxPrice?: number;
    minYear?: number;
    maxYear?: number;
  }) => void;
  className?: string;
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
}: VehicleFiltersProps) {
  const [filters, setFilters] = useState({
    make: "all",
    model: "",
    minPrice: "",
    maxPrice: "",
    minYear: "any",
    maxYear: "any",
  });

  const [isExpanded, setIsExpanded] = useState(false);

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

  return (
    <Card className={`border-gray-200/60 transition-all duration-300 hover:shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button onClick={clearFilters} size="sm" variant="ghost">
                <X className="mr-1 h-4 w-4" />
                Clear
              </Button>
            )}
            <Button
              onClick={() => setIsExpanded(!isExpanded)}
              size="sm"
              variant="ghost"
            >
              {isExpanded ? "Collapse" : "Expand"}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Basic filters - always visible */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="make">Make</Label>
            <Select
              onValueChange={(value) => handleFilterChange("make", value)}
              value={filters.make}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select make" />
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

          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Input
              id="model"
              onChange={(e) => handleFilterChange("model", e.target.value)}
              placeholder="Enter model"
              value={filters.model}
            />
          </div>
        </div>

        {/* Advanced filters - collapsible */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Min Price</Label>
                <Input
                  id="minPrice"
                  onChange={(e) =>
                    handleFilterChange("minPrice", e.target.value)
                  }
                  placeholder="0"
                  type="number"
                  value={filters.minPrice}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPrice">Max Price</Label>
                <Input
                  id="maxPrice"
                  onChange={(e) =>
                    handleFilterChange("maxPrice", e.target.value)
                  }
                  placeholder="100000"
                  type="number"
                  value={filters.maxPrice}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minYear">Min Year</Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("minYear", value)
                  }
                  value={filters.minYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Year</SelectItem>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxYear">Max Year</Label>
                <Select
                  onValueChange={(value) =>
                    handleFilterChange("maxYear", value)
                  }
                  value={filters.maxYear}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Year</SelectItem>
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
        )}
      </CardContent>
    </Card>
  );
}

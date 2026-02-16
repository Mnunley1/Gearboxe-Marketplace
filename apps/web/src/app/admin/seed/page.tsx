"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@gearboxe-market/ui/card";
import { useMutation } from "convex/react";
import {
  Calendar,
  Car,
  Database,
  Loader2,
  MessageSquare,
  RefreshCw,
  Users,
} from "lucide-react";
import { useState } from "react";

export default function SeedPage() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<any>(null);
  const seedDatabase = useMutation(api.seed.seedDatabase);
  const migrateVehiclePhotos = useMutation(api.vehicles.migrateVehiclePhotos);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const result = await seedDatabase();
      setSeedResult(result);
    } catch (error) {
      console.error("Error seeding database:", error);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleMigrate = async () => {
    setIsMigrating(true);
    try {
      const result = await migrateVehiclePhotos();
      setMigrationResult(result);
    } catch (error) {
      console.error("Error migrating vehicle photos:", error);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4 flex items-center space-x-4">
          <Button asChild size="sm" variant="ghost">
            <a href="/admin">← Back to Admin</a>
          </Button>
        </div>
        <h1 className="mb-2 font-bold text-3xl text-gray-900">
          Database Seeding
        </h1>
        <p className="text-gray-600">
          Populate the database with fake data for testing and development.
        </p>
      </div>

      {/* Migration Button */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <RefreshCw className="mr-2 h-5 w-5" />
            Migrate Vehicle Photos
          </CardTitle>
          <CardDescription>
            Fix vehicles that have URL strings in their photos array. This will
            remove invalid URLs and keep only valid storage IDs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            disabled={isMigrating}
            onClick={handleMigrate}
          >
            {isMigrating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Migration
              </>
            )}
          </Button>
          {migrationResult && (
            <div className="mt-4 rounded-lg bg-green-50 p-4">
              <p className="font-semibold text-green-800">
                Migration Complete!
              </p>
              <p className="text-green-700 text-sm">
                Fixed {migrationResult.fixed} out of {migrationResult.total}{" "}
                vehicles.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seed Button */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Seed Database
          </CardTitle>
          <CardDescription>
            This will add fake users, vehicles, events, and other test data to
            your database.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            className="text-white"
            disabled={isSeeding}
            onClick={handleSeed}
          >
            {isSeeding ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Seeding Database...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Seed Database
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {seedResult && (
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Seeding Complete!</CardTitle>
            <CardDescription>
              Successfully added fake data to the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-lg bg-primary-50 p-4 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-primary" />
                <div className="font-bold text-2xl text-primary">
                  {seedResult.users}
                </div>
                <div className="text-gray-600 text-sm">Users</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <Car className="mx-auto mb-2 h-8 w-8 text-green-600" />
                <div className="font-bold text-2xl text-green-600">
                  {seedResult.vehicles}
                </div>
                <div className="text-gray-600 text-sm">Vehicles</div>
              </div>
              <div className="rounded-lg bg-purple-50 p-4 text-center">
                <Calendar className="mx-auto mb-2 h-8 w-8 text-purple-600" />
                <div className="font-bold text-2xl text-purple-600">
                  {seedResult.events}
                </div>
                <div className="text-gray-600 text-sm">Events</div>
              </div>
              <div className="rounded-lg bg-orange-50 p-4 text-center">
                <MessageSquare className="mx-auto mb-2 h-8 w-8 text-orange-600" />
                <div className="font-bold text-2xl text-orange-600">
                  {seedResult.messages}
                </div>
                <div className="text-gray-600 text-sm">Messages</div>
              </div>
            </div>

            <div className="mt-6 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-2 font-semibold">What was added:</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>
                  • {seedResult.users} fake users (sellers, buyers, admin)
                </li>
                <li>• {seedResult.vehicles} vehicles with realistic data</li>
                <li>• {seedResult.events} upcoming events</li>
                <li>• {seedResult.registrations} event registrations</li>
                <li>• {seedResult.messages} sample messages</li>
                <li>• {seedResult.favorites} favorited vehicles</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Data Info */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Test Data Overview</CardTitle>
          <CardDescription>
            Here's what the seed script will add to your database:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Users</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• 3 Sellers: John Smith, Sarah Johnson, Mike Davis</li>
                <li>• 2 Buyers: Emily Brown, David Wilson</li>
                <li>• 1 Admin: Admin User</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Vehicles</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• BMW M3 Competition Package (2019) - $65,000</li>
                <li>• Tesla Model S Performance (2020) - $85,000</li>
                <li>• Porsche 911 Carrera S (2018) - $95,000</li>
                <li>• Ford Mustang GT Premium (2021) - $45,000</li>
                <li>• Audi RS6 Avant (2017) - $75,000</li>
                <li>• Mercedes-AMG C63 S (2019) - $68,000</li>
                <li>• Lamborghini Huracán EVO (2020) - $220,000</li>
                <li>• McLaren 570S (2016) - $180,000</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-gray-900">Events</h3>
              <ul className="space-y-1 text-gray-600 text-sm">
                <li>• San Francisco Classic Car Show</li>
                <li>• LA Supercar Sunday</li>
                <li>• Pacific Northwest Car Meet</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

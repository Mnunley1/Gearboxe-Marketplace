import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-gray-200 border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4 flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="font-bold text-sm text-white">G</span>
              </div>
              <span className="font-bold text-gray-900 text-xl">
                Gearboxe Market
              </span>
            </div>
            <p className="max-w-md text-gray-600 text-sm">
              Connect with local car sellers and buyers at monthly popup events.
              Find your next vehicle or sell yours at our community-driven
              markets.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 text-sm">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-gray-600 text-sm transition-colors hover:text-primary"
                  href="/vehicles"
                >
                  Browse Vehicles
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 text-sm transition-colors hover:text-primary"
                  href="/events"
                >
                  Upcoming Events
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 text-sm transition-colors hover:text-primary"
                  href="/myAccount/my-listings"
                >
                  My Listings
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 font-semibold text-gray-900 text-sm">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  className="text-gray-600 text-sm transition-colors hover:text-primary"
                  href="/contact"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  className="text-gray-600 text-sm transition-colors hover:text-primary"
                  href="/terms"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-gray-200 border-t pt-8">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <p className="text-gray-500 text-sm">
              © 2024 Gearboxe Market. All rights reserved.
            </p>
            <div className="mt-4 flex space-x-6 md:mt-0">
              <Link
                className="text-gray-500 text-sm transition-colors hover:text-primary"
                href="/privacy"
              >
                Privacy Policy
              </Link>
              <Link
                className="text-gray-500 text-sm transition-colors hover:text-primary"
                href="/cookies"
              >
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

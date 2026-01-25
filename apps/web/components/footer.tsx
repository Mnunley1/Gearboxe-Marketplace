import { Car, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";

const footerLinks = {
  browse: [
    { href: "/vehicles", label: "All Vehicles" },
    { href: "/events", label: "Upcoming Events" },
    { href: "/vehicles?make=Toyota", label: "Toyota" },
    { href: "/vehicles?make=Honda", label: "Honda" },
    { href: "/vehicles?make=Ford", label: "Ford" },
  ],
  sell: [
    { href: "/myAccount/new-listing", label: "List Your Car" },
    { href: "/myAccount/my-listings", label: "My Listings" },
    { href: "/events", label: "Register for Event" },
  ],
  support: [
    { href: "/contact", label: "Contact Us" },
    { href: "/faq", label: "FAQ" },
    { href: "/terms", label: "Terms of Service" },
    { href: "/privacy", label: "Privacy Policy" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-primary/25">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-xl tracking-tight">
                  Gearboxe
                </span>
                <span className="-mt-1 text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                  Market
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-sm text-gray-600 leading-relaxed">
              Connect with local car sellers and buyers at exclusive popup events.
              Find your next vehicle or sell yours with confidence.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                href="mailto:hello@gearboxe.com"
                className="flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-primary"
              >
                <Mail className="h-4 w-4" />
                hello@gearboxe.com
              </a>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                Los Angeles, CA
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {/* Browse */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Browse
              </h3>
              <ul className="space-y-3">
                {footerLinks.browse.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sell */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Sell
              </h3>
              <ul className="space-y-3">
                {footerLinks.sell.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-gray-500">
              {currentYear} Gearboxe Market. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-gray-500 transition-colors hover:text-gray-700"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

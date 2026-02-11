import { Car, Mail, MapPin } from "lucide-react";
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
    <footer className="border-gray-200 border-t bg-white">
      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4">
            <Link className="group inline-flex items-center gap-2.5" href="/">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20 transition-all duration-200 group-hover:shadow-lg group-hover:shadow-primary/25">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold font-heading text-gray-900 text-xl uppercase tracking-tight">
                  Gearboxe
                </span>
                <span className="-mt-1 font-heading font-medium text-[10px] text-gray-500 uppercase tracking-widest">
                  Market
                </span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-gray-600 text-sm leading-relaxed">
              Connect with local car sellers and buyers at exclusive popup
              events. Find your next vehicle or sell yours with confidence.
            </p>

            {/* Contact Info */}
            <div className="mt-6 space-y-3">
              <a
                className="flex items-center gap-2 text-gray-600 text-sm transition-colors hover:text-primary"
                href="mailto:hello@gearboxe.com"
              >
                <Mail className="h-4 w-4" />
                hello@gearboxe.com
              </a>
              <div className="flex items-center gap-2 text-gray-600 text-sm">
                <MapPin className="h-4 w-4" />
                Los Angeles, CA
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {/* Browse */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                Browse
              </h3>
              <ul className="space-y-3">
                {footerLinks.browse.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-gray-600 text-sm transition-colors hover:text-primary"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sell */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                Sell
              </h3>
              <ul className="space-y-3">
                {footerLinks.sell.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-gray-600 text-sm transition-colors hover:text-primary"
                      href={link.href}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-4 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                Support
              </h3>
              <ul className="space-y-3">
                {footerLinks.support.map((link) => (
                  <li key={link.href}>
                    <Link
                      className="text-gray-600 text-sm transition-colors hover:text-primary"
                      href={link.href}
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
      <div className="border-gray-100 border-t bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-gray-500 text-sm">
              {currentYear} Gearboxe Market. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <Link
                className="text-gray-500 text-sm transition-colors hover:text-gray-700"
                href="/privacy"
              >
                Privacy
              </Link>
              <Link
                className="text-gray-500 text-sm transition-colors hover:text-gray-700"
                href="/terms"
              >
                Terms
              </Link>
              <Link
                className="text-gray-500 text-sm transition-colors hover:text-gray-700"
                href="/cookies"
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

import Link from "next/link";
import { Car, Home, SearchX } from "lucide-react";
import { Button } from "@gearboxe-market/ui/button";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      <div className="fade-in relative z-10 flex max-w-lg flex-col items-center text-center">
        {/* Brand logo */}
        <div className="mb-10 flex scale-in items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
            <Car className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg tracking-tight">
            Gearboxe Market
          </span>
        </div>

        {/* Icon */}
        <div className="slide-in-bottom mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
          <SearchX className="h-10 w-10 text-primary" />
        </div>

        {/* 404 display */}
        <h1 className="font-extrabold text-[8rem] text-gradient-primary leading-none sm:text-[10rem]">
          404
        </h1>

        {/* Message */}
        <p className="slide-in-bottom mt-4 font-semibold text-gray-900 text-xl">
          Page not found
        </p>
        <p className="slide-in-bottom mt-2 max-w-sm text-base text-gray-500 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Let&apos;s get you back on track.
        </p>

        {/* CTA */}
        <div className="slide-in-bottom mt-10 flex gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-xl shadow-md shadow-primary/20"
          >
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/vehicles">Browse Vehicles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

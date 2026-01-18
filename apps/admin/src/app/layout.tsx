import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ErrorBoundary } from "../../components/ui/error-boundary";
import { ConvexClientProvider } from "../../lib/convex-provider";
import { AdminLayout } from "./admin-layout";
import "./global.css";

export const metadata: Metadata = {
  title: "Gearboxe Market - Admin",
  description: "Admin panel for managing car marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
      <html lang="en">
        <body className="antialiased">
          <ErrorBoundary>
            <ConvexClientProvider>
              <AdminLayout>{children}</AdminLayout>
            </ConvexClientProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}

import { ToastContainer } from "@car-market/ui/toast-container";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { ConvexClientProvider } from "@/lib/convex-provider";
import "./global.css";

export const metadata: Metadata = {
  title: "Gearboxe Market",
  description:
    "Connect with local car sellers and buyers at monthly popup events",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/myAccount/my-listings"
      signUpFallbackRedirectUrl="/myAccount/my-listings"
    >
      <html lang="en">
        <body className="antialiased">
          <ConvexClientProvider>
            {children}
            <ToastContainer />
          </ConvexClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

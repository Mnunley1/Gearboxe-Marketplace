import { ClerkProvider } from "@clerk/nextjs";
import { ToastContainer } from "@gearboxe-market/ui/toast-container";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { AnnouncementBanner } from "@/components/announcement-banner";
import { ErrorBoundary } from "@/components/error-boundary";
import { ConvexClientProvider } from "@/lib/convex-provider";
import "./global.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

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
      <html className={`${inter.variable} ${poppins.variable}`} lang="en">
        <body className="font-sans antialiased">
          <ErrorBoundary>
            <ConvexClientProvider>
              <AnnouncementBanner />
              {children}
              <ToastContainer />
            </ConvexClientProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}

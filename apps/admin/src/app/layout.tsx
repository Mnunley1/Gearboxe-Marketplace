import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { Toaster } from "sonner";
import { ErrorBoundary } from "../../components/ui/error-boundary";
import { ConvexClientProvider } from "../../lib/convex-provider";
import AdminLayout from "./admin-layout";
import "./global.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Gearboxe Market - Admin",
  description: "Admin panel for Gearboxe Market",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider signInFallbackRedirectUrl="/" signUpFallbackRedirectUrl="/">
      <html className={`${inter.variable} ${poppins.variable}`} lang="en">
        <body className="font-sans antialiased">
          <ErrorBoundary>
            <ConvexClientProvider>
              <AdminLayout>{children}</AdminLayout>
              <Toaster richColors />
            </ConvexClientProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}

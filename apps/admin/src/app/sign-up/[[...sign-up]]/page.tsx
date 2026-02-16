"use client";

import { useAuth, useSignUp } from "@clerk/nextjs";
import { Button } from "@gearboxe-market/ui/button";
import { Card } from "@gearboxe-market/ui/card";
import { Input } from "@gearboxe-market/ui/input";
import { Label } from "@gearboxe-market/ui/label";
import { Car, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminSignUpPage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (authLoaded && isSignedIn) {
      const timer = setTimeout(() => {
        try {
          router.replace("/");
        } catch {
          window.location.href = "/";
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authLoaded, isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    if (isSignedIn) {
      router.push("/");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setPendingVerification(true);
    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.message || "An error occurred during sign up";

      if (
        errorMessage.includes("session already exists") ||
        errorMessage.includes("already signed in")
      ) {
        try {
          router.push("/");
        } catch {
          window.location.href = "/";
        }
        return;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setIsLoading(true);
    setError("");

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === "complete") {
        await setActive({ session: completeSignUp.createdSessionId });
        try {
          router.push("/");
        } catch {
          window.location.href = "/";
        }
      } else {
        setError("Verification failed. Please check your code.");
      }
    } catch (err: any) {
      setError(
        err.errors?.[0]?.message || "An error occurred during verification"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!(isLoaded && authLoaded)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto h-32 w-32 animate-spin rounded-full border-primary border-b-2" />
          <p className="mt-4 text-gray-600">Redirecting to admin panel...</p>
        </div>
      </div>
    );
  }

  if (pendingVerification) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
              <Car className="h-6 w-6 text-white" />
            </div>
            <h2 className="mb-2 font-bold text-3xl text-gray-900">
              Verify your email
            </h2>
            <p className="text-gray-600">
              We've sent a verification code to your email address
            </p>
          </div>

          <Card className="border-gray-200 bg-white p-8 shadow-lg">
            <form className="space-y-6" onSubmit={onPressVerify}>
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label
                  className="font-medium text-gray-700 text-sm"
                  htmlFor="code"
                >
                  Verification code
                </Label>
                <Input
                  className="h-12 border-gray-300 bg-white text-center text-gray-900 text-lg tracking-widest placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                  id="code"
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Enter verification code"
                  required
                  value={code}
                />
              </div>

              <Button
                className="w-full py-3 font-medium text-base"
                disabled={isLoading}
                type="submit"
              >
                {isLoading ? "Verifying..." : "Verify email"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md shadow-primary/20">
            <Car className="h-6 w-6 text-white" />
          </div>
          <h2 className="mb-2 font-bold text-3xl text-gray-900">
            Join Gearboxe Market
          </h2>
          <p className="text-gray-600">
            Create your account to access the admin panel
          </p>
        </div>

        <Card className="border-gray-200 bg-white p-8 shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  className="font-medium text-gray-700 text-sm"
                  htmlFor="firstName"
                >
                  First name
                </Label>
                <div className="relative">
                  <User className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                  <Input
                    className="h-12 border-gray-300 bg-white pl-10 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                    id="firstName"
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    required
                    value={firstName}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  className="font-medium text-gray-700 text-sm"
                  htmlFor="lastName"
                >
                  Last name
                </Label>
                <div className="relative">
                  <User className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                  <Input
                    className="h-12 border-gray-300 bg-white pl-10 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                    id="lastName"
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    required
                    value={lastName}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                className="font-medium text-gray-700 text-sm"
                htmlFor="email"
              >
                Email address
              </Label>
              <div className="relative">
                <Mail className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <Input
                  className="h-12 border-gray-300 bg-white pl-10 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                  id="email"
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="Enter your email"
                  required
                  type="email"
                  value={emailAddress}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                className="font-medium text-gray-700 text-sm"
                htmlFor="password"
              >
                Password
              </Label>
              <div className="relative">
                <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <Input
                  className="h-12 border-gray-300 bg-white pr-10 pl-10 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                />
                <button
                  className="-translate-y-1/2 absolute top-1/2 right-3 transform text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                className="font-medium text-gray-700 text-sm"
                htmlFor="confirmPassword"
              >
                Confirm password
              </Label>
              <div className="relative">
                <Lock className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-gray-400" />
                <Input
                  className="h-12 border-gray-300 bg-white pr-10 pl-10 text-base text-gray-900 placeholder:text-gray-500 focus:border-primary focus:ring-primary"
                  id="confirmPassword"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                />
                <button
                  className="-translate-y-1/2 absolute top-1/2 right-3 transform text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  type="button"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              className="w-full py-3 font-medium text-base"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-gray-200 border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                className="w-full"
                onClick={() => {
                  signUp?.authenticateWithRedirect({
                    strategy: "oauth_google",
                    redirectUrl: "/",
                    redirectUrlComplete: "/",
                  });
                }}
                variant="outline"
              >
                <svg
                  aria-hidden="true"
                  className="mr-2 h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="currentColor"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="currentColor"
                  />
                </svg>
                Google
              </Button>
              <Button
                className="w-full"
                onClick={() => {
                  signUp?.authenticateWithRedirect({
                    strategy: "oauth_github",
                    redirectUrl: "/",
                    redirectUrlComplete: "/",
                  });
                }}
                variant="outline"
              >
                <svg
                  aria-hidden="true"
                  className="mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </Button>
            </div>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-gray-500 text-sm">
            Already have an account?{" "}
            <Link
              className="font-medium text-primary hover:text-primary/80"
              href="/sign-in"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

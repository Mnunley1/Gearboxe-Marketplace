"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@gearboxe-market/ui/card";
import { useAction, useQuery } from "convex/react";
import { CheckCircle, ExternalLink, Link2, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useAdminAuth } from "../../../../lib/admin-auth-context";

function StatusBadge({
	isConnected,
	isPending,
}: { isConnected: boolean; isPending: boolean | null }) {
	if (isConnected) {
		return (
			<>
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
					<CheckCircle className="h-5 w-5 text-green-600" />
				</div>
				<div>
					<p className="font-semibold text-gray-900">Connected</p>
					<p className="text-gray-500 text-sm">
						Your Stripe account is active and ready to receive payments
					</p>
				</div>
			</>
		);
	}
	if (isPending) {
		return (
			<>
				<div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
					<Link2 className="h-5 w-5 text-amber-600" />
				</div>
				<div>
					<p className="font-semibold text-gray-900">Onboarding Incomplete</p>
					<p className="text-gray-500 text-sm">
						Complete your Stripe onboarding to start receiving payments
					</p>
				</div>
			</>
		);
	}
	return (
		<>
			<div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
				<XCircle className="h-5 w-5 text-gray-400" />
			</div>
			<div>
				<p className="font-semibold text-gray-900">Not Connected</p>
				<p className="text-gray-500 text-sm">
					Connect a Stripe account to receive vendor registration payments
				</p>
			</div>
		</>
	);
}

export default function StripeSettingsPage() {
	useAdminAuth();
	const settings = useQuery(api.stripeConnect.getOrgStripeSettings);
	const createAccount = useAction(api.stripeConnect.createConnectAccount);
	const createOnboardingLink = useAction(
		api.stripeConnect.createConnectOnboardingLink,
	);
	const searchParams = useSearchParams();
	const [isLoading, setIsLoading] = useState(false);

	const showSuccess = searchParams.get("success") === "true";

	const handleConnectStripe = async () => {
		setIsLoading(true);
		try {
			const result = await createAccount();
			window.location.href = result.onboardingUrl;
		} catch (error: any) {
			toast.error("Failed to create Stripe account", {
				description: error?.message || "Please try again.",
			});
			setIsLoading(false);
		}
	};

	const handleReturnToOnboarding = async () => {
		setIsLoading(true);
		try {
			const result = await createOnboardingLink();
			window.location.href = result.onboardingUrl;
		} catch (error: any) {
			toast.error("Failed to generate onboarding link", {
				description: error?.message || "Please try again.",
			});
			setIsLoading(false);
		}
	};

	if (settings === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="mt-4 text-gray-600 text-sm">Loading...</p>
				</div>
			</div>
		);
	}

	const isConnected = settings?.onboardingComplete === true;
	const isPending = settings && !settings.onboardingComplete;

	return (
		<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="mb-1 font-bold font-heading text-3xl text-gray-900">
					Stripe Connect
				</h1>
				<p className="text-gray-500">
					Connect your Stripe account to receive vendor registration payments
				</p>
				<div className="mt-3 h-1 w-12 rounded-full bg-primary" />
			</div>

			{showSuccess && !isConnected && (
				<Card className="mb-6 border-amber-200 bg-amber-50">
					<CardContent className="p-4">
						<p className="text-amber-800 text-sm">
							You've returned from Stripe. Your account status will update
							automatically once Stripe verifies your information.
						</p>
					</CardContent>
				</Card>
			)}

			<Card className="border-gray-200/60">
				<CardHeader>
					<CardTitle className="font-heading">Account Status</CardTitle>
				</CardHeader>
				<CardContent className="space-y-6">
					{/* Status Badge */}
					<div className="flex items-center gap-3">
						<StatusBadge isConnected={isConnected} isPending={isPending} />
					</div>

					{/* Account Details */}
					{settings && (
						<div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
							<div className="space-y-2 text-sm">
								<div className="flex justify-between">
									<span className="text-gray-500">Account ID</span>
									<span className="font-mono text-gray-900">
										{settings.stripeAccountId}
									</span>
								</div>
								<div className="flex justify-between">
									<span className="text-gray-500">Platform Fee</span>
									<span className="text-gray-900">
										{settings.platformFeeType === "percentage"
											? `${settings.platformFeeValue}%`
											: `$${(settings.platformFeeValue / 100).toFixed(2)}`}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Action Buttons */}
					<div className="flex gap-3">
						{!settings && (
							<Button disabled={isLoading} onClick={handleConnectStripe}>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<ExternalLink className="h-4 w-4" />
								)}
								Connect Stripe Account
							</Button>
						)}

						{isPending && (
							<Button disabled={isLoading} onClick={handleReturnToOnboarding}>
								{isLoading ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<ExternalLink className="h-4 w-4" />
								)}
								Complete Onboarding
							</Button>
						)}

						{isConnected && (
							<Button asChild variant="outline">
								<a
									href="https://dashboard.stripe.com"
									rel="noopener noreferrer"
									target="_blank"
								>
									<ExternalLink className="h-4 w-4" />
									Open Stripe Dashboard
								</a>
							</Button>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

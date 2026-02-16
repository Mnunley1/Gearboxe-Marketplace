"use client";

import { api } from "@gearboxe-market/convex/_generated/api";
import { Button } from "@gearboxe-market/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@gearboxe-market/ui/card";
import { Input } from "@gearboxe-market/ui/input";
import { Label } from "@gearboxe-market/ui/label";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle, DollarSign, Percent, Save, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function FeesSettingsPage() {
	const allSettings = useQuery(api.stripeConnect.getAllOrgStripeSettings);
	const isSuperAdmin = useQuery(api.users.isSuperAdmin);

	if (isSuperAdmin === false) {
		return (
			<div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
				<Card>
					<CardContent className="py-16 text-center">
						<XCircle className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 font-semibold text-gray-900 text-xl">
							Access Denied
						</h3>
						<p className="text-gray-600">
							Only super administrators can manage platform fees.
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (allSettings === undefined || isSuperAdmin === undefined) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-white">
				<div className="text-center">
					<div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
					<p className="mt-4 text-gray-600 text-sm">Loading...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
			<div className="mb-8">
				<h1 className="mb-1 font-bold font-heading text-3xl text-gray-900">
					Platform Fees
				</h1>
				<p className="text-gray-500">
					Configure the platform fee charged on vendor registration payments for
					each organization
				</p>
				<div className="mt-3 h-1 w-12 rounded-full bg-primary" />
			</div>

			{allSettings.length === 0 ? (
				<Card>
					<CardContent className="py-16 text-center">
						<DollarSign className="mx-auto mb-4 h-16 w-16 text-gray-400" />
						<h3 className="mb-2 font-semibold text-gray-900 text-xl">
							No Connected Organizations
						</h3>
						<p className="text-gray-600">
							Organizations will appear here once they connect their Stripe
							accounts.
						</p>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-6">
					{allSettings.map((settings: any) => (
						<OrgFeeCard key={settings._id} settings={settings} />
					))}
				</div>
			)}
		</div>
	);
}

function OrgFeeCard({
	settings,
}: {
	settings: {
		_id: any;
		clerkOrgId: string;
		stripeAccountId: string;
		onboardingComplete: boolean;
		platformFeeType: "percentage" | "fixed";
		platformFeeValue: number;
	};
}) {
	const [feeType, setFeeType] = useState(settings.platformFeeType);
	const [feeValue, setFeeValue] = useState(String(settings.platformFeeValue));
	const [isSaving, setIsSaving] = useState(false);
	const updateFee = useMutation(api.stripeConnect.updatePlatformFee);

	const hasChanges =
		feeType !== settings.platformFeeType ||
		feeValue !== String(settings.platformFeeValue);

	const handleSave = async () => {
		const numValue = Number.parseFloat(feeValue);
		if (Number.isNaN(numValue) || numValue < 0) {
			toast.error("Invalid fee value");
			return;
		}
		if (feeType === "percentage" && numValue > 100) {
			toast.error("Percentage must be between 0 and 100");
			return;
		}

		setIsSaving(true);
		try {
			await updateFee({
				orgStripeSettingsId: settings._id,
				platformFeeType: feeType,
				platformFeeValue: numValue,
			});
			toast.success("Platform fee updated");
		} catch (error: any) {
			toast.error("Failed to update fee", {
				description: error?.message || "Please try again.",
			});
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<Card className="border-gray-200/60">
			<CardHeader>
				<div className="flex items-center justify-between">
					<CardTitle className="font-heading text-lg">
						{settings.clerkOrgId}
					</CardTitle>
					<div className="flex items-center gap-2">
						{settings.onboardingComplete ? (
							<span className="flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-green-700 text-xs">
								<CheckCircle className="h-3 w-3" />
								Active
							</span>
						) : (
							<span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-700 text-xs">
								<XCircle className="h-3 w-3" />
								Pending
							</span>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div className="text-gray-500 text-sm">
						Stripe Account: <span className="font-mono">{settings.stripeAccountId}</span>
					</div>

					<div className="flex items-end gap-4">
						<div className="space-y-2">
							<Label>Fee Type</Label>
							<div className="flex gap-2">
								<Button
									onClick={() => setFeeType("percentage")}
									size="sm"
									variant={feeType === "percentage" ? "default" : "outline"}
								>
									<Percent className="h-3 w-3" />
									Percentage
								</Button>
								<Button
									onClick={() => setFeeType("fixed")}
									size="sm"
									variant={feeType === "fixed" ? "default" : "outline"}
								>
									<DollarSign className="h-3 w-3" />
									Fixed
								</Button>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor={`fee-${settings._id}`}>
								{feeType === "percentage" ? "Percentage (%)" : "Amount (cents)"}
							</Label>
							<Input
								className="w-32"
								id={`fee-${settings._id}`}
								min="0"
								max={feeType === "percentage" ? "100" : undefined}
								onChange={(e) => setFeeValue(e.target.value)}
								step={feeType === "percentage" ? "0.1" : "1"}
								type="number"
								value={feeValue}
							/>
						</div>

						<Button
							disabled={!hasChanges || isSaving}
							onClick={handleSave}
							size="sm"
						>
							<Save className="h-3 w-3" />
							{isSaving ? "Saving..." : "Save"}
						</Button>
					</div>

					{feeType === "percentage" && (
						<p className="text-gray-400 text-xs">
							e.g., 10 = 10% of each registration fee goes to the platform
						</p>
					)}
					{feeType === "fixed" && (
						<p className="text-gray-400 text-xs">
							e.g., 200 = $2.00 per registration goes to the platform
						</p>
					)}
				</div>
			</CardContent>
		</Card>
	);
}

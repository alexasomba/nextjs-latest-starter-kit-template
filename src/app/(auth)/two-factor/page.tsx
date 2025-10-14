"use client";

import Image from "next/image";
import { Suspense } from "react";
import { TwoFactorForm } from "@/components/ui/two-factor-form";

function TwoFactorContent() {
	return (
		<div className="w-full h-screen lg:grid lg:grid-cols-2">
			<div className="flex items-center justify-center py-12">
				<div className="mx-auto grid w-[350px] gap-6">
					<TwoFactorForm />
				</div>
			</div>
			<div className="hidden bg-muted lg:block relative">
				<Image
					src="/placeholder.svg"
					alt="Two-factor authentication illustration"
					fill
					className="object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</div>
	);
}

export default function TwoFactorPage() {
	return (
		<Suspense
			fallback={
				<div className="w-full h-screen lg:grid lg:grid-cols-2">
					<div className="flex items-center justify-center py-12">
						<div className="mx-auto grid w-[350px] gap-6">
							<div className="bg-muted animate-pulse rounded-lg h-96"></div>
						</div>
					</div>
					<div className="hidden bg-muted lg:block">
						<div className="w-full h-full bg-muted animate-pulse" />
					</div>
				</div>
			}
		>
			<TwoFactorContent />
		</Suspense>
	);
}

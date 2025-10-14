"use client";

import {
	AlertCircle,
	CheckCircle,
	Eye,
	EyeOff,
	Github,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Turnstile from "react-turnstile";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import createAuthClient from "@/lib/auth/authClient";
import { cn } from "@/lib/utils";

interface FormData {
	name: string;
	email: string;
	password: string;
	confirmPassword: string;
}

interface FormErrors {
	name?: string;
	email?: string;
	password?: string;
	confirmPassword?: string;
	general?: string;
}

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [emailSent, setEmailSent] = useState(false);
	const [captchaToken, setCaptchaToken] = useState<string>("");
	const [formData, setFormData] = useState<FormData>({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const searchParams = useSearchParams();

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Name validation
		if (!formData.name.trim()) {
			newErrors.name = "Name is required";
		} else if (formData.name.trim().length < 2) {
			newErrors.name = "Name must be at least 2 characters";
		}

		// Email validation
		if (!formData.email) {
			newErrors.email = "Email is required";
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = "Please enter a valid email address";
		}

		// Password validation
		if (!formData.password) {
			newErrors.password = "Password is required";
		} else if (formData.password.length < 8) {
			newErrors.password = "Password must be at least 8 characters";
		} else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
			newErrors.password =
				"Password must contain at least one uppercase letter, one lowercase letter, and one number";
		}

		// Confirm password validation
		if (!formData.confirmPassword) {
			newErrors.confirmPassword = "Please confirm your password";
		} else if (formData.password !== formData.confirmPassword) {
			newErrors.confirmPassword = "Passwords do not match";
		}

		// Captcha validation
		if (!captchaToken) {
			newErrors.general = "Please complete the security verification";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		setLoading(true);
		setErrors({});

		try {
			const { error } = await createAuthClient.signUp.email({
				name: formData.name,
				email: formData.email,
				password: formData.password,
				callbackURL: searchParams?.get("callbackURL") || "/sign-in",
				fetchOptions: {
					headers: {
						"x-captcha-response": captchaToken,
					},
				},
			});

			if (error) {
				setErrors({ general: error.message || "Sign up failed" });
				toast.error("Sign up failed", {
					description:
						error.message || "Please check your information and try again.",
				});
			} else {
				setEmailSent(true);
				toast.success("Account created!", {
					description: "Please check your email to verify your account.",
				});
			}
		} catch {
			setErrors({ general: "An unexpected error occurred" });
			toast.error("Sign up failed", {
				description: "An unexpected error occurred. Please try again.",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignUp = async () => {
		try {
			await createAuthClient.signIn.social({
				provider: "google",
				callbackURL: searchParams?.get("callbackURL") || "/dashboard",
			});
		} catch {
			toast.error("Google sign up failed", {
				description: "Please try again.",
			});
		}
	};

	const handleGithubSignUp = async () => {
		try {
			await createAuthClient.signIn.social({
				provider: "github",
				callbackURL: searchParams?.get("callbackURL") || "/dashboard",
			});
		} catch {
			toast.error("GitHub sign up failed", {
				description: "Please try again.",
			});
		}
	};

	const handleLinkedInSignUp = async () => {
		try {
			await createAuthClient.signIn.social({
				provider: "linkedin",
				callbackURL: searchParams?.get("callbackURL") || "/dashboard",
			});
		} catch {
			toast.error("LinkedIn sign up failed", {
				description: "Please try again.",
			});
		}
	};

	const handleFacebookSignUp = async () => {
		try {
			await createAuthClient.signIn.social({
				provider: "facebook",
				callbackURL: searchParams?.get("callbackURL") || "/dashboard",
			});
		} catch {
			toast.error("Facebook sign up failed", {
				description: "Please try again.",
			});
		}
	};

	if (emailSent) {
		return (
			<div className={cn("flex flex-col gap-6", className)} {...props}>
				<div className="flex flex-col items-center gap-2 text-center">
					<CheckCircle className="h-12 w-12 text-green-500" />
					<h1 className="text-2xl font-bold">Check your email</h1>
					<p className="text-muted-foreground text-sm text-balance">
						We&apos;ve sent a verification link to{" "}
						<strong>{formData.email}</strong>
					</p>
				</div>

				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						Please check your email and click the verification link to complete
						your account setup.
					</AlertDescription>
				</Alert>

				<div className="text-center text-sm">
					Already have an account?{" "}
					<Link href="/sign-in" className="underline underline-offset-4">
						Sign in
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<div className="flex flex-col items-center gap-2 text-center">
				<h1 className="text-2xl font-bold">Create an account</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Get started with your ClearAccess account
				</p>
			</div>

			{errors.general && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{errors.general}</AlertDescription>
				</Alert>
			)}

			<form onSubmit={handleSubmit} className="grid gap-6">
				<div className="grid gap-3">
					<Label htmlFor="name">Full Name</Label>
					<Input
						id="name"
						type="text"
						placeholder="John Doe"
						value={formData.name}
						onChange={(e) => setFormData({ ...formData, name: e.target.value })}
						className={errors.name ? "border-destructive" : ""}
						required
					/>
					{errors.name && (
						<p className="text-sm text-destructive">{errors.name}</p>
					)}
				</div>

				<div className="grid gap-3">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						placeholder="name@example.com"
						value={formData.email}
						onChange={(e) =>
							setFormData({ ...formData, email: e.target.value })
						}
						className={errors.email ? "border-destructive" : ""}
						required
					/>
					{errors.email && (
						<p className="text-sm text-destructive">{errors.email}</p>
					)}
				</div>

				<div className="grid gap-3">
					<Label htmlFor="password">Password</Label>
					<div className="relative">
						<Input
							id="password"
							type={showPassword ? "text" : "password"}
							value={formData.password}
							onChange={(e) =>
								setFormData({ ...formData, password: e.target.value })
							}
							className={errors.password ? "border-destructive pr-10" : "pr-10"}
							required
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
							onClick={() => setShowPassword(!showPassword)}
						>
							{showPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
							<span className="sr-only">
								{showPassword ? "Hide password" : "Show password"}
							</span>
						</Button>
					</div>
					{errors.password && (
						<p className="text-sm text-destructive">{errors.password}</p>
					)}
				</div>

				<div className="grid gap-3">
					<Label htmlFor="confirmPassword">Confirm Password</Label>
					<div className="relative">
						<Input
							id="confirmPassword"
							type={showConfirmPassword ? "text" : "password"}
							value={formData.confirmPassword}
							onChange={(e) =>
								setFormData({ ...formData, confirmPassword: e.target.value })
							}
							className={
								errors.confirmPassword ? "border-destructive pr-10" : "pr-10"
							}
							required
						/>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
							onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						>
							{showConfirmPassword ? (
								<EyeOff className="h-4 w-4" />
							) : (
								<Eye className="h-4 w-4" />
							)}
							<span className="sr-only">
								{showConfirmPassword ? "Hide password" : "Show password"}
							</span>
						</Button>
					</div>
					{errors.confirmPassword && (
						<p className="text-sm text-destructive">{errors.confirmPassword}</p>
					)}
				</div>

				<div className="flex flex-col gap-2">
					<div className="w-full">
						<Turnstile
							sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
							onVerify={(token) => setCaptchaToken(token)}
							onError={() => setCaptchaToken("")}
							onExpire={() => setCaptchaToken("")}
						/>
					</div>

					<Button
						type="submit"
						disabled={loading || !captchaToken}
						className="w-full"
					>
						{loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						Create account
					</Button>
				</div>

				<div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
					<span className="bg-background text-muted-foreground relative z-10 px-2">
						Or continue with
					</span>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<Button
						variant="outline"
						onClick={handleGoogleSignUp}
						disabled={loading}
						className="w-full"
					>
						<svg
							className="mr-2 h-4 w-4"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
								fill="#4285F4"
							/>
							<path
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
								fill="#34A853"
							/>
							<path
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
								fill="#FBBC05"
							/>
							<path
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
								fill="#EA4335"
							/>
						</svg>
						Google
					</Button>
					<Button
						variant="outline"
						onClick={handleLinkedInSignUp}
						disabled={loading}
						className="w-full"
					>
						<svg
							className="mr-2 h-4 w-4"
							viewBox="0 0 24 24"
							fill="#0A66C2"
							aria-hidden="true"
						>
							<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
						</svg>
						LinkedIn
					</Button>
					<Button
						variant="outline"
						onClick={handleFacebookSignUp}
						disabled={loading}
						className="w-full"
					>
						<svg
							className="mr-2 h-4 w-4"
							viewBox="0 0 24 24"
							fill="#1877F2"
							aria-hidden="true"
						>
							<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
						</svg>
						Facebook
					</Button>
					<Button
						variant="outline"
						onClick={handleGithubSignUp}
						disabled={loading}
						className="w-full"
					>
						<Github className="mr-2 h-4 w-4" />
						GitHub
					</Button>
				</div>
			</form>

			<div className="text-center text-sm">
				Already have an account?{" "}
				<Link href="/sign-in" className="underline underline-offset-4">
					Sign in
				</Link>
			</div>
		</div>
	);
}

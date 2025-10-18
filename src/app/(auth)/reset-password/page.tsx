"use client";

import { AlertCircle, CheckCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Turnstile from "react-turnstile";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import authClient from "@/lib/auth/authClient";
import { cn } from "@/lib/utils";

interface FormData {
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  password?: string;
  confirmPassword?: string;
  general?: string;
}

function ResetPasswordContent() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>("");
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) {
      setErrors({
        general: "Unable to read URL parameters. Please reload the page.",
      });
      return;
    }
    // Log all search params for debugging
    try {
      console.log(
        "All search params:",
        Object.fromEntries(searchParams.entries()),
      );
    } catch {
      // ignore logging errors
    }

    // Check for token in different possible formats
    const tokenParam =
      searchParams.get("token") ||
      searchParams.get("t") ||
      searchParams.get("code");
    const errorParam = searchParams.get("error");

    console.log("Token param:", tokenParam);
    console.log("Error param:", errorParam);

    // Check if we have a hash in the URL (some auth systems put the token in the hash)
    const hash = window.location.hash;
    console.log("URL hash:", hash);

    if (errorParam === "invalid_token") {
      setErrors({
        general:
          "This password reset link is invalid or has expired. Please request a new one.",
      });
    } else if (tokenParam) {
      setToken(tokenParam);
      console.log("Token set from URL parameter:", tokenParam);
    } else if (hash && hash.length > 1) {
      // Try to extract token from hash
      const hashToken = hash.substring(1); // Remove the # character
      setToken(hashToken);
      console.log("Token set from URL hash:", hashToken);
    } else {
      setErrors({
        general:
          "No reset token found. Please request a new password reset link.",
      });
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (formData.password.length > 128) {
      newErrors.password = "Password must be less than 128 characters";
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

    // CAPTCHA validation
    if (!captchaToken) {
      newErrors.general = "Please complete the security verification";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setErrors({
        general:
          "No reset token found. Please request a new password reset link.",
      });
      return;
    }

    if (!validateForm()) return;

    setLoading(true);
    setErrors({});

    try {
      // Log the token being used for debugging
      console.log("Attempting password reset with token:", token);

      const { data, error } = await authClient.resetPassword({
        newPassword: formData.password,
        token,
        fetchOptions: {
          headers: {
            "x-captcha-response": captchaToken,
          },
        },
      });

      // Log the response for debugging
      console.log("Password reset response:", { data, error });

      if (error) {
        if (
          error.message?.includes("invalid") ||
          error.message?.includes("expired")
        ) {
          setErrors({
            general:
              "This password reset link is invalid or has expired. Please request a new one.",
          });
        } else {
          setErrors({ general: error.message || "Failed to reset password" });
        }
        return;
      }

      if (data) {
        setResetSuccess(true);
        toast.success(
          "Password reset successfully! You can now sign in with your new password.",
          {
            duration: 6000,
          },
        );
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="flex flex-col justify-center items-center w-full min-h-screen p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl">
              Password Reset Successfully
            </CardTitle>
            <CardDescription>
              Your password has been updated. You can now sign in with your new
              password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push("/sign-in")}>
              Continue to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center w-full min-h-screen p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Reset Your Password
          </CardTitle>
          <CardDescription>Enter your new password below</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.general && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {errors.general}
                {errors.general.includes("invalid") ||
                errors.general.includes("expired") ? (
                  <div className="mt-2">
                    <Link
                      href="/sign-in"
                      className="underline hover:text-foreground"
                    >
                      Go to sign in page to request a new reset link
                    </Link>
                  </div>
                ) : null}
              </AlertDescription>
            </Alert>
          )}

          {token && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className={cn(errors.password && "border-red-500")}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={loading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be 8+ characters with uppercase, lowercase, and number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    className={cn(errors.confirmPassword && "border-red-500")}
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={loading}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-500">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* CAPTCHA Widget */}
              <div className="space-y-2 flex justify-center">
                <Turnstile
                  sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
                  onVerify={(token: string) => {
                    setCaptchaToken(token);
                    setErrors((prev) => ({ ...prev, general: undefined }));
                  }}
                  onError={() => {
                    setCaptchaToken("");
                    setErrors((prev) => ({
                      ...prev,
                      general: "CAPTCHA verification failed. Please try again.",
                    }));
                  }}
                  onExpire={() => {
                    setCaptchaToken("");
                    setErrors((prev) => ({
                      ...prev,
                      general: "CAPTCHA expired. Please verify again.",
                    }));
                  }}
                  refreshExpired="auto"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !captchaToken}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          )}

          <div className="text-center text-sm">
            <Link
              href="/sign-in"
              className="font-medium text-primary hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col justify-center items-center w-full min-h-screen">
          <div className="max-w-md w-full bg-muted animate-pulse rounded-lg h-96"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

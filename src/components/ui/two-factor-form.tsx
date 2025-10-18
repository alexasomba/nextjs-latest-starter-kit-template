"use client";

import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import createAuthClient from "@/lib/auth/authClient";
import { cn } from "@/lib/utils";

interface FormErrors {
  general?: string;
}

export function TwoFactorForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [loading, setLoading] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTwoFactorVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!twoFactorCode || twoFactorCode.length !== 6) {
      setErrors({ general: "Please enter a valid 6-digit code" });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Two-factor verification - adjust based on your better-auth setup
      console.log(
        "Verifying 2FA code:",
        twoFactorCode,
        "Trust device:",
        trustDevice,
      );
      // const { error } = await createAuthClient.verifyTwoFactor({ code: twoFactorCode, trustDevice });
      const error = null; // Placeholder

      if (error) {
        setErrors({ general: "Invalid verification code" });
        toast.error("Verification failed", {
          description: "Please check your code and try again.",
        });
      } else {
        toast.success("Welcome back!", {
          description: "Two-factor authentication successful.",
        });
        router.push(searchParams?.get("callbackURL") || "/dashboard");
      }
    } catch (err) {
      console.error("2FA verification error:", err);
      setErrors({ general: "An unexpected error occurred" });
      toast.error("Verification failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter the verification code from your authenticator app
        </p>
      </div>

      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleTwoFactorVerify} className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="twoFactorCode">Verification Code</Label>
          <Input
            id="twoFactorCode"
            type="text"
            placeholder="000000"
            value={twoFactorCode}
            onChange={(e) =>
              setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            maxLength={6}
            className={cn(
              "text-center text-2xl tracking-widest",
              errors.general ? "border-destructive" : "",
            )}
            required
            autoFocus
          />
          <p className="text-sm text-muted-foreground text-center">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="trustDevice"
            checked={trustDevice}
            onCheckedChange={(checked: boolean) => setTrustDevice(checked)}
          />
          <Label htmlFor="trustDevice" className="text-sm font-normal">
            Trust this device for 30 days
          </Label>
        </div>

        <Button
          type="submit"
          disabled={loading || twoFactorCode.length !== 6}
          className="w-full"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verify and Sign In
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/sign-in")}
          className="w-full"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Sign In
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Lost access to your authenticator?{" "}
        <Link
          href="/support"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Contact support
        </Link>
      </div>
    </div>
  );
}

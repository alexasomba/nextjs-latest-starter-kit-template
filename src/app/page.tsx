"use client";

import { Github, Package } from "lucide-react";
import { useState } from "react";
import authClient from "@/auth/authClient";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  const { error: sessionError } = authClient.useSession();
  const [isAuthActionInProgress, setIsAuthActionInProgress] = useState(false);

  const handleAnonymousLogin = async () => {
    setIsAuthActionInProgress(true);
    try {
      const result = await authClient.signIn.anonymous();
      console.log("Anonymous login result:", result);

      if (result.error) {
        setIsAuthActionInProgress(false);
        alert(`Anonymous login failed: ${result.error.message}`);
      } else {
        // Login succeeded - middleware will handle redirect to dashboard
        // Force a page refresh to trigger middleware redirect
        window.location.reload();
      }
    } catch (e: unknown) {
      setIsAuthActionInProgress(false);
      const message = e instanceof Error ? e.message : String(e);
      alert(`An unexpected error occurred during login: ${message}`);
    }
  };

  if (sessionError) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Error loading session: {sessionError.message}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Next.js + Cloudflare starter with better-auth
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Kickstart your app with auth, KV, D1, and R2 prewired. Built with
              shadcn-styled components and modern tooling.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleAnonymousLogin}
                disabled={isAuthActionInProgress}
                size="lg"
              >
                {isAuthActionInProgress ? "Logging In..." : "Try the Dashboard"}
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href="https://github.com/zpg6/better-auth-cloudflare"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2" size={16} /> GitHub
                </a>
              </Button>
            </div>
          </div>
          <Card className="w-full">
            <CardHeader>
              <CardTitle>What’s inside</CardTitle>
              <CardDescription>
                Preconfigured to help you move fast.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>better-auth integrated (Cloudflare)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>KV, D1, R2 wiring via Wrangler</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>shadcn-styled UI primitives</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="size-2 rounded-full bg-primary" />
                  <span>OpenNext Cloudflare adapter</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end">
              <Button asChild variant="ghost" size="sm">
                <a
                  href="https://www.npmjs.com/package/better-auth-cloudflare"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Package className="mr-2" size={16} /> npm
                </a>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

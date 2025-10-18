"use client";

import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/components/ui/login-form";

function SignInContent() {
  return (
    <div className="w-full h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <LoginForm />
        </div>
      </div>
      <div className="hidden bg-muted lg:block relative">
        <Image
          src="/placeholder.svg"
          alt="Access control illustration"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}

export default function SignIn() {
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
      <SignInContent />
    </Suspense>
  );
}

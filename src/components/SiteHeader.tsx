"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold"
        >
          <span className="inline-block size-2 rounded-full bg-primary" />
          nextjs-starter
        </Link>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <a
              href="https://github.com/zpg6/better-auth-cloudflare"
              target="_blank"
              rel="noreferrer noopener"
            >
              <Github className="mr-1" size={16} /> GitHub
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}

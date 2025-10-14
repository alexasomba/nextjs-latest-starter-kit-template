import { Github, Package } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="border-t mt-12">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center gap-4 text-sm text-muted-foreground">
          <div>Powered by better-auth-cloudflare</div>
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/zpg6/better-auth-cloudflare"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={16} />
              <span>GitHub</span>
            </Link>
            <Link
              href="https://www.npmjs.com/package/better-auth-cloudflare"
              className="flex items-center gap-1 hover:text-foreground transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Package size={16} />
              <span>npm</span>
            </Link>
          </div>
        </div>
      </div>
      <Separator />
    </footer>
  );
}

import "./globals.css";
import type { Metadata, Viewport } from "next";
import { AppProvider } from "../context";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { GoogleProvider } from "@/components/providers/GoogleProvider";
import Script from "next/script";
import { CHUNK_LOAD_RECOVERY_SCRIPT } from "@/lib/chunkLoadRecoveryScript";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Playgether",
    template: "Playgether - %s",
  },
  description: "Create by gamers for gamers",
  applicationName: "Playgether",
  appleWebApp: {
    title: "Playgether",
  },
  openGraph: {
    type: "website",
    siteName: "Playgether",
    title: "Playgether",
    description: "Create by gamers for gamers",
  },
  twitter: {
    card: "summary_large_image",
    title: "Playgether",
    description: "Create by gamers for gamers",
  },
};

export const viewport: Viewport = {
  themeColor: "#7555E7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="min-h-full max-w-[100vw] overflow-x-hidden"
    >
      <body
        className={cn(
          "min-h-screen max-w-[100vw] font-poppins bg-background text-foreground antialiased"
        )}
      >
        <Script
          id="chunk-load-recovery"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: CHUNK_LOAD_RECOVERY_SCRIPT }}
        />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GoogleProvider>
            <AppProvider>
              <main className="max-w-[100vw] min-h-screen">{children}</main>
            </AppProvider>
          </GoogleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

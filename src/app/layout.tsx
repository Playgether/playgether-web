import "./globals.css";
import { AppProvider } from "../context";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { GoogleProvider } from "@/components/providers/GoogleProvider";
import Script from "next/script";
import { CHUNK_LOAD_RECOVERY_SCRIPT } from "@/lib/chunkLoadRecoveryScript";

export const metadata = {
  description: "Create by gamers for gamers",
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

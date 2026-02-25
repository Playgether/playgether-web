import "./globals.css";
import { AppProvider } from "../context";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";

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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AppProvider>
            <main className="max-w-[100vw] min-h-screen">{children}</main>
          </AppProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

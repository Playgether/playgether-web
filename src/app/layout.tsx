import "./globals.css";
import { AppProvider } from "../context";
import { cn } from "@/lib/utils";

export const metadata = {
  description: "Create by gamers for gamers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="w-fit h-fit max-w-[100vw] overflow-x-hidden">
      <body
        className={cn(
          "text-zinc-50 max-w-[100vw] w-fit h-fit dark font-poppins"
        )}
      >
        <AppProvider>
          <main className="max-w-[100vw] w-fit h-fit">{children}</main>
        </AppProvider>
      </body>
    </html>
  );
}

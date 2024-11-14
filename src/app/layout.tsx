import '@/app/globals.css'
import { AppProvider } from '../context'
import { cn } from '@/lib/utils'



export const metadata = {
  description: 'Create by gamers for gamers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={cn("text-zinc-50")}>
        <AppProvider>
          <main>{children}</main>
        </AppProvider>
      </body>
    </html>
  )
}

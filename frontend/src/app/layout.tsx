import './globals.css'

export const metadata = {
  title: 'Social Game',
  description: 'Create by gamers for gamers',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="text-zinc-50">{children}</body>
    </html>
  )
}

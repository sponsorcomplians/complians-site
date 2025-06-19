import './globals.css'

export const metadata = {
  title: 'UK Sponsor Compliance System',
  description: 'HR SaaS for Sponsor Licence Compliance',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
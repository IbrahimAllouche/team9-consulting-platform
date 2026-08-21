import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Providers } from '@/providers'
import './globals.css'

/*
 * Poppins is loaded through next/font instead of a normal Google Fonts link.
 * Next.js downloads and self-hosts the font during the build, preventing an
 * extra browser request and reducing layout movement while the font loads.
 *
 * The approved design currently uses 400 and 500. We also load 600 and 700
 * because existing application pages use semibold and bold text.
 */
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME ?? 'IBM Consultancy 101'}`,
    default: process.env.NEXT_PUBLIC_APP_NAME ?? 'IBM Consultancy 101',
  },
  description: 'An AI-powered consulting training simulation developed by RMIT Team 9.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      {/*
       * Providers keeps the existing Firebase authentication context and toast
       * system available throughout the application.
       */}
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { ToastContainer } from 'react-toastify'
import { Providers } from './providers'
import ErrorBoundary from '@/components/ErrorBoundary'
import './globals.css'
import 'react-toastify/dist/ReactToastify.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'BloodMe - Save Lives Through Blood Donation',
  description: 'Revolutionary blood donation platform connecting hospitals with donors through real-time alerts, interactive maps, and gamified experiences. Join thousands saving lives daily.',
  keywords: 'blood donation, emergency alerts, hospital network, save lives, blood donors, medical emergency',
  authors: [{ name: 'BloodMe Team' }],
  robots: 'index, follow',
  openGraph: {
    title: 'BloodMe - Save Lives Through Blood Donation',
    description: 'Revolutionary blood donation platform connecting hospitals with donors',
    type: 'website',
    locale: 'en_US',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            {children}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
            />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
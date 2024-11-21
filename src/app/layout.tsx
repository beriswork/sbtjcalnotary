'use client';

import './globals.css'
import { Poppins } from 'next/font/google'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/Header'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  console.log('RootLayout: Rendering, pathname:', 
    typeof window !== 'undefined' ? window.location.pathname : 'server-side'
  );
  
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={poppins.className} suppressHydrationWarning>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}

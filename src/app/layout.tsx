import './globals.css'
import { Poppins } from 'next/font/google'
import { AuthProvider } from './context/AuthContext'
import { Header } from './components/Header'

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: 'Notary Calculator',
  description: 'Calculate notary fees easily',
};

function ClientLayout({ children }: { children: React.ReactNode }) {
  'use client';
  
  console.log('RootLayout: Rendering, pathname:', 
    typeof window !== 'undefined' ? window.location.pathname : 'server-side'
  );

  return (
    <AuthProvider>
      <Header />
      {children}
    </AuthProvider>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon3.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon3.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon3.png" />
        <link rel="mask-icon" href="/favicon3.png" color="#0052CC" />
        <meta name="msapplication-TileImage" content="/favicon3.png" />
        <meta name="msapplication-TileColor" content="#0052CC" />
      </head>
      <body className={poppins.className} suppressHydrationWarning>
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  )
}

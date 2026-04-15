'use client';

import { Geist } from 'next/font/google';
import { usePathname } from 'next/navigation';
import './globals.css';
import { TopBar, Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ChatBot from './components/ui/ChatBot';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Routes that should NOT have the customer header/footer/chatbot
  const isInternal = pathname?.startsWith('/admin') || pathname?.startsWith('/worker');

  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col antialiased bg-[#f8fafc]">
        {!isInternal && <TopBar />}
        {!isInternal && <Header />}
        
        <main className="flex-grow">
          {children}
        </main>

        {!isInternal && <Footer />}
        {!isInternal && <ChatBot />}
      </body>
    </html>
  );
}

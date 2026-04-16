'use client';

import { Geist } from 'next/font/google';
import './globals.css';
import { TopBar, Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ChatBot from './components/ui/ChatBot';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <html lang="en" className={geist.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen flex flex-col antialiased bg-[#f8fafc]">
        <TopBar />
        <Header />
        
        <main className="flex-grow">
          {children}
        </main>

        <Footer />
        <ChatBot />
      </body>
    </html>
  );
}

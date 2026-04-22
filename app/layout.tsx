import { Geist } from 'next/font/google';
import './globals.css';
import { TopBar, Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import ChatBot from './components/ui/ChatBot';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist' });

export const metadata = {
  title: 'Custom Repair | Professional Atlanta Home Services',
  description: 'Expert HVAC, Plumbing, and Electrical services in Metro Atlanta. Same-day service, upfront pricing, and lifetime guarantee.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  
  return (
    <html lang="en" suppressHydrationWarning className={geist.variable} data-scroll-behavior="smooth">
      <body suppressHydrationWarning>
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

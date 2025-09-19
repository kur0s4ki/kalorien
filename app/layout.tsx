import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CalculatorProvider } from '@/contexts/CalculatorContext';
import { ConfigProvider } from '@/contexts/ConfigContext';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Calorie Expenditure Calculator',
  description: 'Educational calorie expenditure calculator. Results are estimates only and not medical advice. Consult healthcare professionals before making dietary changes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConfigProvider>
          <CalculatorProvider>
            {children}
            <Toaster />
          </CalculatorProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}

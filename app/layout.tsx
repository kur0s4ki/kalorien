import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { CalculatorProvider } from '@/contexts/CalculatorContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Health Calculator - Educational Tool Only',
  description: 'Educational health and fitness calculator. Results are estimates only and not medical advice. Consult healthcare professionals before making dietary changes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CalculatorProvider>
          {children}
        </CalculatorProvider>
      </body>
    </html>
  );
}

import './globals.css';
import { ReactNode } from 'react';

export const metadata = {
  title: 'Luxury Home Ownership',
  description: 'Screen-mapped luxury dashboard built with Next.js and NestJS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

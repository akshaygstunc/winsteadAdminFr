import './globals.css';
import { ReactNode } from 'react';
import Script from "next/script";
export const metadata = {
  title: 'Luxury Home Ownership',
  description: 'Screen-mapped luxury dashboard built with Next.js and NestJS',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBYqT5yoYLpWcuWaurk6MEqbERHG4eh5oQ&libraries=places`}
        strategy="beforeInteractive"
      />
    </html>
  );
}

"use client"
import './globals.css';
import { ReactNode, useEffect } from 'react';
import Script from "next/script";
// export const metadata = {
//   title: 'Luxury Home Ownership',
//   description: 'Screen-mapped luxury dashboard built with Next.js and NestJS',
// };

export default function RootLayout({ children }: { children: ReactNode }) {
  useEffect(() => {

    // =========================
    // Tracking Script
    // =========================

    let sessionId = localStorage.getItem('session_id')

    if (!sessionId) {
      sessionId = crypto.randomUUID()
      localStorage.setItem('session_id', sessionId)
    }

    const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/tracking`

    const trackPage = async () => {
      try {
        await fetch(`${API_URL}/page-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            page: window.location.pathname,
            fullUrl: window.location.href,
            referrer: document.referrer,
            userAgent: navigator.userAgent,
            screen: `${window.screen.width}x${window.screen.height}`,
            language: navigator.language,
            timezone:
              Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        })
      } catch (err) {
        console.error('Tracking Error:', err)
      }
    }

    const heartbeat = async () => {
      try {
        await fetch(`${API_URL}/heartbeat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            page: window.location.pathname,
            status: 'active',
          }),
        })
      } catch (err) { }
    }

    // Initial page tracking
    trackPage()

    // Heartbeat every 20 sec
    const heartbeatInterval = setInterval(() => {
      heartbeat()
    }, 20000)

    // Detect route changes
    let currentPath = window.location.pathname

    const routeInterval = setInterval(() => {
      if (window.location.pathname !== currentPath) {
        currentPath = window.location.pathname
        trackPage()
      }
    }, 500)

    return () => {
      clearInterval(heartbeatInterval)
      clearInterval(routeInterval)
    }
  }, [])

  return (
    <html lang="en" >
      <head><title>Winstead Admin</title></head>
      <body>{children}</body>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=AIzaSyBYqT5yoYLpWcuWaurk6MEqbERHG4eh5oQ&libraries=places`}
        strategy="beforeInteractive"
      />
    </html>
  );
}

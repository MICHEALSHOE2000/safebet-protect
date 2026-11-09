import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'SafeBet Protect Nigeria — Your choice. Your protection.', manifest: '/manifest.webmanifest', icons: { icon: '/favicon.svg' }, description: 'Independent player protection with phone-number or NIN enrolment, self-exclusion and confidential reporting.' };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }

import type { Metadata } from 'next';
import '@fontsource-variable/manrope';
import './globals.css';
export const metadata: Metadata = { title: 'SafeBet Protect Nigeria — Your choice. Your protection.', manifest: '/manifest.webmanifest', icons: { icon: '/favicon.svg' }, description: 'An independent pilot exploring voluntary self-exclusion at participating physical betting shops in Nigeria.' };
export default function Layout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }

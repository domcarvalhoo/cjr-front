import { cookies } from 'next/headers';
import Navbar from '@/components/navbar';
import type { Metadata } from "next";
import { League_Spartan } from "next/font/google";
import "./globals.css";

export const instant = false;

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  variable: "--font-league-spartan",
});

export const metadata: Metadata = {
  title: "STOCK.IO | Login",
  description: "Acesse sua conta STOCK.IO",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  const isAuthenticated = !!token?.value;
  return (
    <html lang="pt-BR" className={leagueSpartan.variable}>
      <body>
        <Navbar isLoggedIn={isAuthenticated} />
        <main>{children}</main>
      </body>
    </html>
  );
}
import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/NavBar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: { default: "PinjamLab", template: "%s · PinjamLab" },
  description: "Aplikasi peminjaman ruang dan laboratorium sekolah",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="antialiased">
      <body
        className={`${poppins.className} flex min-h-screen flex-col bg-slate-50 text-slate-800`}
      >
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 p-6">{children}</main>
        <footer className="border-t bg-white p-4 text-center text-sm text-slate-500">
          PinjamLab · Peminjaman Ruang dan Laboratorium
        </footer>
      </body>
    </html>
  );
}
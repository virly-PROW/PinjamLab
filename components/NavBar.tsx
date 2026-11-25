"use client";

import Link from "next/link";
import {usePathname} from "next/navigation";

const menu = [
    {href: "/", teks: "Beranda"},
    {href: "/ruang", teks: "Ruang"},
    {href: "/peminjaman", teks: "Jadwal"},
    {href: "/pinjam", teks: "Ajukan"},
    {href: "/cek", teks: "Cek Status"},
    {href: "/admin", teks: "Admin"},

];

export default function Navbar() {
    const pathname = usePathname();

    // "/ hanya aktif kalau perisi /, sisanya katif juga di halamn turunnany 
    const aktif = (href: string) => 
        href === "/" ? pathname === "/" : pathname.startsWith(href);

    return (
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b bg-white px-6 py-3">
          <span className="text-lg font-bold text-blue-600">PinjamLab</span>
          <div className="ml-auto flex flex-wrap gap-x-6 gap-y-2">
            {menu.map((m) => (
              <Link
                key={m.href}
                href={m.href}
                className={
                  aktif(m.href)
                    ? "font-semibold text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }
              >
                {m.teks}
              </Link>
            ))}
          </div>
        </nav>
      );
}
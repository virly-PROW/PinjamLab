import type { Metadata} from "next";
import Link from  "next/link";
import {ambilRuang} from "@/data/ambil";
import {bacaJenis, JENIS_RUANG} from "@/data/ruang";
import KartuRuang from "@/components/KartuRuang";

export const metadata: Metadata = {title : "Ruang"}

export default async function HalamanRuang({
    searchParams,
  }: PageProps<"/ruang">) {
    const { jenis: jenisMentah } = await searchParams;
    const jenis = bacaJenis(jenisMentah); // tidak valid / ganda -> null (tampilkan semua)
    const daftar = await ambilRuang(jenis);

    const pilihan = [
        { href: "/ruang", teks: "Semua", aktif: jenis === null },
        ...JENIS_RUANG.map((j) => ({
        href: `/ruang?jenis=${j}`,
        teks: j.charAt(0).toUpperCase() + j.slice(1),
        aktif: jenis === j,
        })),
    ];


    return (
        <div>
            <h1 className="mb-4 text-2xl font-bold">Daftar Ruang</h1>

            <div className="mb-4 flex flex-wrap gap-2">
            {pilihan.map((p) => (
          <Link
            key={p.href}
            href={p.href}
            className={
              "rounded-full border px-4 py-1.5 text-sm " +
              (p.aktif
                ? "border-blue-600 bg-blue-600 font-semibold text-white"
                : "bg-white text-slate-600 hover:border-blue-500 hover:text-blue-600")
            }
          >
            {p.teks}
            </Link>
           ))} 
            </div>

            <p className="mb-3 text-sm text-slate-500">
                {daftar.length} ruang ditemukan
            </p>

            {daftar.length === 0 ? (
                <p className="text-slate-500">Belum ada ruang untuk jenis ini.</p>

            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{daftar.map((r) => (
                    <KartuRuang key={r.id} ruang={r}/>
                ))}
                </div>
            )}
        </div>
    )
  }
 

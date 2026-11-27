import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/sesi";
import { ambilSemuaPermohonan } from "@/data/ambil";
import { STATUS, bacaStatus } from "@/data/peminjaman";
import { formatTanggal, formatJam } from "@/lib/format";
import AksiPermohonan from "@/components/AksiPermohonan";

export const metadata: Metadata = { title: "Permohonan" };

const WARNA_STATUS = {
  menunggu: "bg-amber-100 text-amber-700",
  disetujui: "bg-green-100 text-green-700",
  ditolak: "bg-red-100 text-red-700",
} as const;

export default async function HalamanAdmin({ searchParams }: PageProps<"/admin">) {
  await requireAdmin(); 

  const { status: statusMentah } = await searchParams;
  const status = bacaStatus(statusMentah); 
  const daftar = await ambilSemuaPermohonan(status);

  const pilihan = [
    { href: "/admin", teks: "Semua", aktif: status === null },
    ...STATUS.map((s) => ({
      href: `/admin?status=${s}`,
      teks: s.charAt(0).toUpperCase() + s.slice(1),
      aktif: status === s,
    })),
  ];

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Permohonan Peminjaman</h1>

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

      <p className="mb-3 text-sm text-slate-500">{daftar.length} permohonan</p>

      {daftar.length === 0 ? (
        <p className="text-slate-500">Tidak ada permohonan untuk status ini.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-semibold">No</th>
                <th className="px-4 py-3 font-semibold">Peminjam</th>
                <th className="px-4 py-3 font-semibold">Ruang dan jadwal</th>
                <th className="px-4 py-3 font-semibold">Keperluan</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {daftar.map((p) => (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-3">#{p.id}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.peminjam}</p>
                    <p className="text-slate-500">{p.jumlah_orang} orang</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.ruang?.nama ?? "-"}</p>
                    <p className="text-slate-500">{formatTanggal(p.tanggal)}</p>
                    <p className="text-slate-500">
                      {formatJam(p.mulai)} - {formatJam(p.selesai)}
                    </p>
                  </td>
                  <td className="px-4 py-3">{p.keperluan}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${WARNA_STATUS[p.status]}`}
                    >
                      {p.status}
                    </span>
                    {p.status === "ditolak" && p.alasan_tolak && (
                      <p className="mt-1 max-w-48 text-xs text-slate-500">
                        {p.alasan_tolak}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === "menunggu" ? (
                      <AksiPermohonan id={p.id} />
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
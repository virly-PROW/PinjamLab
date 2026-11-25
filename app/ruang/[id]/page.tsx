import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ambilRuangById, ambilJadwalRuang } from "@/data/ambil";
import { formatTanggal, formatJam } from "@/lib/format";

const WARNA_JENIS = {
  lab: "bg-blue-100 text-blue-700",
  kelas: "bg-green-100 text-green-700",
  aula: "bg-purple-100 text-purple-700",
} as const;


export async function generateMetadata({
  params,
}: PageProps<"/ruang/[id]">): Promise<Metadata> {
  const { id } = await params;
  const ruang = await ambilRuangById(Number(id));
  if (!ruang) return { title: "Ruang tidak ditemukan" };
  return {
    title: ruang.nama,
    description: `${ruang.jenis} di ${ruang.lokasi}, kapasitas ${ruang.kapasitas} orang.`,
  };
}

export default async function DetailRuang({
  params,
}: PageProps<"/ruang/[id]">) {
  const { id } = await params;
  const ruang = await ambilRuangById(Number(id));
  if (!ruang) notFound();

  const jadwal = await ambilJadwalRuang(ruang.id);

  return (
    <article className="rounded-xl border bg-white p-6">
      <span
        className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${WARNA_JENIS[ruang.jenis]}`}
      >
        {ruang.jenis}
      </span>
      {!ruang.aktif && (
        <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
          Nonaktif
        </span>
      )}

      <h1 className="mt-2 text-3xl font-bold">{ruang.nama}</h1>
      <p className="mt-1 text-slate-500">{ruang.lokasi}</p>
      <p className="mt-3 font-medium text-slate-700">
        Kapasitas {ruang.kapasitas} orang
      </p>

      {ruang.aktif ? (
        <Link
          href="/pinjam"
          className="mt-4 inline-block rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Ajukan peminjaman
        </Link>
      ) : (
        <p className="mt-4 text-sm text-red-600">
          Ruang ini sedang tidak dapat dipinjam.
        </p>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Jadwal yang sudah disetujui</h2>
        {jadwal.length === 0 ? (
          <p className="mt-2 text-slate-500">
            Belum ada jadwal yang disetujui untuk ruang ini.
          </p>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border">
            {jadwal.map((j) => (
              <li key={j.id} className="p-3">
                <p className="font-medium">{formatTanggal(j.tanggal)}</p>
                <p className="text-sm text-slate-600">
                  {formatJam(j.mulai)} - {formatJam(j.selesai)} · {j.keperluan}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
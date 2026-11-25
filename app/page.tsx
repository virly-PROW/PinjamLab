import Link from "next/link";
import {ambilRuang} from "@/data/ambil";
import KartuRuang from "@/components/KartuRuang";

export default async function Beranda() {
  const daftar = await ambilRuang(null);

  const jumlah = {
    lab: daftar.filter((r) => r.jenis === "lab").length,
    kelas: daftar.filter((r) => r.jenis === "kelas").length,
    aula: daftar.filter((r) => r.jenis === "aula").length,
  };


  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-b from-blue-50 to-white px-6 py-14 text-center">
        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-700">
          Peminjaman Ruang Sekolah
        </span>
        <h1 className="mx-auto mt-4 max-w-2xl text-4xl font-bold leading-tight">
          Pinjam  Ruang dan Laboratorium
        </h1>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/pinjam"
            className="rounded bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700"
          >
            Ajukan Peminjaman
          </Link>
          <Link
            href="/ruang"
            className="rounded border bg-white px-5 py-2.5 font-medium hover:border-blue-500"
          >
            Lihat Semua Ruang
          </Link>
        </div>

        <div className="mx-auto mt-10 grid max-w-md grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-blue-600">{jumlah.lab}</p>
            <p className="text-sm text-slate-500">Laboratorium</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{jumlah.kelas}</p>
            <p className="text-sm text-slate-500">Ruang Kelas</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{jumlah.aula}</p>
            <p className="text-sm text-slate-500">Aula</p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">Ruang yang Tersedia</h2>
          <p className="mt-1 text-slate-500">
            Hanya ruang yang sedang aktif yang ditampilkan.
          </p>
        </div>

        {daftar.length === 0 ? (
          <p className="text-center text-slate-600">
            Belum ada ruang yang tersedia.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {daftar.map((r) => (
              <KartuRuang key={r.id} ruang={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );

}
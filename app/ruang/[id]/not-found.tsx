import Link from "next/link";

export default function RuangTidakDitemukan() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Ruang tidak ditemukan</h1>
      <p className="mt-2 text-slate-600">
        Ruang yang kamu cari tidak ada. Mungkin alamatnya salah.
      </p>
      <Link href="/ruang" className="mt-4 inline-block text-blue-600 hover:underline">
        Lihat daftar ruang
      </Link>
    </div>
  );
}
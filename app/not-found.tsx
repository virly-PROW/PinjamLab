import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="text-2xl font-bold">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-slate-600">
        Alamat yang kamu buka tidak ada atau sudah dipindahkan.
      </p>
      <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
        Kembali ke beranda
      </Link>
    </div>
  );
}
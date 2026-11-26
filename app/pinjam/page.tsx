import type {Metadata} from "next";
import {ambilRuang} from "@/data/ambil";
import FormPinjam from "@/components/FormPinjam";

export const metadata: Metadata = {title: "Ajukan Pinjaman"};

export default async function HalamanPinjam({ searchParams }: PageProps<"/pinjam">) {
    const { ruang: ruangMentah } = await searchParams;
    const daftar = await ambilRuang(null);
    // ?ruang isi url hanya diterima kalau cocok denagn ruang aktif
    const id = typeof ruangMentah === "string" ? Number(ruangMentah) : NaN;
    const ruangAwal = daftar.some((r) => r.id) ? String(id) : "";

    return (
        <div className="mx-auto max-w-xl">
          <h1 className="mb-2 text-2xl font-bold">Ajukan Peminjaman</h1>
          <p className="mb-4 text-sm text-slate-500">
            Isi form di bawah. Permohonanmu akan menunggu persetujuan admin.
          </p>
          <FormPinjam daftarRuang={daftar} ruangAwal={ruangAwal} />
        </div>
      );
}
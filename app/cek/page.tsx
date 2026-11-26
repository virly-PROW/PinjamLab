import type { Metadata } from "next";
import { cekStatus } from "@/data/ambil";
import CekStatus from "@/components/CekStatus";

export const metadata: Metadata = {title: "Cek Status"};

export default async function HalamanCek({ searchParams}: PageProps<"/cek">) {
    const {nomor: nomorMentah, nama: namaMentah} = await searchParams;

    // isis url bisa apa saja hanya teks yang diterima, selain itu dianggap kosong
    const nomor = typeof nomorMentah === "string" ? nomorMentah.trim() : "";
    const nama = typeof namaMentah === "string" ? namaMentah.trim(): "";

    const sudahCari = nomor !== "" || nama !== "";
    const hasil = sudahCari ? await cekStatus(Number(nomor), nama) : null;

    return (
        <div className="mx-auto max-w-xl">
           <h1 className="mb-2 text-2xl font-bold">Cek Status Peminjaman</h1>
            <p className="mb-4 text-sm text-slate-500">
                Masukkan nomor permohonan dan nama peminjam. Keduanya harus cocok.
            </p> 

            <CekStatus
                key={`${nomor}|${nama}`}
                nomor={nomor}
                nama={nama}
                sudahCari={sudahCari}
                hasil={hasil}
            />
        </div>
    )
}
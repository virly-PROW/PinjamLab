import type { Metadata} from "next";
import Link from "next/link";
import {ambilJadwalDisetujui} from "@/data/ambil";
import { formatTanggal, formatJam} from "@/lib/format";

export const metadata: Metadata = {title: "Jadwal"};

export default async function HalamanJadwal() {
    const jadwal = await ambilJadwalDisetujui();

    return (
        <div> 
            <h1 className="mb-2 text-2xl font-bold">Jadwal Peminjaman</h1>
            <p className="mb-4 text-sm text-slate-500">
                Hanya peminjaman yang sudah disetujui yang ditampilkan 
            </p>

            {jadwal.length === 0 ? (
                <p className="text-slate-500"> Belum ada jadwal yang disetujui</p>
            ) : (
                <div className="overflow-x-auto rounded-xl border bg-white">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Tanggal</th>
                                <th className="px-4 py-3 font-semibold">Jam</th>
                                <th className="px-4 py-3 font-semibold">Ruang</th>
                                <th className="px-4 py-3 font-semibold">Keperluan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {jadwal.map((j) => (
                                <tr key={j.id}>
                                    <td className="px-4 py-3">{formatTanggal(j.tanggal)}</td>
                                    <td className="px-4 py-3">{formatJam(j.mulai)} - {formatJam(j.selesai)} </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/ruang/${j.ruang_id}`}
                                            className="text-blue-600 hover:underline">
                                                {j.ruang?.nama ?? "Ruang"}
                                            </Link>
                                    </td>
                                    <td className="px-4 py-3">{j.keperluan}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}


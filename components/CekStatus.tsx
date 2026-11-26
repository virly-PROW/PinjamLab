import type { Peminjaman } from "@/data/peminjaman";
import {formatTanggal, formatJam} from "@/lib/format";

const WARNA_STATUS = {
    menunggu: "bg-amber-100 text-amber-700",
    disetujui: "bg-green-100 text-green-700",
    ditolak: "bg-red-100 text-red-700",
} as const;

export default function CekStatus({
    nomor,
    nama,
    sudahCari,
    hasil,
}: {
    nomor: string;
    nama: string;
    sudahCari: boolean;
    hasil: Peminjaman | null;
}) {
    return(
        <div>
            <form action="/cek" className="space-y-3 rounded-xl border bg-white p-6">
            <div>
                <label className="mb-1 block text-sm font-medium">Nomor Permohonan</label>
                <input
                    name="nomor"
                    defaultValue={nomor}
                    className="block w-full rounded border px-3 py-2"
                />
            </div>
            <button className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"> Cek Status</button>
            </form>

            {sudahCari && !hasil && (
                <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    Data tidak ditemukan, Periksa lagi nomor dan nama yang akmu masukkan
                </p>
            )}

            {hasil && (
                <div className="mt-4 rounded-xl border bg-white p-6">
                    <div className="flex items-center justify-between">
                    <p className="text-lg font-bold">Permohonan #{hasil.id}</p>
                    <span
                        className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${WARNA_STATUS[hasil.status]}`}>
                            {hasil.status}
                        </span>
                    </div>

                    <dl className="mt-3 space-y-1 text-sm">
                        <div>
                        <dt className="inline text-slate-500">Ruang: </dt>
                        <dd className="inline font-medium">{hasil.ruang?.nama ?? "-"}</dd>
                        </div>
                        <div>
                        <dt className="inline text-slate-500">Tanggal: </dt>
                        <dd className="inline font-medium">{formatTanggal(hasil.tanggal)}</dd>
                        </div>
                        <div>
                        <dt className="inline text-slate-500">Jam: </dt>
                        <dd className="inline font-medium">
                            {formatJam(hasil.mulai)} - {formatJam(hasil.selesai)}
                        </dd>
                        </div>
                        <div>
                        <dt className="inline text-slate-500">Keperluan: </dt>
                        <dd className="inline font-medium">{hasil.keperluan}</dd>
                        </div>
                        <div>
                        <dt className="inline text-slate-500">Jumlah orang: </dt>
                        <dd className="inline font-medium">{hasil.jumlah_orang}</dd>
                        </div>
                    </dl>

                    {hasil.status === "ditolak" && hasil.alasan_tolak && (
                        <p className="mt-3 rounded bg-red-50 p-3 text-sm text-red-700">
                        <b>Alasan penolakan:</b> {hasil.alasan_tolak}
                        </p>
                    )}
                    {hasil.status === "menunggu" && (
                        <p className="mt-3 text-sm text-slate-500">
                            Permohinanmu menuggu persetujuan admin.
                        </p>
                    )}
                </div>      
            )}
        </div>
    )
}

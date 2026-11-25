import Link from "next/link";
import type {Ruang} from "@/data/ruang";

// nama class tailwing 
const WARNA_JENIS: Record<Ruang["jenis"], string> = {
    lab: "bg-blue-100 text-blue-700",
  kelas: "bg-green-100 text-green-700",
  aula: "bg-purple-100 text-purple-700",   
};

export default function KartuRuang({ruang}: { ruang: Ruang}) {
    return (
        <div className="flex flex-col rounded-xl border ng-white p-4 shadow-sm transisition hover:shadow-md">
            <div>
                <span className={`rounded px-2 py-0.5 text-xs font-bold uppercase ${WARNA_JENIS[ruang.jenis]}`}>
                    {ruang.jenis}
                </span>
            </div>

            <h3 className="mt-3 text-lg font-semibold">{ruang.nama}</h3>
            <p className="text-sm text-slate-500">{ruang.lokasi}</p>
            <p className="mt-2 text-sm font-medium text-slate-700">
                Kapasitas {ruang.kapasitas} orang
            </p>

            <Link 
                href={`/ruang/${ruang.id}`}
                className="mt-4 inline-block self-start rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700">
                    Lihat Detail
                </Link>
        </div>
    )
}
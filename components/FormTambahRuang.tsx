"use client";
import { useActionState } from "react";
import { tambahRuang, type HasilRuang } from "@/app/admin/action";
import { JENIS_RUANG } from "@/data/ruang";

const kelas = "block w-full rounded border px-3 py-2";

export default function FormTambahRuang() {
  const awal: HasilRuang = {
    pesan: "",
    galat: {},
    isian: { nama: "", jenis: "", kapasitas: "", lokasi: "" },
  };
  const [hasil, kirim, sedangKirim] = useActionState(tambahRuang, awal);

  return (
    <form action={kirim} className="mb-6 space-y-3 rounded-xl border bg-white p-6">
      <h2 className="text-lg font-semibold">Tambah ruang</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Nama ruang</label>
          <input name="nama" defaultValue={hasil.isian.nama} className={kelas} />
          {hasil.galat.nama && <p className="text-sm text-red-600">{hasil.galat.nama}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Jenis</label>
          <select name="jenis" defaultValue={hasil.isian.jenis} className={kelas}>
            <option value="">Pilih jenis</option>
            {JENIS_RUANG.map((j) => (
              <option key={j} value={j}>
                {j.charAt(0).toUpperCase() + j.slice(1)}
              </option>
            ))}
          </select>
          {hasil.galat.jenis && <p className="text-sm text-red-600">{hasil.galat.jenis}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Kapasitas</label>
          <input
            name="kapasitas"
            type="number"
            defaultValue={hasil.isian.kapasitas}
            className={kelas}
          />
          {hasil.galat.kapasitas && (
            <p className="text-sm text-red-600">{hasil.galat.kapasitas}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Lokasi</label>
          <input name="lokasi" defaultValue={hasil.isian.lokasi} className={kelas} />
          {hasil.galat.lokasi && <p className="text-sm text-red-600">{hasil.galat.lokasi}</p>}
        </div>
      </div>

      {hasil.pesan && <p className="text-red-600">{hasil.pesan}</p>}

      <button
        disabled={sedangKirim}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {sedangKirim ? "Menyimpan..." : "Tambah ruang"}
      </button>
    </form>
  );
}
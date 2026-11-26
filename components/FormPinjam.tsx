"use client";
import Link from "next/link";
import { useActionState, useEffect, useRef } from "react";
import { ajukanPeminjaman, type HasilAjukan } from "@/app/action";
import type { Ruang } from "@/data/ruang";

const kelas = "block w-full rounded border px-3 py-2";

export default function FormPinjam({
  daftarRuang,
  ruangAwal,
}: {
  daftarRuang: Ruang[];
  ruangAwal: string;
}) {
  const awal: HasilAjukan = {
    berhasil: false,
    pesan: "",
    galat: {},
    isian: {
      ruang: ruangAwal,
      peminjam: "",
      keperluan: "",
      tanggal: "",
      mulai: "",
      selesai: "",
      jumlah: "",
    },
  };

  const [hasil, kirim, sedangKirim] = useActionState(ajukanPeminjaman, awal);
  const kotakSukses = useRef<HTMLDivElement>(null);

  // Tombol Ajukan ada di bawah, kotak sukses di atas: gulir otomatis supaya nomor terlihat
  useEffect(() => {
    if (hasil.berhasil) {
      kotakSukses.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [hasil]);

  return (
    <form action={kirim} className="space-y-3 rounded-xl border bg-white p-6">
      {hasil.berhasil && hasil.nomor && (
        <div
          ref={kotakSukses}
          className="rounded-xl border-2 border-green-500 bg-green-50 p-5 text-center"
        >
          <p className="font-semibold text-green-800">{hasil.pesan}</p>
          <p className="mt-3 text-sm text-slate-600">Nomor permohonanmu</p>
          <p className="text-5xl font-bold text-green-700">#{hasil.nomor}</p>
          <p className="mt-3 text-sm text-slate-700">
            Catat atau screenshot nomor ini. Untuk cek status, kamu butuh nomor
            ini dan nama yang sama persis seperti saat mengajukan.
          </p>
          <Link
            href="/cek"
            className="mt-3 inline-block font-medium text-blue-600 hover:underline"
          >
            Cek status permohonan →
          </Link>
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium">Ruang</label>
        <select name="ruang" defaultValue={hasil.isian.ruang} className={kelas}>
          <option value="">Pilih ruang</option>
          {daftarRuang.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nama} (kapasitas {r.kapasitas})
            </option>
          ))}
        </select>
        {hasil.galat.ruang && <p className="text-sm text-red-600">{hasil.galat.ruang}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Nama peminjam</label>
        <input name="peminjam" defaultValue={hasil.isian.peminjam} className={kelas} />
        {hasil.galat.peminjam && <p className="text-sm text-red-600">{hasil.galat.peminjam}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Keperluan</label>
        <input name="keperluan" defaultValue={hasil.isian.keperluan} className={kelas} />
        {hasil.galat.keperluan && <p className="text-sm text-red-600">{hasil.galat.keperluan}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Tanggal</label>
        <input name="tanggal" type="date" defaultValue={hasil.isian.tanggal} className={kelas} />
        {hasil.galat.tanggal && <p className="text-sm text-red-600">{hasil.galat.tanggal}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Jam mulai</label>
          <input name="mulai" type="time" defaultValue={hasil.isian.mulai} className={kelas} />
          {hasil.galat.mulai && <p className="text-sm text-red-600">{hasil.galat.mulai}</p>}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Jam selesai</label>
          <input name="selesai" type="time" defaultValue={hasil.isian.selesai} className={kelas} />
          {hasil.galat.selesai && <p className="text-sm text-red-600">{hasil.galat.selesai}</p>}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Jumlah orang</label>
        <input name="jumlah" type="number" defaultValue={hasil.isian.jumlah} className={kelas} />
        {hasil.galat.jumlah && <p className="text-sm text-red-600">{hasil.galat.jumlah}</p>}
      </div>

      {!hasil.berhasil && hasil.pesan && <p className="text-red-600">{hasil.pesan}</p>}

      <button
        disabled={sedangKirim}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {sedangKirim ? "Memproses..." : "Ajukan peminjaman"}
      </button>
    </form>
  );
}
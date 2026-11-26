"use server";
import { revalidatePath } from "next/cache";
import { ambilRuangById, ambilBentrok } from "@/data/ambil";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { jamKeMenit } from "@/lib/format";

export type HasilAjukan = {
  berhasil: boolean;
  nomor?: number;
  pesan: string;
  galat: {
    ruang?: string;
    peminjam?: string;
    keperluan?: string;
    tanggal?: string;
    mulai?: string;
    selesai?: string;
    jumlah?: string;
  };
  isian: {
    ruang: string;
    peminjam: string;
    keperluan: string;
    tanggal: string;
    mulai: string;
    selesai: string;
    jumlah: string;
  };
};

export async function ajukanPeminjaman(
  _sebelum: HasilAjukan,
  formData: FormData
): Promise<HasilAjukan> {
  const teks = (kunci: string) => String(formData.get(kunci) ?? "").trim();
  const isian = {
    ruang: teks("ruang"),
    peminjam: teks("peminjam"),
    keperluan: teks("keperluan"),
    tanggal: teks("tanggal"),
    mulai: teks("mulai"),
    selesai: teks("selesai"),
    jumlah: teks("jumlah"),
  };
  const galat: HasilAjukan["galat"] = {};

  // 1. Ruang: jangan percaya browser, baca ulang dari database
  const ruang = await ambilRuangById(Number(isian.ruang));
  if (!ruang) galat.ruang = "Pilih ruang yang tersedia.";
  else if (!ruang.aktif) galat.ruang = "Ruang ini sedang tidak dapat dipinjam.";

  // 2. Nama dan keperluan
  if (isian.peminjam.length < 3) galat.peminjam = "Nama minimal 3 huruf.";
  else if (isian.peminjam.length > 40) galat.peminjam = "Nama maksimal 40 huruf.";

  if (isian.keperluan.length < 5) galat.keperluan = "Keperluan minimal 5 huruf.";
  else if (isian.keperluan.length > 120) galat.keperluan = "Keperluan maksimal 120 huruf.";

  // 3. Tanggal: valid, tidak lampau, maksimal 60 hari, bukan Sabtu/Minggu
  const hariIni = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
  const tgl = new Date(isian.tanggal + "T00:00:00Z");
  const tanggalValid =
    /^\d{4}-\d{2}-\d{2}$/.test(isian.tanggal) &&
    !isNaN(tgl.getTime()) &&
    tgl.toISOString().slice(0, 10) === isian.tanggal;

  if (!tanggalValid) {
    galat.tanggal = "Tanggal tidak valid.";
  } else {
    const batas = new Date(hariIni + "T00:00:00Z");
    batas.setUTCDate(batas.getUTCDate() + 60);
    const hari = tgl.getUTCDay(); // 0 = Minggu, 6 = Sabtu

    if (isian.tanggal < hariIni) galat.tanggal = "Tanggal tidak boleh sudah lewat.";
    else if (isian.tanggal > batas.toISOString().slice(0, 10))
      galat.tanggal = "Peminjaman paling jauh 60 hari ke depan.";
    else if (hari === 0 || hari === 6)
      galat.tanggal = "Peminjaman tidak dilayani pada hari Sabtu dan Minggu.";
  }

  // 4. Jam: 07:00-17:00, selesai setelah mulai, durasi maksimal 3 jam
  const formatJam = /^([01]\d|2[0-3]):[0-5]\d$/;
  const mulaiOk = formatJam.test(isian.mulai);
  const selesaiOk = formatJam.test(isian.selesai);

  if (!mulaiOk) galat.mulai = "Isi jam mulai.";
  else if (jamKeMenit(isian.mulai) < 7 * 60) galat.mulai = "Jam mulai paling awal 07:00.";

  if (!selesaiOk) galat.selesai = "Isi jam selesai.";
  else if (jamKeMenit(isian.selesai) > 17 * 60) galat.selesai = "Jam selesai paling lambat 17:00.";

  if (mulaiOk && selesaiOk && !galat.mulai && !galat.selesai) {
    const durasi = jamKeMenit(isian.selesai) - jamKeMenit(isian.mulai);
    if (durasi <= 0) galat.selesai = "Jam selesai harus setelah jam mulai.";
    else if (durasi > 180) galat.selesai = "Durasi paling lama 3 jam.";
  }

  // 5. Jumlah orang
  const jumlah = Number(isian.jumlah);
  if (!Number.isInteger(jumlah) || jumlah < 1) galat.jumlah = "Jumlah orang minimal 1.";
  else if (ruang && jumlah > ruang.kapasitas)
    galat.jumlah = `Kapasitas ruang hanya ${ruang.kapasitas} orang.`;

  // 6. Bentrok dengan yang sudah disetujui (hanya diperiksa kalau data jadwalnya sudah valid)
  if (ruang && ruang.aktif && !galat.tanggal && !galat.mulai && !galat.selesai) {
    if (await ambilBentrok(ruang.id, isian.tanggal, isian.mulai, isian.selesai)) {
      galat.mulai = "Bentrok dengan peminjaman lain yang sudah disetujui. Pilih jam atau ruang lain.";
    }
  }

  if (Object.keys(galat).length > 0 || !ruang) {
    return { berhasil: false, pesan: "Periksa lagi isian yang merah.", galat, isian };
  }

  // 7. Simpan. Status otomatis "menunggu" (default di database).
  const { data: baru, error } = await supabaseAdmin
    .from("peminjaman")
    .insert({
      ruang_id: ruang.id,
      peminjam: isian.peminjam,
      keperluan: isian.keperluan,
      tanggal: isian.tanggal,
      mulai: isian.mulai,
      selesai: isian.selesai,
      jumlah_orang: jumlah,
    })
    .select("id")
    .single();

  if (error) {
    // 23514 = melanggar CHECK di database (pengaman terakhir)
    const pesan =
      error.code === "23514"
        ? "Isian melanggar aturan peminjaman. Periksa jam dan durasinya."
        : "Permohonan gagal disimpan. Coba lagi.";
    return { berhasil: false, pesan, galat: {}, isian };
  }

  revalidatePath("/admin");

  return {
    berhasil: true,
    nomor: baru.id,
    pesan: "Permohonan berhasil diajukan.",
    galat: {},
    isian: { ...isian, peminjam: "", keperluan: "", tanggal: "", mulai: "", selesai: "", jumlah: "" },
  };
}
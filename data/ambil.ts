import { supabase } from "@/lib/supabase";
import type { Ruang, Jenis } from "@/data/ruang";
import {supabaseAdmin} from "@/lib/supabase-admin";
import type {JadwalPublik, Peminjaman, Status} from "@/data/peminjaman";

// Daftar ruang aktif. Kalau jenis diisi, saring berdasarkan jenis.
export async function ambilRuang(jenis: Jenis | null): Promise<Ruang[]> {
  let query = supabase
    .from("ruang")
    .select("id, nama, jenis, kapasitas, lokasi, aktif")
    .eq("aktif", true)
    .order("nama");

  if (jenis) query = query.eq("jenis", jenis);
  const { data, error } = await query;
  if (error) throw new Error("Gagal memuat ruang: " + error.message);
  return data as Ruang[];
}

// Satu ruang berdasarkan id. Hasilnya null kalau id aneh atau tidak ada.
export async function ambilRuangById(id: number): Promise<Ruang | null> {
  if (!Number.isInteger(id) || id < 1) return null;
  const { data, error } = await supabase
    .from("ruang")
    .select("id, nama, jenis, kapasitas, lokasi, aktif")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Gagal memuat ruang: " + error.message);
  return data as Ruang | null;
}


// Jadwal yang sudah disetujui untuk satu ruang, tanpa kolom peminjam (data pribadi).
export async function ambilJadwalRuang(ruangId: number): Promise<JadwalPublik[]> {
    if (!Number.isInteger(ruangId) || ruangId < 1) return [];
    const { data, error } = await supabaseAdmin
      .from("peminjaman")
      .select("id, ruang_id, keperluan, tanggal, mulai, selesai")
      .eq("ruang_id", ruangId)
      .eq("status", "disetujui")
      .order("tanggal")
      .order("mulai");
  
    if (error) throw new Error("Gagal memuat jadwal: " + error.message);
    return data as unknown as JadwalPublik[];
}

// Semua jadwal yang sudah disetujui
export async function ambilJadwalDisetujui(): Promise<JadwalPublik[]> {
  const { data, error } = await supabaseAdmin
    .from("peminjaman")
    .select("id, ruang_id, keperluan, tanggal, mulai, selesai, ruang(nama)")
    .eq("status", "disetujui")
    .order("tanggal")
    .order("mulai");

  if (error) throw new Error("Gagal memuat jadwal: " + error.message);
  return data as unknown as JadwalPublik[];
}

// mengecek apakah ada jadwal disetujui di ruang dan tangga; yang sama dengan jam tunpnag tindih
export async function ambilBentrok(
  ruangId: number,
  tanggal: string,
  mulai: string,
  selesai: string
) : Promise<boolean> {
  const {data, error} = await supabaseAdmin
    .from("peminjaman")
    .select("id")
    .eq("ruang_id", ruangId)
    .eq("tanggal", tanggal)
    .eq("status", "disetujui")
    .lt("mulai", selesai)
    .gt("selesai", mulai)
    .limit(1);

    if (error) throw new Error("Gagal memeriksa bentrok:" + error.message);
    return (data ?? []).length > 0;
}

// cek status nomor dan peminjaman harus cocok
export async function cekStatus(
  id: number,
  nama: string
): Promise<Peminjaman | null> {
  if (!Number.isInteger(id) || id < 1) return null;
  const namaBersih = nama.trim().toLowerCase();
  if (namaBersih === "") return null;

  const {data, error} = await supabaseAdmin
    .from("peminjaman")
    .select(
      "id, ruang_id, peminjam, keperluan, tanggal, mulai, selesai, jumlah_orang, status, alasan_tolak, dibuat, ruang(nama)"
    )
    .eq("id", id)
    .maybeSingle();

    if (error) throw new Error("Gagal memeriksa status: " + error.message);
    if (!data) return null;

    if (data.peminjam.trim().toLowerCase() !== namaBersih) return null;
    return data as unknown as Peminjaman;
  
}


// seua perubahann beserta data proibadinya hanya boleh dipanggil dari halaman
export async function ambilSemuaPermohonan(
  status: Status | null
): Promise<Peminjaman[]> {
  let query = supabaseAdmin
    .from("peminjaman")
    .select(
      "id, ruang_id, peminjam, keperluan, tanggal, mulai, selesai, jumlah_orang, status, alasan_tolak, dibuat, ruang(nama)"
    )
    .order("id", { ascending: false});

  if (status) query = query.eq("status", status);

  const {data, error} = await query;
  if (error) throw new Error("Gagal memuat permohonan: " + error.message);
  return data as unknown as Peminjaman[];
}

// Semua ruang termasuk yang nonaktif, untuk halaman kelola ruang (admin).
export async function ambilSemuaRuang(): Promise<Ruang[]> {
  const { data, error } = await supabaseAdmin
    .from("ruang")
    .select("id, nama, jenis, kapasitas, lokasi, aktif")
    .order("nama");

  if (error) throw new Error("Gagal memuat ruang: " + error.message);
  return data as Ruang[];
}
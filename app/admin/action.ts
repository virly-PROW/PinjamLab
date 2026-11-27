"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/sesi";
import { ambilBentrok } from "@/data/ambil";
import { JENIS_RUANG } from "@/data/ruang";
import { supabaseAdmin } from "@/lib/supabase-admin";


export type HasilAksi = { galat: string; alasan?: string };

function segarkan(ruangId?: number) {
  revalidatePath("/admin");
  revalidatePath("/peminjaman");
  revalidatePath("/cek");
  if (ruangId) revalidatePath(`/ruang/${ruangId}`);
}

export async function setujui(
  _sebelum: HasilAksi,
  formData: FormData
): Promise<HasilAksi> {
  await requireAdmin(); 

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) return { galat: "Permohonan tidak valid." };

  // membaca ulang db
  const { data: p, error: galatBaca } = await supabaseAdmin
    .from("peminjaman")
    .select("id, ruang_id, tanggal, mulai, selesai, status")
    .eq("id", id)
    .maybeSingle();
  if (galatBaca) return { galat: "Gagal memuat permohonan. Coba lagi." };
  if (!p) return { galat: "Permohonan tidak ditemukan." };
  if (p.status !== "menunggu") return { galat: "Permohonan ini sudah diproses." };

  if (await ambilBentrok(p.ruang_id, p.tanggal, p.mulai, p.selesai)) {
    return { galat: "Bentrok dengan peminjaman lain yang sudah disetujui." };
  }

  const { data: berubah, error } = await supabaseAdmin
    .from("peminjaman")
    .update({ status: "disetujui" })
    .eq("id", id)
    .eq("status", "menunggu") // hanya yang masih menunggu
    .select("id");

  if (error) {
    // 23P01 = ditolak 
    return {
      galat:
        error.code === "23P01"
          ? "Bentrok dengan peminjaman lain yang sudah disetujui."
          : "Gagal menyetujui. Coba lagi.",
    };
  }
  if (!berubah || berubah.length === 0) {
    return { galat: "Permohonan ini sudah diproses." };
  }

  // Permohonan menunggu lain yang tumpang tindih otomatis ditolak
  await supabaseAdmin
    .from("peminjaman")
    .update({
      status: "ditolak",
      alasan_tolak: "Bentrok dengan peminjaman lain yang telah disetujui.",
    })
    .eq("ruang_id", p.ruang_id)
    .eq("tanggal", p.tanggal)
    .eq("status", "menunggu")
    .neq("id", id)
    .lt("mulai", p.selesai)
    .gt("selesai", p.mulai);

  segarkan(p.ruang_id);
  return { galat: "" };
}

export async function tolak(
  _sebelum: HasilAksi,
  formData: FormData
): Promise<HasilAksi> {
  await requireAdmin(); 

  const id = Number(formData.get("id"));
  const alasan = String(formData.get("alasan") ?? "").trim();

  if (!Number.isInteger(id) || id < 1) return { galat: "Permohonan tidak valid.", alasan };
  if (alasan.length < 5) return { galat: "Alasan penolakan minimal 5 huruf.", alasan };
  if (alasan.length > 200) return { galat: "Alasan penolakan maksimal 200 huruf.", alasan };

  const { data: berubah, error } = await supabaseAdmin
    .from("peminjaman")
    .update({ status: "ditolak", alasan_tolak: alasan })
    .eq("id", id)
    .eq("status", "menunggu")
    .select("id, ruang_id");

  if (error) return { galat: "Gagal menolak. Coba lagi.", alasan };
  if (!berubah || berubah.length === 0) {
    return { galat: "Permohonan ini sudah diproses.", alasan };
  }

  segarkan(berubah[0].ruang_id);
  return { galat: "" };
}

// RUANG

export type HasilRuang = {
  pesan: string;
  galat: Partial<Record<"nama" | "jenis" | "kapasitas" | "lokasi", string>>;
  isian: { nama: string; jenis: string; kapasitas: string; lokasi: string };
};

function segarkanRuang() {
  revalidatePath("/");
  revalidatePath("/ruang");
  revalidatePath("/ruang/[id]", "page");
  revalidatePath("/admin/ruang");
}

function kembali(jenis: "info" | "galat", pesan: string): never {
  redirect(`/admin/ruang?${jenis}=${encodeURIComponent(pesan)}`);
}

export async function tambahRuang(
  _sebelum: HasilRuang,
  formData: FormData
): Promise<HasilRuang> {
  await requireAdmin();

  const teks = (kunci: string) => String(formData.get(kunci) ?? "").trim();
  const isian = {
    nama: teks("nama"),
    jenis: teks("jenis"),
    kapasitas: teks("kapasitas"),
    lokasi: teks("lokasi"),
  };
  const kapasitas = Number(isian.kapasitas);
  const galat: HasilRuang["galat"] = {};

  if (isian.nama.length < 3 || isian.nama.length > 40)
    galat.nama = "Nama ruang 3 sampai 40 huruf.";
  if (!(JENIS_RUANG as readonly string[]).includes(isian.jenis))
    galat.jenis = "Pilih jenis ruang.";
  if (!Number.isInteger(kapasitas) || kapasitas < 1 || kapasitas > 1000)
    galat.kapasitas = "Kapasitas 1 sampai 1000 (bilangan bulat).";
  if (isian.lokasi.length < 2 || isian.lokasi.length > 60)
    galat.lokasi = "Lokasi 2 sampai 60 huruf.";

  if (Object.keys(galat).length > 0) {
    return { pesan: "Periksa lagi isian yang merah.", galat, isian };
  }

  // aktif tidak dikiriM
  const { error } = await supabaseAdmin.from("ruang").insert({
    nama: isian.nama,
    jenis: isian.jenis,
    kapasitas,
    lokasi: isian.lokasi,
  });

  if (error) {
    // 23505 = melanggar UNIK 
    if (error.code === "23505") {
      return { pesan: "", galat: { nama: "Nama ruang sudah dipakai." }, isian };
    }
    return { pesan: "Ruang gagal ditambahkan. Coba lagi.", galat: {}, isian };
  }

  segarkanRuang();
  kembali("info", "Ruang ditambahkan.");
}

export async function ubahAktifRuang(formData: FormData) {
  await requireAdmin(); 

  const id = Number(formData.get("id"));
  const aktif = formData.get("aktif") === "true";
  if (!Number.isInteger(id) || id < 1) kembali("galat", "Ruang tidak valid.");

  const { data, error } = await supabaseAdmin
    .from("ruang")
    .update({ aktif })
    .eq("id", id)
    .select("id");

  if (error) kembali("galat", "Gagal mengubah status ruang. Coba lagi.");
  if (!data || data.length === 0) kembali("galat", "Ruang tidak ditemukan.");

  segarkanRuang();
  kembali("info", aktif ? "Ruang diaktifkan." : "Ruang dinonaktifkan.");
}

export async function hapusRuang(formData: FormData) {
  await requireAdmin();

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id < 1) kembali("galat", "Ruang tidak valid.");

  const { data, error } = await supabaseAdmin
    .from("ruang")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    // 23503 = masih dipakai tabel lain 
    if (error.code === "23503") {
      kembali("galat", "Ruang ini pernah dipinjam, jadi tidak bisa dihapus. Nonaktifkan saja.");
    }
    kembali("galat", "Gagal menghapus ruang. Coba lagi.");
  }
  if (!data || data.length === 0) kembali("galat", "Ruang tidak ditemukan.");

  segarkanRuang();
  kembali("info", "Ruang dihapus.");
}
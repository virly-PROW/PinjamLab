"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sandiBenar, buatSesi, hapusSesi } from "@/lib/sesi";

export type HasilLogin = { galat: string };

const BATAS_GAGAL = 5;
const MASA_KUNCI_MS = 60_000; // 1 menit

export async function login(
  _sebelum: HasilLogin,
  formData: FormData
): Promise<HasilLogin> {
  const sandi = String(formData.get("sandi") ?? "");
  const toples = await cookies();

  // format cookie "gagal": "jumlah.waktuBuka"
  const [jumlahStr, bukaStr] = (toples.get("gagal")?.value ?? "0.0").split(".");
  const jumlah = Number(jumlahStr) || 0;
  const buka = Number(bukaStr) || 0;

  // masih dalam masa kunci
  if (buka > Date.now()) {
    const sisa = Math.ceil((buka - Date.now()) / 1000);
    return { galat: `Terlalu banyak percobaan. Coba lagi ${sisa} detik lagi.` };
  }

  if (!sandiBenar(sandi)) {
    const baru = jumlah + 1;
    const terkunci = baru >= BATAS_GAGAL;
    const waktuBuka = terkunci ? Date.now() + MASA_KUNCI_MS : 0;

    toples.set("gagal", `${terkunci ? 0 : baru}.${waktuBuka}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 5,
    });

    return {
      galat: terkunci
        ? "Terlalu banyak percobaan. Coba lagi 1 menit lagi."
        : `Sandi salah. Sisa percobaan: ${BATAS_GAGAL - baru}.`,
    };
  }

  // berhasil: hapus hitungan gagal, buat sesi
  toples.delete("gagal");
  await buatSesi();
  redirect("/admin");
}

export async function logout() {
  await hapusSesi();
  redirect("/login");
}
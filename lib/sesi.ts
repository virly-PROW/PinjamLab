import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const NAMA_COOKIE = "sesi_admin";
const MASA_DETIK = 60 * 60 * 8;

function rahasia() {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error("SESSION_SECRET belum diisi di .env.local");
  return s;
}

// tanda tangan HMAC
function tandatangani(isi: string) {
  return createHmac("sha256", rahasia()).update(isi).digest("hex");
}

// membandingkan dua teks dengan waktu yang tetap
function samaPersis(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function sandiBenar(masukan: string) {
  const asli = process.env.ADMIN_PASSWORD;
  if (!asli) throw new Error("ADMIN_PASSWORD belum diisi di .env.local");
  return samaPersis(masukan, asli);
}

export async function buatSesi() {
  const kedaluwarsa = Math.floor(Date.now() / 1000) + MASA_DETIK;
  const isi = `admin.${kedaluwarsa}`;
  const nilai = `${isi}.${tandatangani(isi)}`;

  (await cookies()).set(NAMA_COOKIE, nilai, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MASA_DETIK,
  });
}

export async function sesiValid() {
  const nilai = (await cookies()).get(NAMA_COOKIE)?.value;
  if (!nilai) return false;
  const bagian = nilai.split(".");
  if (bagian.length !== 3) return false;
  const [peran, kedaluwarsa, tanda] = bagian;

  if (peran !== "admin") return false;
  if (!samaPersis(tanda, tandatangani(`${peran}.${kedaluwarsa}`))) return false;
  return Number(kedaluwarsa) > Math.floor(Date.now() / 1000);
}

export async function hapusSesi() {
  (await cookies()).delete(NAMA_COOKIE);
}

// Dipanggil di AWAL setiap halaman admin DAN setiap action admin.
export async function requireAdmin() {
  if (!(await sesiValid())) redirect("/login");
}
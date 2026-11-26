import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { sesiValid } from "@/lib/sesi";
import FormLogin from "@/components/FormLogin";

export const metadata: Metadata = { title: "Login Admin" };

export default async function HalamanLogin() {
  // Sudah login: tidak perlu melihat form lagi
  if (await sesiValid()) redirect("/admin");

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-2 text-2xl font-bold">Login Admin</h1>
      <p className="mb-4 text-sm text-slate-500">
        Halaman ini khusus pengelola peminjaman.
      </p>
      <FormLogin />
    </div>
  );
}
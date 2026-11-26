"use client";
import { useActionState } from "react";
import { login, type HasilLogin } from "@/app/login/action";

export default function FormLogin() {
  const awal: HasilLogin = { galat: "" };
  const [hasil, kirim, sedangKirim] = useActionState(login, awal);

  return (
    <form action={kirim} className="space-y-3 rounded-xl border bg-white p-6">
      <div>
        <label className="mb-1 block text-sm font-medium">Sandi admin</label>
        <input
          name="sandi"
          type="password"
          className="block w-full rounded border px-3 py-2"
        />
      </div>

      {hasil.galat && <p className="text-sm text-red-600">{hasil.galat}</p>}

      <button
        disabled={sedangKirim}
        className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
      >
        {sedangKirim ? "Memeriksa..." : "Masuk"}
      </button>
    </form>
  );
}
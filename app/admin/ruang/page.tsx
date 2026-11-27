import type { Metadata } from "next";
import { requireAdmin } from "@/lib/sesi";
import { ambilSemuaRuang } from "@/data/ambil";
import { ubahAktifRuang, hapusRuang } from "@/app/admin/action";
import FormTambahRuang from "@/components/FormTambahRuang";

export const metadata: Metadata = { title: "Kelola Ruang" };

export default async function HalamanAdminRuang({
  searchParams,
}: PageProps<"/admin/ruang">) {
  await requireAdmin(); // baris pertama

  const { info, galat } = await searchParams;
  const daftar = await ambilSemuaRuang();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Kelola Ruang</h1>

      {typeof info === "string" && (
        <p className="mb-3 rounded bg-green-100 px-3 py-2 text-green-800">{info}</p>
      )}
      {typeof galat === "string" && (
        <p className="mb-3 rounded bg-red-100 px-3 py-2 text-red-800">{galat}</p>
      )}

      <FormTambahRuang />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Ruang</th>
              <th className="px-4 py-3 font-semibold">Jenis</th>
              <th className="px-4 py-3 font-semibold">Kapasitas</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {daftar.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3">
                  <p className="font-medium">{r.nama}</p>
                  <p className="text-slate-500">{r.lokasi}</p>
                </td>
                <td className="px-4 py-3 capitalize">{r.jenis}</td>
                <td className="px-4 py-3">{r.kapasitas}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      "rounded px-2 py-0.5 text-xs font-bold uppercase " +
                      (r.aktif
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-200 text-slate-600")
                    }
                  >
                    {r.aktif ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <form action={ubahAktifRuang}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="aktif" value={String(!r.aktif)} />
                      <button className="rounded border px-3 py-1 text-xs hover:border-blue-500">
                        {r.aktif ? "Nonaktifkan" : "Aktifkan"}
                      </button>
                    </form>
                    <form action={hapusRuang}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50">
                        Hapus
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
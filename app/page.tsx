import { supabase } from "@/lib/supabase";

export default async function Home() {
  const { data, error } = await supabase
    .from("ruang")
    .select("id, nama, jenis, aktif");

  if (error) return <p>Gagal memuat data.</p>;

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">PinjamLab</h1>
      <ul className="mt-4 list-disc pl-6">
        {data.map((r) => (
          <li key={r.id}>
            {r.nama} ({r.jenis}) {r.aktif ? "" : "- nonaktif"}
          </li>
        ))}
      </ul>
    </main>
  );
}
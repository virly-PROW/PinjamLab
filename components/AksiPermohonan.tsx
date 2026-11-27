"use client";
import { useActionState, useRef } from "react";
import { setujui, tolak, type HasilAksi } from "@/app/admin/action";

export default function AksiPermohonan({ id }: { id: number }) {
  const awal: HasilAksi = { galat: "", alasan: "" };
  const [hasilSetuju, kirimSetuju, prosesSetuju] = useActionState(setujui, awal);
  const [hasilTolak, kirimTolak, prosesTolak] = useActionState(tolak, awal);
  const dialog = useRef<HTMLDialogElement>(null);
  const sibuk = prosesSetuju || prosesTolak;

  return (
    <div className="min-w-32 space-y-2">
      <div className="flex gap-2">
        <form action={kirimSetuju}>
          <input type="hidden" name="id" value={id} />
          <button
            disabled={sibuk}
            className="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700 disabled:opacity-50"
          >
            {prosesSetuju ? "Memproses..." : "Setujui"}
          </button>
        </form>

        <button
          type="button"
          disabled={sibuk}
          onClick={() => dialog.current?.showModal()}
          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
        >
          Tolak
        </button>
      </div>

      {hasilSetuju.galat && (
        <p className="text-xs text-red-600">{hasilSetuju.galat}</p>
      )}

      <dialog
        ref={dialog}
        className="m-auto w-full max-w-md rounded-xl p-6 backdrop:bg-black/40"
      >
        <form action={kirimTolak} className="space-y-3">
          <h2 className="text-lg font-semibold">Tolak permohonan #{id}</h2>
          <p className="text-sm text-slate-500">
            Tulis alasan penolakan. Peminjam akan membacanya di halaman cek status.
          </p>

          <input type="hidden" name="id" value={id} />
          <textarea
            name="alasan"
            rows={3}
            defaultValue={hasilTolak.alasan}
            placeholder="Contoh: Ruang dipakai untuk ujian pada jam tersebut."
            className="block w-full rounded border px-3 py-2 text-sm"
          />

          {hasilTolak.galat && (
            <p className="text-sm text-red-600">{hasilTolak.galat}</p>
          )}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="rounded border px-4 py-2 text-sm hover:border-slate-500"
            >
              Batal
            </button>
            <button
              disabled={prosesTolak}
              className="rounded bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50"
            >
              {prosesTolak ? "Memproses..." : "Tolak permohonan"}
            </button>
          </div>
        </form>
      </dialog>
    </div>
  );
}
export type Ruang = {
    id: number,
    nama: string,
    jenis: "lab" | "kelas" | "aula";
    kapasitas: number;
    lokasi: string;
    aktif: boolean
}

export const JENIS_RUANG = ["lab", "kelas", "aula"] as const;
export type Jenis = (typeof JENIS_RUANG)[number];

// isi url bisa apa saja hanya terima jenis yang dikenal, selain itu dinaggap "semua"
export function bacaJenis(nilai: string | string[] | undefined): Jenis | null {
    return typeof nilai === "string" &&
      (JENIS_RUANG as readonly string[]).includes(nilai)
      ? (nilai as Jenis)
      : null;
  }
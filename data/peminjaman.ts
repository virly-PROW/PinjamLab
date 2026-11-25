export const STATUS = ["menunggu", "disetujui", "ditolak"] as const;
export type Status = (typeof STATUS)[number];

// versi publik: tanpa peminjam dipakai di ruang/id
export type JadwalPublik = {
    id: number;
    ruang_id: number;
    keperluan: string;
    tanggal: string;
    mulai: string;
    selesai: string;
    ruang: { nama: string} | null; // hasil join 
};

// versi lengkap
export type Peminjaman = {
    id: number;
    ruang_id: number;
    peminjam: string;
    keperluan: string;
    tanggal: string;
    mulai: string;
    selesai: string;
    jumlah_orang: number;
    status: Status;
    alasan_tolak: string | null;
    dibuat: string;
    ruang: { nama: string} | null;
};

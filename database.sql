-- ==========================================================
-- PinjamLab - skrip pembuatan basis data
-- Jalankan sekali dari atas sampai bawah di SQL Editor Supabase.
-- Semua data contoh bersifat fiktif.
-- ==========================================================


-- ============ 1. TABEL ============

create table ruang (
  id        bigint generated always as identity primary key,
  nama      text not null unique
            check (char_length(nama) between 3 and 40),
  jenis     text not null
            check (jenis in ('lab', 'kelas', 'aula')),
  kapasitas int  not null check (kapasitas > 0),
  lokasi    text not null,
  aktif     boolean not null default true
);

create table peminjaman (
  id           bigint generated always as identity primary key,
  ruang_id     bigint not null references ruang(id) on delete restrict,
  peminjam     text not null
               check (char_length(peminjam) between 3 and 40),
  keperluan    text not null
               check (char_length(keperluan) between 5 and 120),
  tanggal      date not null,
  mulai        time not null,
  selesai      time not null,
  jumlah_orang int  not null check (jumlah_orang > 0),
  status       text not null default 'menunggu'
               check (status in ('menunggu', 'disetujui', 'ditolak')),
  alasan_tolak text,
  dibuat       timestamptz not null default now()
);


-- ============ 2. CONSTRAINT ATURAN BISNIS ============
-- Dijaga basis data walaupun aplikasi sudah memeriksanya.

alter table peminjaman
  add constraint cek_jam_operasional check (mulai >= '07:00' and selesai <= '17:00'),
  add constraint cek_selesai_setelah_mulai check (selesai > mulai),
  add constraint cek_durasi_maks check (selesai - mulai <= interval '3 hours'),
  add constraint cek_alasan_tolak check (
    status <> 'ditolak' or coalesce(char_length(alasan_tolak), 0) >= 5
  );

-- Dua jadwal berstatus 'disetujui' tidak boleh bentrok (ruang dan tanggal sama,
-- jam tumpang tindih). Rentang [) membuat jam menempel (11:00 - 11:00) tetap boleh.
-- Permohonan 'menunggu' boleh saling bentrok.
create extension if not exists btree_gist;

alter table peminjaman
  add constraint tidak_bentrok exclude using gist (
    ruang_id with =,
    tanggal  with =,
    tsrange(tanggal + mulai, tanggal + selesai, '[)') with &&
  ) where (status = 'disetujui');


-- ============ 3. DATA CONTOH (FIKTIF) ============

insert into ruang (nama, jenis, kapasitas, lokasi, aktif) values
  ('Lab Komputer 5', 'lab',   36,  'Kampus 3 Lantai 4', true),
  ('Lab Otomotif',   'lab',   36,  'Kampus 3',          true),
  ('Lab Kuliner',    'lab',   30,  'Kampus 3',          true),
  ('Ruang 3.1.10',   'kelas', 36,  'Kampus 3 Lantai 1', true),
  ('Aula Kampus 3',  'aula',  250, 'Kampus 3 Lantai 3', true),
  ('Lab Busana',     'lab',   30,  'Kampus 3',          false);

insert into peminjaman
  (ruang_id, peminjam, keperluan, tanggal, mulai, selesai, jumlah_orang, status, alasan_tolak) values
  (1, 'Raka Aditya',     'Praktik proyek web XII-RPL1',   '2026-11-24', '07:00', '09:00', 34,  'disetujui', null),
  (1, 'Nadia Safitri',   'Remedial Informatika XI-RPL2',  '2026-11-24', '09:00', '11:00', 28,  'disetujui', null),
  (1, 'Dimas Prakoso',   'Praktik desain X-DKV1',         '2026-11-24', '08:00', '10:00', 30,  'menunggu',  null),
  (2, 'Bayu Hermawan',   'Praktik tune up XII-TKR2',      '2026-11-25', '07:00', '10:00', 32,  'disetujui', null),
  (2, 'Fikri Ramadhan',  'Uji kompetensi XI-TKR1',        '2026-11-25', '09:00', '11:00', 30,  'ditolak',
      'Lab Otomotif sudah dipakai XII-TKR2 pada jam tersebut.'),
  (3, 'Putri Anggraini', 'Praktik kuliner X-KUL',         '2026-11-26', '08:00', '11:00', 26,  'menunggu',  null),
  (3, 'Rizky Maulana',   'Latihan lomba masak XI-KUL',    '2026-11-26', '09:00', '12:00', 20,  'menunggu',  null),
  (5, 'Salsa Wulandari', 'Gladi resik pentas seni kelas X, XI, XII', '2026-11-27', '07:00', '10:00', 200, 'disetujui', null);


-- ============ 4. IZIN DAN KEAMANAN ============
-- Lapis 1 (izin): kunci publik hanya boleh membaca ruang dan tidak boleh
--                 menyentuh peminjaman.
-- Lapis 2 (RLS): aturan per baris. Ruang boleh dibaca siapa saja;
--                peminjaman tanpa aturan = tertutup.
-- Kunci rahasia (service_role) milik server, tidak terpengaruh RLS.

grant usage on schema public to anon, authenticated, service_role;
grant all on public.ruang, public.peminjaman to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

revoke all on public.peminjaman from anon, authenticated;
revoke insert, update, delete on public.ruang from anon, authenticated;

alter table public.ruang enable row level security;
alter table public.peminjaman enable row level security;

create policy "ruang boleh dibaca siapa saja"
  on public.ruang
  for select
  to anon, authenticated
  using (true);
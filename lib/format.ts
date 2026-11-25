// "2026-11-24" -> "Selasa, 24 November 2026"
export function formatTanggal(tanggal: string) {
    return new Date(tanggal + "T00:00:00").toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }
  
  // "08:00:00" -> "08:00"
  export function formatJam(jam: string) {
    return jam.slice(0, 5);
  }
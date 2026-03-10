export interface Santri {
  id: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  kelas: number;
  kelasHalaqah: string;
  nisn: string;
  ustadzPengampu: string;
  orangTua: string;
  waOrangTua: string;
}

export interface Ustadz {
  id: string;
  nama: string;
  jenisKelamin: 'L' | 'P';
  noWa: string;
  asalPondok: string;
}

export type Kehadiran = 'hadir' | 'izin' | 'terlambat' | 'alpha' | 'sakit';

export interface SetoranEntry {
  id: string;
  santriId: string;
  tanggal: string; // ISO date
  tipe: 'sabaq' | 'sabqi' | 'manzil';
  juz: number;
  surat: string;
  ayatMulai: number;
  ayatSelesai: number;
  jumlahBaris: number;
  catatan: string;
  kehadiran: Kehadiran;
  nilaiKelancaran: number;
}

export interface PesantrenSettings {
  nama: string;
  logo: string;
  theme: string;
}

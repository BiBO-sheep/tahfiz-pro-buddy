import { Santri, Ustadz, SetoranEntry, Kehadiran } from '@/types';
import { daftarSurat } from './quran';

// Seed-based random for consistency
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const rand = seededRandom(42);

const namaLaki = [
  "Ahmad Fauzan", "Muhammad Rizki", "Abdullah Hasan", "Umar Faruq", "Ali Akbar",
  "Bilal Ibrahim", "Hamza Yusuf", "Idris Mahmud", "Khalid Walid", "Zaid Hakim",
  "Anas Malik", "Haris Fadillah", "Naufal Rafif", "Dzaky Pratama", "Syafiq Aiman",
  "Rafi Athallah", "Faris Maulana", "Ihsan Ramadhan", "Arkan Zufar", "Hafidz Nugroho",
  "Taufiq Hidayat", "Ridwan Kamil", "Salman Harun", "Yasin Abdurrahman", "Daud Iskandar",
  "Luqman Hakim", "Mikail Putra", "Nabil Fikri", "Qais Mujahid", "Rayhan Akmal",
  "Sulthan Aziz", "Tariq Ziyad", "Uwais Qarni", "Wafi Irsyad", "Zakaria Arifin"
];

const namaPerempuan = [
  "Aisyah Putri", "Fatimah Zahra", "Khadijah Nur", "Maryam Salsabila", "Hafshah Amira",
  "Zainab Rahma", "Ruqayyah Husna", "Safiyyah Naila", "Halimah Dewi", "Asma Wardah",
  "Sumayyah Fitri", "Aminah Lestari", "Raihana Syifa", "Najwa Azzahra", "Layla Khairunnisa"
];

const namaUstadz = [
  "Ustadz Ahmad Ridwan", "Ustadz Muhammad Soleh", "Ustadzah Fatimah Hana",
  "Ustadz Hasan Basri", "Ustadz Yusuf Mansur"
];

const asalPondok = [
  "PP Gontor", "PP Lirboyo", "PP Tebuireng", "PP Darussalam", "PP Al-Amin"
];

const kelasHalaqahList = ["Halaqah A", "Halaqah B", "Halaqah C", "Halaqah D", "Halaqah E"];

// Generate Ustadz
export const dummyUstadz: Ustadz[] = namaUstadz.map((nama, i) => ({
  id: `ustadz-${i + 1}`,
  nama,
  jenisKelamin: nama.includes('Ustadzah') ? 'P' as const : 'L' as const,
  noWa: `08${String(1200000000 + Math.floor(rand() * 900000000)).slice(0, 10)}`,
  asalPondok: asalPondok[i],
}));

// Generate 50 Santri
export const dummySantri: Santri[] = [];
for (let i = 0; i < 50; i++) {
  const isPerempuan = i >= 35;
  const namaPool = isPerempuan ? namaPerempuan : namaLaki;
  const nama = namaPool[i % namaPool.length] + (i >= namaPool.length ? ` ${String.fromCharCode(65 + Math.floor(i / namaPool.length))}` : '');
  const kelas = [7, 8, 9, 10, 11, 12][Math.floor(rand() * 6)];
  const ustadzIdx = Math.floor(rand() * dummyUstadz.length);

  dummySantri.push({
    id: `santri-${i + 1}`,
    nama,
    jenisKelamin: isPerempuan ? 'P' : 'L',
    kelas,
    kelasHalaqah: kelasHalaqahList[ustadzIdx],
    nisn: `00${String(30000000 + i).padStart(8, '0')}`,
    ustadzPengampu: dummyUstadz[ustadzIdx].nama,
    orangTua: `Bp/Ibu ${nama.split(' ')[0]}`,
    waOrangTua: `08${String(1300000000 + i * 1111111).slice(0, 10)}`,
  });
}

// Generate setoran data
function generateSetoran(): SetoranEntry[] {
  const entries: SetoranEntry[] = [];
  const today = new Date();
  const kehadiranOptions: Kehadiran[] = ['hadir', 'hadir', 'hadir', 'hadir', 'izin', 'terlambat', 'alpha', 'sakit'];
  const tipeOptions: ('sabaq' | 'sabqi' | 'manzil')[] = ['sabaq', 'sabqi', 'manzil'];

  dummySantri.forEach((santri, si) => {
    // Each santri has different progress: 1-25 juz memorized
    const maxJuz = Math.max(1, Math.min(25, Math.floor(rand() * 26)));
    const startDate = new Date(today);
    startDate.setFullYear(startDate.getFullYear() - 1);

    let currentJuz = 1;
    let dayCounter = 0;
    const totalDays = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let d = 0; d < totalDays && currentJuz <= maxJuz; d++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + d);

      // Skip weekends randomly
      if (date.getDay() === 5 && rand() > 0.3) continue; // Friday sometimes off
      if (date.getDay() === 0) continue; // Sunday off

      // Skip some days randomly
      if (rand() > 0.75) continue;

      const suratInJuz = daftarSurat.filter(s => s.juz.includes(currentJuz));
      if (suratInJuz.length === 0) continue;

      // Generate 1-3 entries per day (sabaq, sabqi, manzil)
      const numEntries = Math.min(3, 1 + Math.floor(rand() * 3));
      for (let e = 0; e < numEntries; e++) {
        const tipe = tipeOptions[e % 3];
        const targetJuz = tipe === 'sabaq' ? currentJuz :
          tipe === 'sabqi' ? Math.max(1, currentJuz - 1) :
            Math.max(1, Math.floor(rand() * currentJuz));

        const suratForJuz = daftarSurat.filter(s => s.juz.includes(targetJuz));
        if (suratForJuz.length === 0) continue;
        const surat = suratForJuz[Math.floor(rand() * suratForJuz.length)];
        const ayatMulai = 1 + Math.floor(rand() * Math.max(1, surat.jumlahAyat - 10));
        const ayatSelesai = Math.min(surat.jumlahAyat, ayatMulai + 5 + Math.floor(rand() * 15));
        const jumlahBaris = 3 + Math.floor(rand() * 12);
        const kehadiran = kehadiranOptions[Math.floor(rand() * kehadiranOptions.length)];
        const errors = Math.floor(rand() * 6);
        const nilaiKelancaran = Math.max(60, 100 - errors * 5);

        entries.push({
          id: `setoran-${si}-${d}-${e}`,
          santriId: santri.id,
          tanggal: date.toISOString().split('T')[0],
          tipe,
          juz: targetJuz,
          surat: surat.nama,
          ayatMulai,
          ayatSelesai,
          jumlahBaris,
          catatan: kehadiran === 'hadir' ? (rand() > 0.7 ? 'Perlu pengulangan' : '') : '',
          kehadiran,
          nilaiKelancaran: kehadiran === 'hadir' ? nilaiKelancaran : 0,
        });
      }

      dayCounter++;
      // Progress to next juz roughly every 15 days
      if (dayCounter > 0 && dayCounter % 15 === 0 && currentJuz < maxJuz) {
        currentJuz++;
      }
    }
  });

  return entries;
}

export const dummySetoran: SetoranEntry[] = generateSetoran();

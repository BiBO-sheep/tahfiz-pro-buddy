import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const COLORS = {
  sabaq: '#B38A5F',
  sabqi: '#6F83A5',
  manzil: '#8A817C',
  primary: '#4A6C55',
};

export default function Dashboard() {
  const { santriList, ustadzList, setoranList } = useAppContext();

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  const getMonthSetoran = (month: number, year: number) =>
    setoranList.filter(s => {
      const d = new Date(s.tanggal);
      return d.getMonth() === month && d.getFullYear() === year;
    });

  const currentMonthSetoran = getMonthSetoran(currentMonth, currentYear);
  const prevMonthSetoran = getMonthSetoran(prevMonth, prevYear);

  // Stats
  const totalBaris = setoranList.reduce((sum, s) => sum + s.jumlahBaris, 0);
  const uniqueHalaqah = [...new Set(santriList.map(s => s.kelasHalaqah))];

  // Santri progress
  const santriProgress = useMemo(() => {
    return santriList.map(santri => {
      const entries = setoranList.filter(s => s.santriId === santri.id && s.kehadiran === 'hadir');
      const totalBaris = entries.reduce((sum, e) => sum + e.jumlahBaris, 0);
      const totalHalaman = Math.floor(totalBaris / 15);
      const totalJuz = Math.floor(totalHalaman / 20);
      const sisaHalaman = totalHalaman % 20;
      const uniqueJuz = [...new Set(entries.map(e => e.juz))];
      return { ...santri, totalBaris, totalHalaman, totalJuz, sisaHalaman, uniqueJuz };
    }).sort((a, b) => b.totalBaris - a.totalBaris);
  }, [santriList, setoranList]);

  const top10 = santriProgress.slice(0, 10);
  const bottom10 = [...santriProgress].sort((a, b) => a.totalBaris - b.totalBaris).slice(0, 10);

  // Distribution
  const distribusi = useMemo(() => {
    const ranges = [
      { label: '0-1 Juz', min: 0, max: 1 },
      { label: '2-5 Juz', min: 2, max: 5 },
      { label: '5-10 Juz', min: 5, max: 10 },
      { label: '10-20 Juz', min: 10, max: 20 },
      { label: '20-30 Juz', min: 20, max: 30 },
    ];
    return ranges.map(r => ({
      name: r.label,
      value: santriProgress.filter(s => s.totalJuz >= r.min && s.totalJuz <= r.max).length,
    }));
  }, [santriProgress]);

  // Daily stats for current & prev month
  const getDailyStats = (entries: typeof setoranList) => {
    const days: Record<number, { sabaq: number; sabqi: number; manzil: number }> = {};
    for (let d = 1; d <= 31; d++) days[d] = { sabaq: 0, sabqi: 0, manzil: 0 };
    entries.forEach(e => {
      const day = new Date(e.tanggal).getDate();
      if (days[day]) days[day][e.tipe] += e.jumlahBaris;
    });
    return Object.entries(days).map(([d, v]) => ({ day: Number(d), ...v }));
  };

  const currentDailyStats = getDailyStats(currentMonthSetoran);
  const prevDailyStats = getDailyStats(prevMonthSetoran);

  // Nilai distribution
  const getNilaiDistribution = (entries: typeof setoranList) => {
    const ranges = [
      { label: '60-70', min: 60, max: 70 },
      { label: '71-80', min: 71, max: 80 },
      { label: '81-90', min: 81, max: 90 },
      { label: '91-100', min: 91, max: 100 },
    ];
    return ranges.map(r => ({
      name: r.label,
      current: entries.filter(e => e.nilaiKelancaran >= r.min && e.nilaiKelancaran <= r.max).length,
    }));
  };

  // Kelas stats
  const kelasStats = useMemo(() => {
    const kelas = [7, 8, 9, 10, 11, 12];
    return kelas.map(k => {
      const santriKelas = santriProgress.filter(s => s.kelas === k);
      const avgBaris = santriKelas.length > 0 ? Math.round(santriKelas.reduce((s, x) => s + x.totalBaris, 0) / santriKelas.length) : 0;
      return { name: `Kelas ${k}`, jumlah: santriKelas.length, avgBaris };
    });
  }, [santriProgress]);

  // Pie chart for target
  const targetPie = useMemo(() => {
    const achieved = santriProgress.filter(s => s.totalJuz >= 30).length;
    const progress = santriProgress.filter(s => s.totalJuz > 0 && s.totalJuz < 30).length;
    const notStarted = santriProgress.filter(s => s.totalJuz === 0).length;
    return [
      { name: 'Tercapai (30 Juz)', value: achieved },
      { name: 'Dalam Proses', value: progress },
      { name: 'Belum Mulai', value: notStarted },
    ];
  }, [santriProgress]);

  const PIE_COLORS = [COLORS.primary, COLORS.sabaq, COLORS.manzil];

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

      {/* 4 Summary Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-md p-4 bg-primary text-primary-foreground">
          <p className="text-sm opacity-80">Total Santri</p>
          <p className="text-3xl font-bold font-heading">{santriList.length}</p>
        </div>
        <div className="rounded-md p-4 bg-sabaq text-primary-foreground">
          <p className="text-sm opacity-80">Total Ustadz</p>
          <p className="text-3xl font-bold font-heading">{ustadzList.length}</p>
        </div>
        <div className="rounded-md p-4 bg-sabqi text-primary-foreground">
          <p className="text-sm opacity-80">Kelas Halaqah</p>
          <p className="text-3xl font-bold font-heading">{uniqueHalaqah.length}</p>
        </div>
        <div className="rounded-md p-4 bg-manzil text-primary-foreground">
          <p className="text-sm opacity-80">Total Baris</p>
          <p className="text-3xl font-bold font-heading">{totalBaris.toLocaleString()}</p>
        </div>
      </div>

      {/* Top 10 & Bottom 10 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Top 10 Hafalan Terbaik</h2>
          <div className="space-y-2">
            {top10.map((s, i) => (
              <div key={s.id} className="flex justify-between items-center text-sm border-b border-border pb-1">
                <span className="font-medium">{i + 1}. {s.nama}</span>
                <span className="text-muted-foreground">{s.totalJuz} juz, {s.sisaHalaman} halaman</span>
              </div>
            ))}
          </div>
        </div>
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Top 10 Butuh Perhatian</h2>
          <div className="space-y-2">
            {bottom10.map((s, i) => (
              <div key={s.id} className="flex justify-between items-center text-sm border-b border-border pb-1">
                <span className="font-medium">{i + 1}. {s.nama}</span>
                <span className="text-muted-foreground">{s.totalJuz} juz, {s.sisaHalaman} halaman</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Statistik Setoran Harian — {monthNames[currentMonth]}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={currentDailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sabaq" fill={COLORS.sabaq} name="Sabaq" />
              <Bar dataKey="sabqi" fill={COLORS.sabqi} name="Sabqi" />
              <Bar dataKey="manzil" fill={COLORS.manzil} name="Manzil" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Statistik Setoran Harian — {monthNames[prevMonth]}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={prevDailyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sabaq" fill={COLORS.sabaq} name="Sabaq" />
              <Bar dataKey="sabqi" fill={COLORS.sabqi} name="Sabqi" />
              <Bar dataKey="manzil" fill={COLORS.manzil} name="Manzil" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Distribusi Hafalan Santri</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={distribusi}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.primary} name="Jumlah Santri" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Target Pencapaian</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={targetPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                {targetPie.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 3 */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Capaian Tahfidz per Kelas</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={kelasStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="avgBaris" fill={COLORS.sabqi} name="Rata-rata Baris" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="border border-border rounded-md p-4">
          <h2 className="font-heading text-lg font-bold mb-3">Distribusi Nilai — {monthNames[currentMonth]}</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={getNilaiDistribution(currentMonthSetoran)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Bar dataKey="current" fill={COLORS.primary} name="Jumlah" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

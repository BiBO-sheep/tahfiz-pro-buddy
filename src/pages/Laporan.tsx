import { useState, useMemo } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { JuzProgressGrid } from '@/components/JuzProgressGrid';
import { Download } from 'lucide-react';

export default function Laporan() {
  const { santriList, setoranList, ustadzList } = useAppContext();
  const [selectedSantri, setSelectedSantri] = useState<string>(santriList[0]?.id || '');
  const [filterMonth, setFilterMonth] = useState<number>(new Date().getMonth());
  const [filterYear] = useState<number>(new Date().getFullYear());

  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  const santri = santriList.find(s => s.id === selectedSantri);

  const allSantriEntries = useMemo(() =>
    setoranList.filter(s => s.santriId === selectedSantri),
    [setoranList, selectedSantri]
  );

  const monthEntries = useMemo(() =>
    allSantriEntries.filter(e => {
      const d = new Date(e.tanggal);
      return d.getMonth() === filterMonth && d.getFullYear() === filterYear;
    }),
    [allSantriEntries, filterMonth, filterYear]
  );

  const prevMonth = filterMonth === 0 ? 11 : filterMonth - 1;
  const prevYear = filterMonth === 0 ? filterYear - 1 : filterYear;
  const prevMonthEntries = useMemo(() =>
    allSantriEntries.filter(e => {
      const d = new Date(e.tanggal);
      return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
    }),
    [allSantriEntries, prevMonth, prevYear]
  );

  const twoMonthsAgo = prevMonth === 0 ? 11 : prevMonth - 1;
  const twoMonthsAgoYear = prevMonth === 0 ? prevYear - 1 : prevYear;
  const twoMonthsAgoEntries = useMemo(() =>
    allSantriEntries.filter(e => {
      const d = new Date(e.tanggal);
      return d.getMonth() === twoMonthsAgo && d.getFullYear() === twoMonthsAgoYear;
    }),
    [allSantriEntries, twoMonthsAgo, twoMonthsAgoYear]
  );

  // Progress calculation
  const totalBaris = allSantriEntries.filter(e => e.kehadiran === 'hadir').reduce((s, e) => s + e.jumlahBaris, 0);
  const totalHalaman = Math.floor(totalBaris / 15);
  const totalJuz = Math.floor(totalHalaman / 20);
  const progressPersen = Math.min(100, Math.round((totalJuz / 30) * 100));

  const memorizedJuz = [...new Set(allSantriEntries.filter(e => e.kehadiran === 'hadir').map(e => e.juz))];
  const memorizedSurat = [...new Set(allSantriEntries.filter(e => e.kehadiran === 'hadir').map(e => e.surat))];

  // Month stats
  const monthBaris = monthEntries.filter(e => e.kehadiran === 'hadir').reduce((s, e) => s + e.jumlahBaris, 0);
  const monthHalaman = Math.floor(monthBaris / 15);
  const monthJuz = Math.floor(monthHalaman / 20);

  const hadirCount = monthEntries.filter(e => e.kehadiran === 'hadir').length;
  const tidakHadirCount = monthEntries.filter(e => e.kehadiran !== 'hadir').length;
  const uniqueDaysHadir = [...new Set(monthEntries.filter(e => e.kehadiran === 'hadir').map(e => e.tanggal))].length;
  const uniqueDaysTidakHadir = [...new Set(monthEntries.filter(e => e.kehadiran !== 'hadir').map(e => e.tanggal))].length;

  // Comparison
  const prevBaris = prevMonthEntries.filter(e => e.kehadiran === 'hadir').reduce((s, e) => s + e.jumlahBaris, 0);
  const twoMonthsBaris = twoMonthsAgoEntries.filter(e => e.kehadiran === 'hadir').reduce((s, e) => s + e.jumlahBaris, 0);

  // Daily breakdown
  const getDailyBreakdown = (entries: typeof setoranList) => {
    const days: Record<number, { sabaq: number; sabqi: number; manzil: number; baris: number; nilai: number[]; kehadiran: string }> = {};
    for (let d = 1; d <= 31; d++) days[d] = { sabaq: 0, sabqi: 0, manzil: 0, baris: 0, nilai: [], kehadiran: '-' };
    entries.forEach(e => {
      const day = new Date(e.tanggal).getDate();
      days[day][e.tipe]++;
      days[day].baris += e.jumlahBaris;
      if (e.nilaiKelancaran > 0) days[day].nilai.push(e.nilaiKelancaran);
      days[day].kehadiran = e.kehadiran;
    });
    return days;
  };

  const currentDaily = getDailyBreakdown(monthEntries);
  const prevDaily = getDailyBreakdown(prevMonthEntries);

  // Ranking
  const allSantriProgress = useMemo(() => {
    return santriList.map(s => {
      const entries = setoranList.filter(e => e.santriId === s.id && e.kehadiran === 'hadir');
      const tb = entries.reduce((sum, e) => sum + e.jumlahBaris, 0);
      return { id: s.id, totalBaris: tb };
    }).sort((a, b) => b.totalBaris - a.totalBaris);
  }, [santriList, setoranList]);

  const ranking = allSantriProgress.findIndex(s => s.id === selectedSantri) + 1;

  const handleDownloadPDF = () => {
    // Simple print-based PDF
    window.print();
  };

  if (!santri) return <p>Pilih santri</p>;

  return (
    <div className="space-y-6 print:space-y-4" id="laporan-content">
      <div className="flex items-center justify-between flex-wrap gap-2 print:hidden">
        <h1 className="font-heading text-2xl font-bold">Laporan Bulanan</h1>
        <div className="flex gap-2 items-center flex-wrap">
          <Select value={selectedSantri} onValueChange={setSelectedSantri}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Pilih Santri" /></SelectTrigger>
            <SelectContent>
              {santriList.map(s => <SelectItem key={s.id} value={s.id}>{s.nama}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={String(filterMonth)} onValueChange={v => setFilterMonth(Number(v))}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {monthNames.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={handleDownloadPDF}><Download className="h-4 w-4 mr-1" /> Download PDF</Button>
        </div>
      </div>

      {/* Header info */}
      <div className="border border-border rounded-md p-4">
        <h2 className="font-heading text-xl font-bold">{santri.nama}</h2>
        <p className="text-sm text-muted-foreground">Kelas {santri.kelas} — {santri.kelasHalaqah} — {santri.ustadzPengampu}</p>
        <p className="text-sm text-muted-foreground">Ranking: <span className="font-bold text-foreground">#{ranking}</span> dari {santriList.length} santri</p>
      </div>

      {/* Progress */}
      <div className="border border-border rounded-md p-4">
        <h3 className="font-heading text-lg font-bold mb-2">Progress Tahfidz</h3>
        <div className="flex items-center gap-4 mb-3">
          <div className="flex-1 bg-muted rounded-sm h-4 overflow-hidden">
            <div className="h-full bg-primary rounded-sm" style={{ width: `${progressPersen}%` }} />
          </div>
          <span className="text-sm font-medium">{progressPersen}%</span>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Total: {totalJuz} juz, {totalHalaman % 20} halaman, {totalBaris} baris</p>
        <JuzProgressGrid memorizedJuz={memorizedJuz} currentJuz={memorizedJuz.length > 0 ? Math.max(...memorizedJuz) + 1 : 1} />
      </div>

      {/* Month summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="border border-border rounded-md p-4">
          <h4 className="font-heading font-bold text-sm mb-1">Pencapaian {monthNames[filterMonth]}</h4>
          <p className="text-2xl font-bold">{monthJuz} juz, {monthHalaman % 20} hal</p>
          <p className="text-xs text-muted-foreground">{monthBaris} baris total</p>
        </div>
        <div className="border border-border rounded-md p-4">
          <h4 className="font-heading font-bold text-sm mb-1">Kehadiran</h4>
          <p className="text-2xl font-bold">{uniqueDaysHadir} hari</p>
          <p className="text-xs text-muted-foreground">Tidak hadir: {uniqueDaysTidakHadir} hari</p>
        </div>
        <div className="border border-border rounded-md p-4">
          <h4 className="font-heading font-bold text-sm mb-1">Perbandingan</h4>
          <p className="text-xs text-muted-foreground">{monthNames[filterMonth]}: {monthBaris} baris</p>
          <p className="text-xs text-muted-foreground">{monthNames[prevMonth]}: {prevBaris} baris</p>
          <p className="text-xs text-muted-foreground">{monthNames[twoMonthsAgo]}: {twoMonthsBaris} baris</p>
        </div>
      </div>

      {/* Daily table - current month */}
      <div className="border border-border rounded-md p-4 overflow-x-auto">
        <h3 className="font-heading text-lg font-bold mb-2">Detail Harian — {monthNames[filterMonth]}</h3>
        <table className="w-full text-xs">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="p-1">Tgl</th>
              <th className="p-1 text-sabaq">Sabaq</th>
              <th className="p-1 text-sabqi">Sabqi</th>
              <th className="p-1 text-manzil">Manzil</th>
              <th className="p-1">Baris</th>
              <th className="p-1">Nilai</th>
              <th className="p-1">Hadir</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(currentDaily).map(([d, v]) => (
              <tr key={d} className="border-t border-border">
                <td className="p-1 text-center">{d}</td>
                <td className="p-1 text-center">{v.sabaq || '-'}</td>
                <td className="p-1 text-center">{v.sabqi || '-'}</td>
                <td className="p-1 text-center">{v.manzil || '-'}</td>
                <td className="p-1 text-center">{v.baris || '-'}</td>
                <td className="p-1 text-center">{v.nilai.length > 0 ? Math.round(v.nilai.reduce((a, b) => a + b, 0) / v.nilai.length) : '-'}</td>
                <td className="p-1 text-center">{v.kehadiran !== '-' ? v.kehadiran : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Juz & Surat summary */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="border border-border rounded-md p-4">
          <h3 className="font-heading font-bold mb-2">Juz yang Dihafal ({memorizedJuz.length} juz)</h3>
          <p className="text-sm">{memorizedJuz.sort((a, b) => a - b).join(', ') || 'Belum ada'}</p>
          <p className="text-xs text-muted-foreground mt-1">Belum: {30 - memorizedJuz.length} juz</p>
        </div>
        <div className="border border-border rounded-md p-4">
          <h3 className="font-heading font-bold mb-2">Surat yang Dihafal ({memorizedSurat.length} surat)</h3>
          <p className="text-sm text-muted-foreground">{memorizedSurat.slice(0, 20).join(', ')}{memorizedSurat.length > 20 ? '...' : ''}</p>
        </div>
      </div>
    </div>
  );
}

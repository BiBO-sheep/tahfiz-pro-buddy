import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { SetoranEntry, Kehadiran } from '@/types';
import { daftarSurat, getSuratByJuz } from '@/data/quran';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Minus } from 'lucide-react';

export default function InputSetoran() {
  const { santriList, setoranList, setSetoranList, ustadzList } = useAppContext();
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterUstadz, setFilterUstadz] = useState<string>('all');
  const [expandedSantri, setExpandedSantri] = useState<string | null>(null);

  const filtered = santriList.filter(s => {
    if (filterKelas !== 'all' && s.kelas !== Number(filterKelas)) return false;
    if (filterUstadz !== 'all' && s.ustadzPengampu !== filterUstadz) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="font-heading text-2xl font-bold">Input Setoran Tahfidz</h1>

      <div className="flex gap-2 flex-wrap">
        <Select value={filterKelas} onValueChange={setFilterKelas}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Filter Kelas" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Kelas</SelectItem>
            {[7, 8, 9, 10, 11, 12].map(k => <SelectItem key={k} value={String(k)}>Kelas {k}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterUstadz} onValueChange={setFilterUstadz}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter Ustadz" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Ustadz</SelectItem>
            {ustadzList.map(u => <SelectItem key={u.id} value={u.nama}>{u.nama}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="border border-border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="p-2 text-left">No</th>
              <th className="p-2 text-left">Nama Santri</th>
              <th className="p-2 text-left">Kelas</th>
              <th className="p-2 text-left">Halaqah</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <>
                <tr key={s.id} className="border-t border-border hover:bg-muted/30 cursor-pointer" onClick={() => setExpandedSantri(expandedSantri === s.id ? null : s.id)}>
                  <td className="p-2">{i + 1}</td>
                  <td className="p-2 font-medium">{s.nama}</td>
                  <td className="p-2">{s.kelas}</td>
                  <td className="p-2">{s.kelasHalaqah}</td>
                  <td className="p-2">
                    <Button size="sm" variant={expandedSantri === s.id ? "default" : "outline"} onClick={(e) => { e.stopPropagation(); setExpandedSantri(expandedSantri === s.id ? null : s.id); }}>
                      {expandedSantri === s.id ? 'Tutup' : 'Input'}
                    </Button>
                  </td>
                </tr>
                {expandedSantri === s.id && (
                  <tr key={`form-${s.id}`}>
                    <td colSpan={5} className="p-0">
                      <SetoranForm
                        santriId={s.id}
                        setoranList={setoranList}
                        onSave={(entry) => {
                          setSetoranList(prev => [...prev, entry]);
                          toast.success('Setoran berhasil disimpan');
                        }}
                      />
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SetoranForm({ santriId, setoranList, onSave }: {
  santriId: string;
  setoranList: SetoranEntry[];
  onSave: (entry: SetoranEntry) => void;
}) {
  const lastEntries = setoranList
    .filter(s => s.santriId === santriId)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 3);

  const [tipe, setTipe] = useState<'sabaq' | 'sabqi' | 'manzil'>('sabaq');
  const [juz, setJuz] = useState(1);
  const [surat, setSurat] = useState(daftarSurat[0].nama);
  const [ayatMulai, setAyatMulai] = useState(1);
  const [ayatSelesai, setAyatSelesai] = useState(10);
  const [jumlahBaris, setJumlahBaris] = useState(5);
  const [catatan, setCatatan] = useState('');
  const [kehadiran, setKehadiran] = useState<Kehadiran>('hadir');
  const [nilaiKelancaran, setNilaiKelancaran] = useState(100);

  const suratOptions = getSuratByJuz(juz);

  const handleSave = () => {
    onSave({
      id: `setoran-${Date.now()}`,
      santriId,
      tanggal: new Date().toISOString().split('T')[0],
      tipe,
      juz,
      surat,
      ayatMulai,
      ayatSelesai,
      jumlahBaris,
      catatan,
      kehadiran,
      nilaiKelancaran: kehadiran === 'hadir' ? nilaiKelancaran : 0,
    });
    setNilaiKelancaran(100);
    setCatatan('');
  };

  const tabColors: Record<string, string> = {
    sabaq: 'data-[state=active]:bg-sabaq data-[state=active]:text-primary-foreground',
    sabqi: 'data-[state=active]:bg-sabqi data-[state=active]:text-primary-foreground',
    manzil: 'data-[state=active]:bg-manzil data-[state=active]:text-primary-foreground',
  };

  return (
    <div className="border-t-2 border-primary bg-muted/20 p-4">
      {/* Last entries */}
      {lastEntries.length > 0 && (
        <div className="mb-3 text-xs text-muted-foreground">
          <p className="font-medium mb-1">Setoran terakhir:</p>
          {lastEntries.map(e => (
            <p key={e.id}>{e.tanggal} — {e.tipe.toUpperCase()} — {e.surat} (Juz {e.juz}), Ayat {e.ayatMulai}-{e.ayatSelesai}, Nilai: {e.nilaiKelancaran}</p>
          ))}
        </div>
      )}

      <Tabs value={tipe} onValueChange={v => setTipe(v as typeof tipe)}>
        <TabsList className="bg-secondary">
          <TabsTrigger value="sabaq" className={tabColors.sabaq}>Sabaq</TabsTrigger>
          <TabsTrigger value="sabqi" className={tabColors.sabqi}>Sabqi</TabsTrigger>
          <TabsTrigger value="manzil" className={tabColors.manzil}>Manzil</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="text-xs text-muted-foreground">Juz</label>
            <Select value={String(juz)} onValueChange={v => { setJuz(Number(v)); setSurat(getSuratByJuz(Number(v))[0]?.nama || ''); }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 30 }, (_, i) => i + 1).map(j => (
                  <SelectItem key={j} value={String(j)}>Juz {j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Surat</label>
            <Select value={surat} onValueChange={setSurat}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {suratOptions.map(s => (
                  <SelectItem key={s.nomor} value={s.nama}>{s.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Ayat Mulai</label>
            <Input type="number" min={1} value={ayatMulai} onChange={e => setAyatMulai(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Ayat Selesai</label>
            <Input type="number" min={1} value={ayatSelesai} onChange={e => setAyatSelesai(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Jumlah Baris</label>
            <Input type="number" min={1} value={jumlahBaris} onChange={e => setJumlahBaris(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Kehadiran</label>
            <Select value={kehadiran} onValueChange={v => setKehadiran(v as Kehadiran)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="hadir">Hadir</SelectItem>
                <SelectItem value="izin">Izin</SelectItem>
                <SelectItem value="terlambat">Terlambat</SelectItem>
                <SelectItem value="alpha">Alpha</SelectItem>
                <SelectItem value="sakit">Sakit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Nilai Kelancaran</label>
            <div className="flex items-center gap-2">
              <Input type="number" min={0} max={100} value={nilaiKelancaran} onChange={e => setNilaiKelancaran(Number(e.target.value))} />
              <Button size="icon" variant="outline" onClick={() => setNilaiKelancaran(v => Math.max(0, v - 5))} title="Kurangi 5">
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Catatan</label>
            <Input value={catatan} onChange={e => setCatatan(e.target.value)} placeholder="Catatan..." />
          </div>
        </div>
        <div className="mt-3">
          <Button onClick={handleSave}>Simpan Setoran</Button>
        </div>
      </Tabs>
    </div>
  );
}

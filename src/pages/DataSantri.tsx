import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Santri } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export default function DataSantri() {
  const { santriList, setSantriList, ustadzList } = useAppContext();
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [form, setForm] = useState<Partial<Santri>>({});

  const filtered = santriList
    .filter(s => filterKelas === 'all' || s.kelas === Number(filterKelas))
    .filter(s => s.nama.toLowerCase().includes(searchQuery.toLowerCase()));

  const openNew = () => {
    setEditingSantri(null);
    setForm({ jenisKelamin: 'L', kelas: 7, kelasHalaqah: 'Halaqah A' });
    setDialogOpen(true);
  };

  const openEdit = (s: Santri) => {
    setEditingSantri(s);
    setForm({ ...s });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nama || !form.nisn) {
      toast.error('Nama dan NISN wajib diisi');
      return;
    }
    if (editingSantri) {
      setSantriList(prev => prev.map(s => s.id === editingSantri.id ? { ...s, ...form } as Santri : s));
      toast.success('Data santri diperbarui');
    } else {
      const newSantri: Santri = {
        id: `santri-${Date.now()}`,
        nama: form.nama || '',
        jenisKelamin: form.jenisKelamin || 'L',
        kelas: form.kelas || 7,
        kelasHalaqah: form.kelasHalaqah || 'Halaqah A',
        nisn: form.nisn || '',
        ustadzPengampu: form.ustadzPengampu || ustadzList[0]?.nama || '',
        orangTua: form.orangTua || '',
        waOrangTua: form.waOrangTua || '',
      };
      setSantriList(prev => [...prev, newSantri]);
      toast.success('Santri baru ditambahkan');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSantriList(prev => prev.filter(s => s.id !== id));
    toast.success('Data santri dihapus');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-heading text-2xl font-bold">Data Santri</h1>
        <div className="flex gap-2 items-center">
          <Select value={filterKelas} onValueChange={setFilterKelas}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter Kelas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kelas</SelectItem>
              {[7, 8, 9, 10, 11, 12].map(k => (
                <SelectItem key={k} value={String(k)}>Kelas {k}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
        </div>
      </div>

      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="p-2 text-left">No</th>
              <th className="p-2 text-left">Nama Santri</th>
              <th className="p-2 text-left">JK</th>
              <th className="p-2 text-left">Kelas</th>
              <th className="p-2 text-left">Halaqah</th>
              <th className="p-2 text-left">NISN</th>
              <th className="p-2 text-left">Ustadz</th>
              <th className="p-2 text-left">Orang Tua</th>
              <th className="p-2 text-left">WA</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s, i) => (
              <tr key={s.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-medium">{s.nama}</td>
                <td className="p-2">{s.jenisKelamin}</td>
                <td className="p-2">{s.kelas}</td>
                <td className="p-2">{s.kelasHalaqah}</td>
                <td className="p-2">{s.nisn}</td>
                <td className="p-2">{s.ustadzPengampu}</td>
                <td className="p-2">{s.orangTua}</td>
                <td className="p-2">{s.waOrangTua}</td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(s.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-heading">{editingSantri ? 'Edit Santri' : 'Tambah Santri'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Nama Santri" value={form.nama || ''} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.jenisKelamin || 'L'} onValueChange={v => setForm(p => ({ ...p, jenisKelamin: v as 'L' | 'P' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="L">Laki-laki</SelectItem>
                  <SelectItem value="P">Perempuan</SelectItem>
                </SelectContent>
              </Select>
              <Select value={String(form.kelas || 7)} onValueChange={v => setForm(p => ({ ...p, kelas: Number(v) }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[7, 8, 9, 10, 11, 12].map(k => <SelectItem key={k} value={String(k)}>Kelas {k}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Input placeholder="NISN" value={form.nisn || ''} onChange={e => setForm(p => ({ ...p, nisn: e.target.value }))} />
            <Select value={form.kelasHalaqah || 'Halaqah A'} onValueChange={v => setForm(p => ({ ...p, kelasHalaqah: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['Halaqah A', 'Halaqah B', 'Halaqah C', 'Halaqah D', 'Halaqah E'].map(h => (
                  <SelectItem key={h} value={h}>{h}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={form.ustadzPengampu || ustadzList[0]?.nama || ''} onValueChange={v => setForm(p => ({ ...p, ustadzPengampu: v }))}>
              <SelectTrigger><SelectValue placeholder="Ustadz Pengampu" /></SelectTrigger>
              <SelectContent>
                {ustadzList.map(u => <SelectItem key={u.id} value={u.nama}>{u.nama}</SelectItem>)}
              </SelectContent>
            </Select>
            <Input placeholder="Nama Orang Tua" value={form.orangTua || ''} onChange={e => setForm(p => ({ ...p, orangTua: e.target.value }))} />
            <Input placeholder="WA Orang Tua" value={form.waOrangTua || ''} onChange={e => setForm(p => ({ ...p, waOrangTua: e.target.value }))} />
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

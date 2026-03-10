import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import { Ustadz } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function DataUstadz() {
  const { ustadzList, setUstadzList } = useAppContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Ustadz | null>(null);
  const [form, setForm] = useState<Partial<Ustadz>>({});

  const openNew = () => {
    setEditing(null);
    setForm({ jenisKelamin: 'L' });
    setDialogOpen(true);
  };

  const openEdit = (u: Ustadz) => {
    setEditing(u);
    setForm({ ...u });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.nama) { toast.error('Nama wajib diisi'); return; }
    if (editing) {
      setUstadzList(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } as Ustadz : u));
      toast.success('Data ustadz diperbarui');
    } else {
      setUstadzList(prev => [...prev, {
        id: `ustadz-${Date.now()}`,
        nama: form.nama || '',
        jenisKelamin: form.jenisKelamin || 'L',
        noWa: form.noWa || '',
        asalPondok: form.asalPondok || '',
      }]);
      toast.success('Ustadz baru ditambahkan');
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setUstadzList(prev => prev.filter(u => u.id !== id));
    toast.success('Data ustadz dihapus');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="font-heading text-2xl font-bold">Data Ustadz Pengampu</h1>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Tambah</Button>
      </div>

      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-secondary text-secondary-foreground">
            <tr>
              <th className="p-2 text-left">No</th>
              <th className="p-2 text-left">Nama Ustadz</th>
              <th className="p-2 text-left">Jenis Kelamin</th>
              <th className="p-2 text-left">No WA</th>
              <th className="p-2 text-left">Asal Pondok Pesantren</th>
              <th className="p-2 text-left">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {ustadzList.map((u, i) => (
              <tr key={u.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-2">{i + 1}</td>
                <td className="p-2 font-medium">{u.nama}</td>
                <td className="p-2">{u.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</td>
                <td className="p-2">{u.noWa}</td>
                <td className="p-2">{u.asalPondok}</td>
                <td className="p-2">
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-3 w-3" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(u.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{editing ? 'Edit Ustadz' : 'Tambah Ustadz'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input placeholder="Nama Ustadz" value={form.nama || ''} onChange={e => setForm(p => ({ ...p, nama: e.target.value }))} />
            <Select value={form.jenisKelamin || 'L'} onValueChange={v => setForm(p => ({ ...p, jenisKelamin: v as 'L' | 'P' }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="L">Laki-laki</SelectItem>
                <SelectItem value="P">Perempuan</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="No WA" value={form.noWa || ''} onChange={e => setForm(p => ({ ...p, noWa: e.target.value }))} />
            <Input placeholder="Asal Pondok Pesantren" value={form.asalPondok || ''} onChange={e => setForm(p => ({ ...p, asalPondok: e.target.value }))} />
            <Button onClick={handleSave}>Simpan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

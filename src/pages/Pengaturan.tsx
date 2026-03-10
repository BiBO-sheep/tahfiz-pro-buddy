import { useAppContext } from '@/context/AppContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const themes = [
  { id: '', label: 'Ruang Hening (Default)', color: '#4A6C55' },
  { id: 'dark', label: 'Gelap', color: '#1A1D21' },
  { id: 'theme-ocean', label: 'Samudra', color: '#2E6BA6' },
  { id: 'theme-earth', label: 'Bumi', color: '#A0673B' },
  { id: 'theme-royal', label: 'Kerajaan', color: '#6B4FA0' },
  { id: 'theme-rose', label: 'Mawar', color: '#A63D5C' },
];

export default function Pengaturan() {
  const { settings, setSettings } = useAppContext();

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="font-heading text-2xl font-bold">Pengaturan</h1>

      <div className="border border-border rounded-md p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Nama Pesantren</label>
          <Input
            value={settings.nama}
            onChange={e => setSettings(p => ({ ...p, nama: e.target.value }))}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Logo Pesantren (URL)</label>
          <Input
            value={settings.logo}
            onChange={e => setSettings(p => ({ ...p, logo: e.target.value }))}
            placeholder="https://example.com/logo.png"
          />
          {settings.logo && (
            <img src={settings.logo} alt="Logo" className="mt-2 h-16 w-16 object-contain rounded-md border border-border" />
          )}
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Tema Warna</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {themes.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setSettings(p => ({ ...p, theme: t.id }));
                  toast.success(`Tema "${t.label}" diterapkan`);
                }}
                className={`
                  flex items-center gap-3 border rounded-md p-3 text-left text-sm
                  ${settings.theme === t.id ? 'border-primary ring-1 ring-primary' : 'border-border'}
                  hover:bg-muted/50
                `}
              >
                <div className="w-6 h-6 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

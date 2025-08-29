import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export interface CommandItem {
  id: string;
  title: string;
  run: () => void;
  keywords?: string;
  section?: string;
}

interface CommandContextValue {
  open: boolean;
  setOpen: (o: boolean) => void;
  items: CommandItem[];
  register: (item: CommandItem) => void;
}

const CommandContext = createContext<CommandContextValue | null>(null);

export const useCommandPalette = () => {
  const ctx = useContext(CommandContext);
  if (!ctx) throw new Error('useCommandPalette must be used within CommandPaletteProvider');
  return ctx;
};

export const CommandPaletteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CommandItem[]>([]);

  const register = useCallback((item: CommandItem) => {
    setItems(prev => prev.find(i => i.id === item.id) ? prev : [...prev, item]);
  }, []);

  // Default items
  useEffect(() => {
    register({ id: 'nav.dashboard', title: 'Go to Dashboard', run: () => navigate('/') });
    register({ id: 'nav.users', title: 'User Management', run: () => navigate('/users') });
    register({ id: 'nav.addVuln', title: 'Add Vulnerability', run: () => navigate('/vulnerabilities/new') });
  }, [register, navigate]);

  // Shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen(o => !o);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const value = useMemo(() => ({ open, setOpen, items, register }), [open, items, register]);

  return (
    <CommandContext.Provider value={value}>
      {children}
      {open && <Palette onClose={() => setOpen(false)} items={items} />}
    </CommandContext.Provider>
  );
};

// Basic palette UI (lightweight custom rather than cmdk dependency yet)
const Palette: React.FC<{ onClose: () => void; items: CommandItem[] }> = ({ onClose, items }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i => i.title.toLowerCase().includes(q) || (i.keywords && i.keywords.toLowerCase().includes(q)));
  }, [items, query]);
  const run = (item: CommandItem) => { item.run(); onClose(); };
  return (
    <div aria-modal className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40" role="dialog">
      <div className="w-full max-w-lg rounded-md border bg-background shadow-lg">
        <input
          autoFocus
          placeholder="Type a command or search..."
          className="w-full px-3 py-2 border-b bg-transparent outline-none"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <ul className="max-h-80 overflow-y-auto">
          {filtered.map(f => (
            <li key={f.id}>
              <button
                onClick={() => run(f)}
                className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground"
              >{f.title}</button>
            </li>
          ))}
          {!filtered.length && <li className="px-3 py-2 text-sm text-muted-foreground">No results</li>}
        </ul>
        <div className="flex justify-between px-3 py-2 text-xs text-muted-foreground border-t">
          <span>Press Esc to close</span><span>Ctrl+K</span>
        </div>
      </div>
    </div>
  );
};

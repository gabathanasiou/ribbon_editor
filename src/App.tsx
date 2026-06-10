import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Hash, Clock, Timer, MapPin, Building2, Sun, Users, FileText, AlignLeft,
  Calendar, StickyNote, UserPlus, Sparkles, Car, Package, Shirt, Scissors,
  Volume1, Video, Volume2, Music, PawPrint, Sword, Leaf, PaintBucket,
  Plus, Trash2, GripHorizontal,
  Eye, ArrowRightLeft, RotateCcw, ArrowUp, ArrowDown,
  Undo2, Redo2, LayoutGrid, ChevronDown, ArrowLeft, ArrowRight,
  AlignCenter, AlignRight, WrapText, Grid3X3, Type,
  Download, Upload, Check, PanelLeft,
} from 'lucide-react';

/* ── Types & Data ─────────────────────────────────── */

interface FieldDef { key: string; label: string; defaultWidth: number; align: 'left' | 'center' | 'right'; icon: React.ElementType; category: string; defaultSuffix?: string; }
interface ColCell  { id: string; field: string; width: number; align?: 'left' | 'center' | 'right'; wrap?: boolean; prefix?: string; suffix?: string; textContent?: string; }
interface RowConfig { id: string; name: string; cells: ColCell[]; }
interface RibbonDesign { id: string; name: string; rows: RowConfig[]; createdAt: number; }

const CATEGORY_COLORS: Record<string, string> = {
  'Scene Info': 'text-orange-600',
  'Shooting': 'text-blue-600',
  'Cast & Talent': 'text-violet-600',
  'Production': 'text-emerald-600',
  'Breakdown': 'text-amber-600',
  'VFX & Audio': 'text-cyan-600',
  'Misc': 'text-rose-600',
  'Special': 'text-zinc-500',
};

const CATEGORY_BG: Record<string, string> = {
  'Scene Info': 'bg-orange-50',
  'Shooting': 'bg-blue-50',
  'Cast & Talent': 'bg-violet-50',
  'Production': 'bg-emerald-50',
  'Breakdown': 'bg-amber-50',
  'VFX & Audio': 'bg-cyan-50',
  'Misc': 'bg-rose-50',
  'Special': 'bg-zinc-50',
};

const CATEGORY_ACCENT: Record<string, string> = {
  'Scene Info': 'border-l-orange-400',
  'Shooting': 'border-l-blue-400',
  'Cast & Talent': 'border-l-violet-400',
  'Production': 'border-l-emerald-400',
  'Breakdown': 'border-l-amber-400',
  'VFX & Audio': 'border-l-cyan-400',
  'Misc': 'border-l-rose-400',
  'Special': 'border-l-zinc-300',
};

const ALL_FIELDS: FieldDef[] = [
  { key: 'sceneNumber', label: 'Scene #',   defaultWidth: 4.30, align: 'center', icon: Hash,        category: 'Scene Info' },
  { key: 'callTime',    label: 'Call Time',  defaultWidth: 5.73, align: 'left',   icon: Clock,       category: 'Shooting' },
  { key: 'duration',    label: 'Duration',   defaultWidth: 8.60, align: 'left',   icon: Timer,       category: 'Shooting' },
  { key: 'intExt',      label: 'I/E',        defaultWidth: 9.74, align: 'left',   icon: MapPin,      category: 'Shooting' },
  { key: 'set',         label: 'Set',        defaultWidth: 34.38,align: 'left',   icon: Building2,   category: 'Shooting' },
  { key: 'dayNight',    label: 'D/N',        defaultWidth: 11.46,align: 'left',   icon: Sun,         category: 'Shooting' },
  { key: 'cast',        label: 'Cast',       defaultWidth: 16.05,align: 'left',   icon: Users,       category: 'Cast & Talent' },
  { key: 'pages',       label: 'Pages',      defaultWidth: 9.74, align: 'left',   icon: FileText,    category: 'Scene Info', defaultSuffix: 'pgs' },
  { key: 'description', label: 'Synopsis',   defaultWidth: 81.38,align: 'left',   icon: AlignLeft,   category: 'Scene Info' },
  { key: 'scriptDay',   label: 'Script Day', defaultWidth: 11.46,align: 'left',   icon: Calendar,    category: 'Production' },
  { key: 'location',    label: 'Location',   defaultWidth: 22.92,align: 'left',   icon: MapPin,      category: 'Production' },
  { key: 'notes',       label: 'Notes',      defaultWidth: 22.92,align: 'left',   icon: StickyNote,  category: 'Production' },
  { key: 'extras',      label: 'BG Artists', defaultWidth: 17.19,align: 'left',   icon: UserPlus,    category: 'Cast & Talent' },
  { key: 'stunts',      label: 'Stunts',     defaultWidth: 17.19,align: 'left',   icon: Sparkles,    category: 'Cast & Talent' },
  { key: 'vehicles',    label: 'Vehicles',   defaultWidth: 17.19,align: 'left',   icon: Car,         category: 'Breakdown' },
  { key: 'props',       label: 'Props',      defaultWidth: 17.19,align: 'left',   icon: Package,     category: 'Breakdown' },
  { key: 'wardrobe',    label: 'Wardrobe',   defaultWidth: 17.19,align: 'left',   icon: Shirt,       category: 'Breakdown' },
  { key: 'makeup',      label: 'Makeup',     defaultWidth: 17.19,align: 'left',   icon: Scissors,    category: 'Breakdown' },
  { key: 'sfx',         label: 'SFX',        defaultWidth: 17.19,align: 'left',   icon: Volume1,     category: 'VFX & Audio' },
  { key: 'vfx',         label: 'VFX',        defaultWidth: 17.19,align: 'left',   icon: Video,       category: 'VFX & Audio' },
  { key: 'sound',       label: 'Sound',      defaultWidth: 17.19,align: 'left',   icon: Volume2,     category: 'VFX & Audio' },
  { key: 'music',       label: 'Music',      defaultWidth: 17.19,align: 'left',   icon: Music,       category: 'VFX & Audio' },
  { key: 'animals',     label: 'Animals',    defaultWidth: 17.19,align: 'left',   icon: PawPrint,    category: 'Misc' },
  { key: 'weapons',     label: 'Weapons',    defaultWidth: 17.19,align: 'left',   icon: Sword,       category: 'Misc' },
  { key: 'greenery',    label: 'Greenery',   defaultWidth: 17.19,align: 'left',   icon: Leaf,        category: 'Misc' },
  { key: 'artDept',     label: 'Art Dept',   defaultWidth: 17.19,align: 'left',   icon: PaintBucket, category: 'Misc' },
  { key: 'text',        label: 'Text',        defaultWidth: 28.65,align: 'left',   icon: Type,        category: 'Special' },
];

const FIELD_MAP = Object.fromEntries(ALL_FIELDS.map(f => [f.key, f]));
const CATEGORIES = [...new Set(ALL_FIELDS.map(f => f.category))];

const SAMPLE: Record<string, string> = {
  sceneNumber: '5', callTime: '08:00', duration: '150', intExt: 'INT',
  set: 'KITCHEN', dayNight: 'DAY', cast: '1, 2, 4', pages: '2 3/8',
  description: 'John makes breakfast while arguing with Mary about the party.',
  scriptDay: '3', location: 'HOUSE', notes: 'Need breakfast props — call crafty.',
  extras: '20 BG', stunts: 'Stunt double: JOHN', vehicles: '2× police car',
  props: 'Frying pan, phone, mug', wardrobe: 'Casual: JOHN, Biz: MARY',
  makeup: 'Prosthetic scar: JOHN', sfx: 'Gunshot (off-screen)', vfx: 'Window replacement',
  sound: 'Dialogue cleanup', music: 'Track 5 — Morning Montage',
  animals: '1× cat (orange tabby)', weapons: 'Prop knife (rubber)',
  greenery: 'Fake potted plants ×3', artDept: '1950s kitchen calendar, curtains',
};

const INT_EXT: Record<string, string> = { INT: 'INT', EXT: 'EXT' };
const DAY_NIGHT: Record<string, string> = { DAY: 'DAY', NIGHT: 'NIGHT', MORNING: 'MORN', EVENING: 'EVE' };

function formatDuration(minutes: number): string {
  if (!minutes) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function cid() { return `c${Math.random().toString(36).slice(2, 7)}`; }

const MIN_PCT = 2.5;

function normalizeCells(cells: ColCell[]): ColCell[] {
  if (cells.length === 0) return cells;
  const sum = cells.reduce((s, c) => s + c.width, 0);
  if (Math.abs(sum - 100) < 0.01) return cells;
  const scale = 100 / sum;
  return cells.map(c => ({ ...c, width: Math.max(MIN_PCT, Math.round(c.width * scale * 100) / 100) }));
}

function mkRow(name: string, keys: string[]): RowConfig {
  return { id: cid(), name, cells: keys.map(k => {
    const f = FIELD_MAP[k];
    return { id: cid(), field: k, width: f?.defaultWidth || 10, suffix: f?.defaultSuffix };
  }) };
}

const DEFAULT_ROWS = (): RowConfig[] => [
  mkRow('Row 1', ['sceneNumber','callTime','duration','intExt','set','dayNight','cast','pages']),
  { id: cid(), name: 'Row 2', cells: [
    { id: cid(), field: '', width: 18.54 },
    { id: cid(), field: 'description', width: 81.46, suffix: undefined },
  ]},
];

function cellValue(field: string): string {
  if (!field) return '';
  const v = SAMPLE[field] || '';
  if (field === 'pages') return v || '';
  if (field === 'duration') return v ? formatDuration(Number(v)) : '';
  if (field === 'intExt') return INT_EXT[v] || v;
  if (field === 'dayNight') return DAY_NIGHT[v] || v;
  return v;
}

const STYLE = { bg: '#ffffff', fg: '#363636' };

/* ── Undo / Redo ──────────────────────────────────── */

function cloneRows(rs: RowConfig[]): RowConfig[] { return JSON.parse(JSON.stringify(rs)); }

function useUndoableRows(initial: () => RowConfig[]) {
  const [tick, setTick] = useState(0);
  const undos = useRef<RowConfig[][]>([cloneRows(initial())]);
  const redos = useRef<RowConfig[][]>([]);

  const current = undos.current[undos.current.length - 1];

  const reset = useCallback(() => {
    const fresh = cloneRows(initial());
    undos.current = [fresh];
    redos.current = [];
    setTick(t => t + 1);
  }, [initial]);

  const commit = useCallback((next: RowConfig[]) => {
    undos.current.push(next);
    if (undos.current.length > 100) undos.current.shift();
    redos.current = [];
    setTick(t => t + 1);
  }, []);

  const undo = useCallback(() => {
    if (undos.current.length < 2) return;
    redos.current.push(undos.current.pop()!);
    setTick(t => t + 1);
  }, []);

  const redo = useCallback(() => {
    if (redos.current.length === 0) return;
    undos.current.push(redos.current.pop()!);
    setTick(t => t + 1);
  }, []);

  const liveMutate = useCallback((mutator: (rows: RowConfig[]) => void) => {
    const all = cloneRows(undos.current[undos.current.length - 1]);
    mutator(all);
    undos.current[undos.current.length - 1] = all;
    setTick(t => t + 1);
  }, []);

  const canUndo = undos.current.length > 1;
  const canRedo = redos.current.length > 0;

  const replace = useCallback((newRows: RowConfig[]) => {
    undos.current = [cloneRows(newRows)];
    redos.current = [];
    setTick(t => t + 1);
  }, []);

  return { rows: current, commit, reset, undo, redo, liveMutate, replace, canUndo, canRedo };
}

/* ── App ──────────────────────────────────────────── */

export default function App() {
  const loadInitialRows = useCallback((): RowConfig[] => {
    try {
      const raw = localStorage.getItem('ribbon_designs');
      if (raw) {
        const designs: RibbonDesign[] = JSON.parse(raw);
        const activeId = localStorage.getItem('ribbon_active_id');
        const active = designs.find(d => d.id === activeId);
        if (active) return active.rows;
      }
    } catch { }
    return DEFAULT_ROWS();
  }, []);

  const { rows, commit, reset, undo, redo, liveMutate, replace, canUndo, canRedo } = useUndoableRows(loadInitialRows);
  const [selId, setSelId]      = useState<string | null>(null);
  const [resizing, setResizing] = useState<{ rowId: string; ci: number; sx: number; a: number; b: number; leftSum: number; rightSum: number; n: number } | null>(null);
  const [changeOpen, setChangeOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(true);
  const [dropHover, setDropHover] = useState<string | null>(null);
  const [cellDrag, setCellDrag]   = useState<{ rowId: string; cellId: string } | null>(null);
  const [cellDropTarget, setCellDropTarget] = useState<string | null>(null);
  const [betweenDrop, setBetweenDrop] = useState<string | null>(null);
  const cellRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const lastSpacerSync = useRef(0);

  useEffect(() => {
    const r1 = rows[0];
    const r2 = rows[1];
    if (!r1 || !r2 || r2.cells.length < 2) return;
    const sw = r1.cells.slice(0, 3).reduce((s, c) => s + c.width, 0);
    if (Math.abs(r2.cells[0].width - sw) < 0.01) return;
    if (Math.abs(lastSpacerSync.current - sw) < 0.01) return;
    lastSpacerSync.current = sw;
    liveMutate(all => {
      const a = all[0]?.cells;
      const b = all[1]?.cells;
      if (a && b && b.length >= 2) {
        const w = Math.round(a.slice(0, 3).reduce((s, c) => s + c.width, 0) * 100) / 100;
        b[0].width = w;
        b[1].width = Math.max(MIN_PCT, Math.round((100 - w) * 100) / 100);
      }
    });
  }, [rows, liveMutate]);

  React.useEffect(() => { setChangeOpen(false); }, [selId]);

  const openMenu = useCallback((e?: React.MouseEvent) => {
    if (e && e.type === 'contextmenu') {
      setDropdownPos({ x: e.clientX, y: e.clientY });
    } else if (selId) {
      const el = cellRefs.current.get(selId);
      if (el) {
        const r = el.getBoundingClientRect();
        setDropdownPos({ x: r.left, y: r.bottom + 2 });
      }
    }
    setChangeOpen(true);
  }, [selId]);

  const used   = new Set(rows.flatMap(r => r.cells.map(c => c.field)).filter(f => f && f !== 'text'));
  const placed = used.size;
  const total  = ALL_FIELDS.length;

  const [designs, setDesigns] = useState<RibbonDesign[]>(() => {
    try { const raw = localStorage.getItem('ribbon_designs'); return raw ? JSON.parse(raw) : []; }
    catch { return []; }
  });
  const [activeId, setActiveId] = useState<string>(() => localStorage.getItem('ribbon_active_id') || '');
  const [showDesigns, setShowDesigns] = useState(false);

  const activeDesign = designs.find(d => d.id === activeId);

  const saveDesigns = useCallback((d: RibbonDesign[]) => {
    setDesigns(d);
    localStorage.setItem('ribbon_designs', JSON.stringify(d));
  }, []);

  const createDesign = useCallback((name: string) => {
    const id = `d${Date.now()}`;
    const d: RibbonDesign = { id, name, rows: cloneRows(rows), createdAt: Date.now() };
    const next = [...designs, d];
    saveDesigns(next);
    setActiveId(id);
    localStorage.setItem('ribbon_active_id', id);
  }, [designs, rows, saveDesigns]);

  const renameDesign = useCallback((id: string, name: string) => {
    saveDesigns(designs.map(d => d.id === id ? { ...d, name } : d));
  }, [designs, saveDesigns]);

  const deleteDesign = useCallback((id: string) => {
    const next = designs.filter(d => d.id !== id);
    saveDesigns(next);
    if (id === activeId) {
      const newActive = next[0];
      if (newActive) {
        setActiveId(newActive.id);
        localStorage.setItem('ribbon_active_id', newActive.id);
        replace(newActive.rows);
      } else {
        setActiveId('');
        localStorage.removeItem('ribbon_active_id');
        replace(DEFAULT_ROWS());
      }
    }
  }, [designs, activeId, saveDesigns, replace]);

  const exportDesign = useCallback(() => {
    const data = JSON.stringify({ name: activeDesign?.name || 'Untitled', rows: cloneRows(rows) }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${activeDesign?.name || 'ribbon'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [rows, activeDesign]);

  const importDesign = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          if (data.rows && Array.isArray(data.rows)) {
            const id = `d${Date.now()}`;
            const d: RibbonDesign = { id, name: data.name || 'Imported', rows: data.rows, createdAt: Date.now() };
            saveDesigns([...designs, d]);
            setActiveId(id);
            localStorage.setItem('ribbon_active_id', id);
            replace(data.rows);
          }
        } catch { alert('Invalid design file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [designs, saveDesigns, replace]);

  const switchDesign = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem('ribbon_active_id', id);
    const d = designs.find(dd => dd.id === id);
    if (d) replace(d.rows);
    setShowDesigns(false);
  }, [designs, replace]);

  const saveTimer = useRef(0);
  useEffect(() => {
    if (!activeId) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      const now = Date.now();
      saveDesigns(designs.map(d => d.id === activeId ? { ...d, rows: cloneRows(rows), createdAt: now } : d));
    }, 400);
  }, [rows, activeId]);

  const findCell = useCallback((cid: string) => {
    for (const r of rows) {
      const ci = r.cells.findIndex(c => c.id === cid);
      if (ci >= 0) return { row: r, ci, cell: r.cells[ci] };
    }
    return null;
  }, [rows]);

  const assign = useCallback((cellId: string, key: string) => {
    const f = FIELD_MAP[key];
    const dw = f?.defaultWidth;
    const ds = f?.defaultSuffix;
    commit(rows.map(r => ({
      ...r, cells: normalizeCells(r.cells.map(c => c.id === cellId ? {
        ...c, field: key, ...(dw && dw !== c.width ? { width: dw } : {}),
        suffix: ds,
        ...(key !== 'text' ? { textContent: undefined } : {}),
      } : c)),
    })));
  }, [rows, commit]);

  const clearCell = useCallback((cellId: string) => {
    commit(rows.map(r => ({
      ...r, cells: r.cells.map(c => c.id === cellId ? { ...c, field: '' } : c),
    })));
  }, [rows, commit]);

  const removeCell = useCallback((rowId: string, ci: number) => {
    commit(rows.map(r => r.id === rowId ? { ...r, cells: normalizeCells(r.cells.filter((_, i) => i !== ci)) } : r));
    setSelId(null);
  }, [rows, commit]);

  const addCell = useCallback((rowId: string, after: number): string => {
    const newId = cid();
    commit(rows.map(r => {
      if (r.id !== rowId) return r;
      const nc = [...r.cells];
      nc.splice(after + 1, 0, { id: newId, field: '', width: 10 });
      return { ...r, cells: normalizeCells(nc) };
    }));
    return newId;
  }, [rows, commit]);

  const insertCellAt = useCallback((rowId: string, ci: number, fieldKey?: string): string => {
    const newId = cid();
    const f = fieldKey ? FIELD_MAP[fieldKey] : null;
    commit(rows.map(r => {
      if (r.id !== rowId) return r;
      const nc = [...r.cells];
      nc.splice(ci, 0, { id: newId, field: fieldKey || '', width: f?.defaultWidth || 10, suffix: f?.defaultSuffix });
      return { ...r, cells: normalizeCells(nc) };
    }));
    return newId;
  }, [rows, commit]);

  const setAlign = useCallback((cellId: string, align: 'left' | 'center' | 'right' | undefined) => {
    commit(rows.map(r => ({
      ...r, cells: r.cells.map(c => c.id === cellId ? { ...c, align } : c),
    })));
  }, [rows, commit]);

  const setWrapCell = useCallback((cellId: string, wrap: boolean) => {
    commit(rows.map(r => ({
      ...r, cells: r.cells.map(c => c.id === cellId ? { ...c, wrap: wrap || undefined } : c),
    })));
  }, [rows, commit]);

  const setAffix = useCallback((cellId: string, key: 'prefix' | 'suffix', value: string) => {
    commit(rows.map(r => ({
      ...r, cells: r.cells.map(c => c.id === cellId ? { ...c, [key]: value || undefined } : c),
    })));
  }, [rows, commit]);

  const setTextContent = useCallback((cellId: string, text: string) => {
    commit(rows.map(r => ({
      ...r, cells: r.cells.map(c => c.id === cellId ? { ...c, textContent: text || undefined } : c),
    })));
  }, [rows, commit]);

  const moveCellToRow = useCallback((srcRowId: string, srcCi: number, tgtRowId: string, tgtCi: number) => {
    if (srcRowId === tgtRowId && srcCi === tgtCi) return;
    const srcRow = rows.find(r => r.id === srcRowId);
    if (!srcRow) return;
    const cell = { ...srcRow.cells[srcCi] };
    commit(rows.map(r => {
      if (r.id === srcRowId && r.id === tgtRowId) {
        const nc = r.cells.filter((_, i) => i !== srcCi);
        const insertAt = tgtCi > srcCi ? tgtCi - 1 : tgtCi;
        nc.splice(insertAt, 0, cell);
        return { ...r, cells: normalizeCells(nc) };
      }
      if (r.id === srcRowId) {
        return { ...r, cells: normalizeCells(r.cells.filter((_, i) => i !== srcCi)) };
      }
      if (r.id === tgtRowId) {
        const nc = [...r.cells];
        nc.splice(tgtCi, 0, cell);
        return { ...r, cells: normalizeCells(nc) };
      }
      return r;
    }));
  }, [rows, commit]);

  const moveCell = useCallback((rowId: string, ci: number, dir: -1 | 1) => {
    const j = ci + dir;
    if (j < 0) return;
    const row = rows.find(r => r.id === rowId);
    if (!row || j >= row.cells.length) return;
    commit(rows.map(r => {
      if (r.id !== rowId) return r;
      const nc = [...r.cells];
      [nc[ci], nc[j]] = [nc[j], nc[ci]];
      return { ...r, cells: normalizeCells(nc) };
    }));
  }, [rows, commit]);

  const addRow = useCallback(() => {
    commit([...rows, { id: cid(), name: `Row ${rows.length + 1}`, cells: [{ id: cid(), field: '', width: 100 }] }]);
  }, [rows, commit]);

  const removeRow = useCallback((rid: string) => {
    if (rows.length <= 1) return;
    commit(rows.filter(r => r.id !== rid));
    setSelId(null);
  }, [rows, commit]);

  const moveRow = useCallback((rid: string, dir: -1 | 1) => {
    const i = rows.findIndex(r => r.id === rid);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= rows.length) return;
    const next = [...rows];
    [next[i], next[j]] = [next[j], next[i]];
    commit(next);
  }, [rows, commit]);

  useEffect(() => {
    if (!resizing) return;
    const onMove = (e: MouseEvent) => {
      const rowEl = document.querySelector(`[data-row="${resizing.rowId}"]`) as HTMLElement | null;
      if (!rowEl) return;
      const pxW = rowEl.offsetWidth || 1;
      const deltaPct = ((e.clientX - resizing.sx) / pxW) * 100;

      liveMutate(all => {
        for (const r of all) {
          if (r.id !== resizing.rowId || resizing.ci >= r.cells.length - 1) continue;

          if (e.shiftKey) {
            const newA = Math.max(MIN_PCT, Math.min(
              resizing.a + resizing.rightSum - MIN_PCT * resizing.n,
              resizing.a + deltaPct
            ));
            const remaining = resizing.rightSum + resizing.a - newA;
            const scale = remaining / resizing.rightSum;
            r.cells[resizing.ci].width = Math.round(newA * 100) / 100;
            for (let i = resizing.ci + 1; i < r.cells.length; i++) {
              r.cells[i].width = Math.max(MIN_PCT, Math.round(r.cells[i].width * scale * 100) / 100);
            }
          } else {
            const newA = Math.max(MIN_PCT, Math.min(resizing.a + resizing.b - MIN_PCT, resizing.a + deltaPct));
            const newB = resizing.a + resizing.b - newA;
            r.cells[resizing.ci].width = Math.round(newA * 100) / 100;
            r.cells[resizing.ci + 1].width = Math.round(newB * 100) / 100;
          }
        }
      });
    };
    const onUp = () => setResizing(null);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, [resizing, liveMutate]);

  const selIdRef = useRef(selId);
  selIdRef.current = selId;
  const changeOpenRef = useRef(changeOpen);
  changeOpenRef.current = changeOpen;
  const rowsRef = useRef(rows);
  rowsRef.current = rows;
  const actRef = useRef({ clearCell, undo, redo });
  actRef.current = { clearCell, undo, redo };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const { clearCell: clear, undo: un, redo: rd } = actRef.current;
      const rows = rowsRef.current;
      if ((e.key === 'Delete' || e.key === 'Backspace') && selIdRef.current && !changeOpenRef.current) { e.preventDefault(); clear(selIdRef.current); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        if (!selIdRef.current) return;
        e.preventDefault();
        for (const r of rows) {
          const ci = r.cells.findIndex(c => c.id === selIdRef.current);
          if (ci >= 0) {
            const nc = ci + (e.key === 'ArrowRight' ? 1 : -1);
            if (nc >= 0 && nc < r.cells.length) setSelId(r.cells[nc].id);
            break;
          }
        }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') { e.preventDefault(); if (e.shiftKey) rd(); else un(); return; }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); rd(); return; }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const selCell = selId ? findCell(selId) : null;

  const getAlign = (c?: ColCell) => {
    if (c?.align) return c.align;
    return FIELD_MAP[c?.field || '']?.align || 'left';
  };

  const getLabel = (field: string) => { if (!field) return 'Empty'; const f = FIELD_MAP[field]; return f ? f.label : field; };

  return (
    <div className="h-screen flex flex-col text-zinc-800">
      {/* ══ Top bar ══ */}
      <header className="flex items-center gap-3 px-5 py-2.5 bg-white border-b border-zinc-200/80 shrink-0 select-none shadow-sm z-30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <LayoutGrid className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-zinc-800 hidden sm:inline">Ribbon</span>
        </div>

        <div className="w-px h-5 bg-zinc-200" />

        <div className="relative">
          <button onClick={() => setShowDesigns(o => !o)}
            className="flex items-center gap-1.5 hover:bg-zinc-100 rounded-lg px-2.5 py-1.5 transition-colors">
            <span className="text-[13px] font-medium text-zinc-700">{activeDesign?.name || 'Untitled'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>
          {showDesigns && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDesigns(false)} />
              <div className="absolute z-50 left-0 top-full mt-1.5 bg-white border border-zinc-200 rounded-xl shadow-xl py-1.5 min-w-[220px] max-h-[320px] overflow-y-auto">
                <div className="px-3 pb-1.5 mb-1 border-b border-zinc-100">
                  <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Saved Designs</span>
                </div>
                {designs.map(d => (
                  <button key={d.id} onClick={() => switchDesign(d.id)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-zinc-50 flex items-center gap-2.5 transition-colors ${
                      d.id === activeId ? 'bg-blue-50 text-blue-700 font-medium' : 'text-zinc-600'
                    }`}>
                    <span className="w-5 h-5 rounded bg-zinc-100 flex items-center justify-center shrink-0">
                      <LayoutGrid className={`w-3 h-3 ${d.id === activeId ? 'text-blue-500' : 'text-zinc-400'}`} />
                    </span>
                    <span className="truncate flex-1">{d.name}</span>
                    {d.id === activeId && <Check className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                    <span className="text-[10px] text-zinc-300 shrink-0">{new Date(d.createdAt).toLocaleDateString()}</span>
                  </button>
                ))}
                {designs.length === 0 && (
                  <div className="px-3 py-3 text-[11px] text-zinc-400 text-center">No saved designs yet</div>
                )}
                <div className="border-t border-zinc-100 mt-1.5 pt-1.5 space-y-0.5">
                  <button onClick={() => { const n = prompt('Design name'); if (n) createDesign(n.trim()); setShowDesigns(false); }}
                    className="w-full text-left px-3 py-1.5 text-[11px] text-blue-600 hover:bg-blue-50 flex items-center gap-2.5 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> New design
                  </button>
                  {activeDesign && (
                    <>
                      <button onClick={() => { const n = prompt('Rename', activeDesign.name); if (n) renameDesign(activeId, n.trim()); setShowDesigns(false); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                        &hellip; Rename
                      </button>
                      <button onClick={() => { exportDesign(); setShowDesigns(false); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export
                      </button>
                      <button onClick={() => { importDesign(); setShowDesigns(false); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] text-zinc-500 hover:bg-zinc-50 flex items-center gap-2.5 transition-colors">
                        <Upload className="w-3.5 h-3.5" /> Import
                      </button>
                      <div className="border-t border-zinc-100 my-1" />
                      <button onClick={() => { if (confirm(`Delete "${activeDesign.name}"?`)) deleteDesign(activeId); setShowDesigns(false); }}
                        className="w-full text-left px-3 py-1.5 text-[11px] text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 text-[11px] font-medium text-zinc-500">
          <span className="tabular-nums">{placed}</span>
          <span className="text-zinc-300">/</span>
          <span className="tabular-nums">{total}</span>
          <span className="text-zinc-400 ml-0.5">fields</span>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-0.5">
          <button onClick={undo} disabled={!canUndo}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 disabled:opacity-25 transition-colors"
            title="Undo (⌘Z)">
            <Undo2 className="w-4 h-4 text-zinc-500" />
          </button>
          <button onClick={redo} disabled={!canRedo}
            className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 disabled:opacity-25 transition-colors"
            title="Redo (⌘⇧Z)">
            <Redo2 className="w-4 h-4 text-zinc-500" />
          </button>
          <div className="w-px h-5 bg-zinc-200 mx-1.5" />
          <button onClick={reset}
            className="h-8 px-3 text-[11px] font-medium rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors flex items-center gap-1.5 shadow-sm">
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </header>

      {/* ══ Body ══ */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Left: Palette ── */}
        <aside className="w-[188px] shrink-0 bg-white border-r border-zinc-200/80 overflow-y-auto no-print">
          <div className="p-3.5">
            <div className="flex items-center gap-2 mb-4 mt-0.5">
              <PanelLeft className="w-4 h-4 text-zinc-400" />
              <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Fields</span>
            </div>

            {CATEGORIES.map(cat => {
              const items = ALL_FIELDS.filter(f => f.category === cat);
              const catUsed = items.filter(f => used.has(f.key)).length;
              const allUsed = catUsed === items.length;
              return (
                <div key={cat} className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className={`w-0.5 h-3 rounded-full shrink-0 ${CATEGORY_COLORS[cat]?.replace('text-', 'bg-') || 'bg-zinc-300'}`} />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide truncate">{cat}</span>
                    <span className={`ml-auto text-[10px] tabular-nums ${allUsed ? 'text-blue-500 font-medium' : 'text-zinc-300'}`}>{catUsed}/{items.length}</span>
                  </div>
                  <div className="space-y-0.5">
                    {items.map(f => {
                      const inUse = used.has(f.key);
                      const Icon = f.icon;
                      const catColor = CATEGORY_COLORS[cat] || 'text-zinc-400';
                      return (
                        <button
                          key={f.key}
                          onClick={() => { if (selId) assign(selId, f.key); }}
                          draggable
                          onDragStart={e => e.dataTransfer.setData('text/field', f.key)}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-2 group ${
                            inUse
                              ? 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70'
                              : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${inUse ? catColor : 'text-zinc-300 group-hover:text-zinc-400'} transition-colors`} />
                          <span className="text-[11px] font-medium truncate flex-1">{f.label}</span>
                          {inUse ? (
                            <Check className="w-3 h-3 shrink-0 text-blue-500" />
                          ) : (
                            <GripHorizontal className="w-3 h-3 text-zinc-200 opacity-0 group-hover:opacity-100 shrink-0 transition-opacity" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Canvas ── */}
        <div className="flex-1 overflow-auto canvas-bg p-10 pr-24">
          <div className="max-w-[960px] mx-auto space-y-8">

            {/* ══ Designer ══ */}
            <section className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
              {/* Designer header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center">
                    <LayoutGrid className="w-3.5 h-3.5 text-zinc-500" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-700">Designer</span>
                  {selCell ? (
                    <span className="text-[11px] text-zinc-400 font-mono ml-2 hidden sm:inline">
                      {selCell.row.name} &middot; col {selCell.ci + 1} &middot; <span className="text-blue-500 font-medium">{selCell.cell.width.toFixed(1)}%</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-zinc-400 ml-2 hidden sm:inline">Select a cell to edit</span>
                  )}
                </div>
                <div className="flex items-center gap-0.5">
                  <button onClick={() => setShowGrid(g => !g)}
                    className={`h-7 w-7 rounded-md flex items-center justify-center transition-colors ${
                      showGrid ? 'bg-blue-50 text-blue-600' : 'text-zinc-400 hover:bg-zinc-100'
                    }`}
                    title={`Grid lines: ${showGrid ? 'ON' : 'OFF'}`}>
                    <Grid3X3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Toolbar */}
              <div className="flex items-center gap-1 px-4 py-2.5 border-b border-zinc-100 bg-zinc-50/50 flex-wrap no-print">
                <div className="relative">
                  <button onClick={(e) => { if (selCell) { openMenu(e); } }} disabled={!selCell}
                    className="h-8 px-3 text-[11px] font-medium rounded-lg bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 shadow-sm">
                    <ArrowRightLeft className="w-3.5 h-3.5" /> Change <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>
                </div>
                <div className="w-px h-5 bg-zinc-200 mx-1" />
                <button onClick={() => selCell && removeCell(selCell.row.id, selCell.ci)} disabled={!selCell || (selCell ? selCell.row.cells.length <= 1 : true)}
                  className="h-8 px-2.5 text-[11px] rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 shadow-sm">
                  <Trash2 className="w-3.5 h-3.5" /> Cell
                </button>
                <button onClick={() => selCell && setSelId(addCell(selCell.row.id, selCell.ci))} disabled={!selCell}
                  className="h-8 px-2.5 text-[11px] rounded-lg bg-white border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-30 disabled:pointer-events-none transition-all flex items-center gap-1.5 shadow-sm"
                  title="Insert cell after selected">
                  <Plus className="w-3.5 h-3.5" /> Insert
                </button>
                <div className="w-px h-5 bg-zinc-200 mx-1" />
                <button onClick={() => selCell && moveCell(selCell.row.id, selCell.ci, -1)} disabled={!selCell || selCell.ci === 0}
                  className="h-8 w-8 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-25 disabled:pointer-events-none transition-all flex items-center justify-center shadow-sm">
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => selCell && moveCell(selCell.row.id, selCell.ci, 1)} disabled={!selCell || selCell.ci >= selCell.row.cells.length - 1}
                  className="h-8 w-8 rounded-lg bg-white border border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:border-zinc-300 disabled:opacity-25 disabled:pointer-events-none transition-all flex items-center justify-center shadow-sm">
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-5 bg-zinc-200 mx-1" />
                {(['left', 'center', 'right'] as const).map(a => {
                  const Icon = a === 'left' ? AlignLeft : a === 'center' ? AlignCenter : AlignRight;
                  const active = selCell?.cell.align === a || (!selCell?.cell.align && getAlign(selCell?.cell) === a);
                  return (
                    <button key={a}
                      onClick={() => selCell && setAlign(selId!, active ? undefined : a)}
                      disabled={!selCell}
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all disabled:opacity-25 disabled:pointer-events-none shadow-sm ${
                        active ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:border-zinc-300'
                      }`}
                      title={`Align ${a}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
                <button onClick={() => selCell && setWrapCell(selId!, !selCell.cell.wrap)}
                  disabled={!selCell}
                  className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-all disabled:opacity-25 disabled:pointer-events-none shadow-sm ${
                    selCell?.cell.wrap ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-zinc-200 text-zinc-400 hover:bg-zinc-50 hover:border-zinc-300'
                  }`}
                  title={`Wrap: ${selCell?.cell.wrap ? 'ON' : 'OFF'}`}>
                  <WrapText className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Ribbon rows */}
              <div className="p-5">
                <div className="space-y-6">
                {rows.map((row, ri) => (
                  <div key={row.id} className="group/row">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-semibold text-zinc-600 select-none">{row.name}</span>
                        <span className="text-[10px] text-zinc-300 select-none bg-zinc-100 px-1.5 py-0.5 rounded-full tabular-nums">
                          {row.cells.length}c &middot; {row.cells.reduce((s, c) => s + c.width, 0).toFixed(1)}%
                        </span>
                      </div>
                      <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                        <button onClick={() => moveRow(row.id, -1)} disabled={ri === 0}
                          className="p-1.5 rounded-md hover:bg-zinc-100 disabled:opacity-20 transition-colors"><ArrowUp className="w-3.5 h-3.5 text-zinc-400" /></button>
                        <button onClick={() => moveRow(row.id, 1)} disabled={ri === rows.length - 1}
                          className="p-1.5 rounded-md hover:bg-zinc-100 disabled:opacity-20 transition-colors"><ArrowDown className="w-3.5 h-3.5 text-zinc-400" /></button>
                        {rows.length > 1 && (
                          <button onClick={() => removeRow(row.id)}
                            className="p-1.5 rounded-md hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5 text-zinc-300 hover:text-red-400" /></button>
                        )}
                      </div>
                    </div>

                    <div style={{
                      fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '8pt', lineHeight: '1.1',
                      border: '1px solid #000', background: STYLE.bg, color: STYLE.fg,
                      display: 'flex', width: '100%', alignItems: 'stretch',
                    }} data-row={row.id}>
                      {row.cells.length === 0 ? (
                        <div className="py-3 text-center text-[11px] text-zinc-400 w-full">
                          Empty row &mdash; use <kbd className="px-1 py-0.5 bg-zinc-100 rounded text-[10px] font-mono">Insert</kbd> from the toolbar
                        </div>
                      ) : (
                        row.cells.map((c, ci) => {
                          const assigned = Boolean(c.field);
                          const isSel    = selId === c.id;
                          const align    = getAlign(c);
                          const label    = c.field === 'text' ? (c.textContent || 'Text') : getLabel(c.field);

                          return (
                            <React.Fragment key={c.id}>
                              <div
                                onDragOver={e => { e.preventDefault(); e.stopPropagation(); setBetweenDrop(`${row.id}-${ci}`); }}
                                onDragLeave={() => setBetweenDrop(null)}
                                onDrop={e => {
                                  e.stopPropagation(); setBetweenDrop(null);
                                  if (cellDrag) {
                                    const src = rows.find(r => r.id === cellDrag.rowId);
                                    const sci = src?.cells.findIndex(cc => cc.id === cellDrag.cellId);
                                    if (sci != null && sci >= 0) moveCellToRow(cellDrag.rowId, sci, row.id, ci);
                                    setCellDrag(null);
                                    return;
                                  }
                                  const k = e.dataTransfer.getData('text/field');
                                  if (k) setSelId(insertCellAt(row.id, ci, k));
                                }}
                                className={`${betweenDrop === `${row.id}-${ci}` ? 'w-[5pt] bg-blue-400 min-w-[5pt]' : 'w-0 min-w-0'}`}
                                style={{ height: 16, flexShrink: 0, transition: 'width 0.1s' }}
                              />

                              <div className="relative group/cell" style={{ flex: `0 0 ${c.width}%`, minWidth: 0 }}
                               ref={el => { if (el) cellRefs.current.set(c.id, el); else cellRefs.current.delete(c.id); }}>
                              <div
                                onClick={() => setSelId(c.id)}
                                onDoubleClick={(e) => { setSelId(c.id); openMenu(e); }}
                                onContextMenu={e => { e.preventDefault(); setSelId(c.id); openMenu(e); }}
                                draggable
                                onDragStart={e => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', ''); setCellDrag({ rowId: row.id, cellId: c.id }); }}
                                onDragEnd={() => { setCellDrag(null); setCellDropTarget(null); }}
                                onDragOver={e => {
                                  if (cellDrag && cellDrag.cellId !== c.id) {
                                    e.preventDefault();
                                    setCellDropTarget(c.id);
                                    e.dataTransfer.dropEffect = 'move';
                                  } else if (!cellDrag) {
                                    e.preventDefault();
                                    setDropHover(c.id);
                                  }
                                }}
                                onDragLeave={() => { setCellDropTarget(null); setDropHover(null); }}
                                onDrop={e => {
                                  e.preventDefault();
                                  if (cellDrag) {
                                    const src = rows.find(r => r.id === cellDrag.rowId);
                                    const sci = src?.cells.findIndex(cc => cc.id === cellDrag.cellId);
                                    if (sci != null && sci >= 0) moveCellToRow(cellDrag.rowId, sci, row.id, ci);
                                    setCellDrag(null); setCellDropTarget(null);
                                  } else {
                                    const k = e.dataTransfer.getData('text/field');
                                    if (k) assign(c.id, k);
                                    setDropHover(null);
                                  }
                                }}
                                className="relative cursor-pointer select-none"
                                style={{
                                  padding: ri === 0 ? '3pt 1pt' : '0 1pt 3pt 1pt',
                                  verticalAlign: 'middle',
                                  borderRight: ci < row.cells.length - 1 ? '1px solid #000' : 'none',
                                  borderBottom: '1px solid #000',
                                  borderLeft: cellDropTarget === c.id ? '3px solid #3b82f6' : 'none',
                                  outline: isSel ? '2px solid #3b82f6' : dropHover === c.id && !cellDrag ? '2px dashed #3b82f6' : 'none',
                                  outlineOffset: -2,
                                  background: cellDropTarget === c.id ? 'rgba(59,130,246,0.08)' : dropHover === c.id && !cellDrag ? 'rgba(59,130,246,0.06)' : isSel ? 'rgba(59,130,246,0.04)' : 'transparent',
                                  minHeight: 18,
                                  transition: 'background 0.1s, border-color 0.1s',
                                }}
                              >
                                <div style={{
                                  display: 'flex',
                                  fontSize: '8pt', lineHeight: 1.1,
                                  fontWeight: c.field === 'sceneNumber' ? 700 : 500,
                                  textTransform: c.field === 'set' ? 'uppercase' : 'none',
                                  color: assigned ? undefined : '#c4c4c4',
                                  overflow: c.wrap ? 'visible' : 'hidden',
                                }}>
                                  {(align === 'center' || align === 'right') && <span style={{ flex: '1 1 0' }} />}
                                  {c.prefix && <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{c.prefix}{'\u00A0'}</span>}
                                  <span style={{
                                    flexShrink: 1, minWidth: 0,
                                    overflow: c.wrap ? 'visible' : (ci < row.cells.length - 1 ? 'hidden' : 'visible'),
                                    textOverflow: c.wrap ? 'clip' : (ci < row.cells.length - 1 ? 'ellipsis' : 'clip'),
                                    whiteSpace: c.wrap ? 'normal' : 'nowrap',
                                    wordBreak: c.wrap ? 'break-word' : undefined,
                                  }}>{assigned ? label : 'Empty'}{c.suffix ? '\u00A0' + c.suffix : ''}</span>
                                  {(align === 'left' || align === 'center') && ci < row.cells.length - 1 && <span style={{ flex: '1 1 0' }} />}
                                </div>
                              </div>

                              <div
                                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); if (ci < row.cells.length - 1) { const leftSum = row.cells.slice(0, ci).reduce((s, c2) => s + c2.width, 0); const rightCells = row.cells.slice(ci + 1); const rightSum = rightCells.reduce((s, c2) => s + c2.width, 0); setResizing({ rowId: row.id, ci, sx: e.clientX, a: c.width, b: row.cells[ci+1].width, leftSum, rightSum, n: rightCells.length }); } }}
                                className="absolute right-0 top-0 bottom-0 w-[7px] cursor-col-resize z-10 group/h"
                              >
                                <div className="absolute right-0 top-1.5 bottom-1.5 w-[2px] bg-zinc-200 group-hover/h:bg-blue-400 group-active/h:bg-blue-500 transition-colors rounded-full" />
                              </div>
                            </div>
                            </React.Fragment>
                          );
                        })
                      )}
                      <button
                        onClick={() => setSelId(addCell(row.id, row.cells.length - 1))}
                        onDragOver={e => { e.preventDefault(); if (cellDrag) setCellDropTarget('end-' + row.id); else setDropHover(row.id); }}
                        onDragLeave={() => { setCellDropTarget(null); setDropHover(null); }}
                        onDrop={e => {
                          e.preventDefault();
                          setDropHover(null); setCellDropTarget(null);
                          if (cellDrag) {
                            const src = rows.find(r => r.id === cellDrag.rowId);
                            const sci = src?.cells.findIndex(cc => cc.id === cellDrag.cellId);
                            if (sci != null && sci >= 0) {
                              const srcRow = rows.find(r => r.id === cellDrag.rowId);
                              if (srcRow) moveCellToRow(cellDrag.rowId, sci, row.id, srcRow.id === row.id ? row.cells.length : row.cells.length);
                            }
                            setCellDrag(null);
                            return;
                          }
                          const k = e.dataTransfer.getData('text/field');
                          const f = FIELD_MAP[k];
                          if (k) setSelId(insertCellAt(row.id, row.cells.length, k));
                          else setSelId(addCell(row.id, row.cells.length - 1));
                        }}
                        className={`flex items-center justify-center cursor-pointer transition-colors ${
                          dropHover === row.id || cellDropTarget === 'end-' + row.id
                            ? 'bg-blue-100'
                            : 'hover:bg-zinc-50'
                        }`}
                        style={{
                          flexShrink: 0, width: '48px',
                          borderBottom: '1px solid #000',
                          borderLeft: '1px solid rgba(0,0,0,0.08)',
                        }}
                      >
                        <Plus className={`w-3.5 h-3.5 ${dropHover === row.id || cellDropTarget === 'end-' + row.id ? 'text-blue-500' : 'text-zinc-300 group-hover/row:text-zinc-500'}`} />
                      </button>

                    </div>
                  </div>
                ))}
              </div>

              <button onClick={addRow}
                className="mt-5 w-full py-3 text-[11px] font-medium rounded-xl border-2 border-dashed border-zinc-200 text-zinc-400 hover:border-zinc-300 hover:text-zinc-500 hover:bg-zinc-50 transition-all flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Add Row
              </button>
              </div>
            </section>

            {/* ══ Live Preview ══ */}
            <section className="bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-zinc-100">
                <div className="w-6 h-6 rounded-md bg-zinc-100 flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 text-zinc-500" />
                </div>
                <span className="text-xs font-semibold text-zinc-700">Live Preview</span>
                <span className="ml-auto text-[10px] font-medium text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-full">Sample data</span>
              </div>

              <div className="p-5">
                <div className="inline-block" style={{
                  fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '8pt', lineHeight: '1.1',
                  border: '1px solid #000', background: STYLE.bg, color: STYLE.fg,
                  width: '100%',
                }}>
                  {rows.map((row, ri) => (
                    <div key={row.id} style={{
                      display: 'flex',
                      borderBottom: showGrid && ri < rows.length - 1 ? '1px solid rgba(0,0,0,0.12)' : 'none',
                    }}>
                      {row.cells.map((c, ci) => {
                        const align = getAlign(c);
                        const val = c.field === 'text' ? (c.textContent || '') : c.field ? (cellValue(c.field) || '\u00A0') : '\u00A0';
                        return (
                          <div key={c.id} style={{
                            flex: `0 0 ${c.width}%`, minWidth: 0, textAlign: align,
                            padding: ri === 0 ? '3pt 1pt' : '0 1pt 3pt 1pt',
                            verticalAlign: 'middle',
                            borderRight: ci < row.cells.length - 1 ? (showGrid ? '1px solid rgba(0,0,0,0.12)' : `1px solid ${STYLE.bg}`) : 'none',
                            overflow: c.wrap ? 'visible' : (ci < row.cells.length - 1 ? 'hidden' : 'visible'),
                            fontSize: '8pt', lineHeight: 1.1,
                            fontWeight: c.field === 'sceneNumber' ? 700 : 400,
                            textTransform: c.field === 'set' ? 'uppercase' : 'none',
                          }}>
                            <div style={{ display: 'flex' }}>
                              {(align === 'center' || align === 'right') && <span style={{ flex: '1 1 0' }} />}
                              {c.prefix && <span style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>{c.prefix}{'\u00A0'}</span>}
                              <span style={{
                                flexShrink: 1, minWidth: 0,
                                overflow: c.wrap ? 'visible' : (ci < row.cells.length - 1 ? 'hidden' : 'visible'),
                                textOverflow: c.wrap ? 'clip' : (ci < row.cells.length - 1 ? 'ellipsis' : 'clip'),
                                whiteSpace: c.wrap ? 'normal' : 'nowrap',
                                wordBreak: c.wrap ? 'break-word' : undefined,
                              }}>{val}{c.suffix ? '\u00A0' + c.suffix : ''}</span>
                              {(align === 'left' || align === 'center') && ci < row.cells.length - 1 && <span style={{ flex: '1 1 0' }} />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* ── Floating Change dropdown ── */}
      {changeOpen && selCell && (() => {
        const PW = 230;
        const PH = 380;
        const px = Math.max(4, Math.min(dropdownPos.x, window.innerWidth - PW - 4));
        const py = dropdownPos.y + PH > window.innerHeight ? Math.max(4, dropdownPos.y - PH - 8) : Math.min(dropdownPos.y, window.innerHeight - PH - 4);
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setChangeOpen(false)} />
            <div className="fixed z-50 bg-white border border-zinc-200 rounded-xl shadow-2xl py-1.5 overflow-y-auto"
              style={{ left: px, top: py, minWidth: PW, maxWidth: 260, maxHeight: PH }}>
              <div className="px-3 pb-1 mb-1 border-b border-zinc-100">
                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">Change field</span>
              </div>
              {ALL_FIELDS.filter(f => !used.has(f.key) || f.key === selCell.cell.field).map(f => {
                const Icon = f.icon;
                const color = CATEGORY_COLORS[f.category] || 'text-zinc-500';
                return (
                  <button key={f.key}
                    onClick={() => { assign(selId!, f.key); setChangeOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-[11px] hover:bg-zinc-50 flex items-center gap-2.5 transition-colors ${
                      f.key === selCell.cell.field ? 'bg-blue-50 text-blue-700 font-medium' : 'text-zinc-600'
                    }`}>
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${f.key === selCell.cell.field ? 'text-blue-500' : color}`} />
                    <span className="flex-1">{f.label}</span>
                    {f.key === selCell.cell.field && <Check className="w-3 h-3 text-blue-500 shrink-0" />}
                    <span className="text-[9px] text-zinc-300 tabular-nums font-mono">{f.defaultWidth}%</span>
                  </button>
                );
              })}
              {selCell.cell.field === 'text' && (
                <div className="px-3 py-2 border-t border-zinc-100 mt-1">
                  <textarea
                    value={selCell.cell.textContent || ''}
                    onChange={e => { e.stopPropagation(); setTextContent(selId!, e.target.value); }}
                    placeholder="Type text..."
                    className="w-full px-2 py-1.5 text-[11px] rounded-lg border border-zinc-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-zinc-50 resize-none"
                    rows={2}
                    onClick={e => e.stopPropagation()}
                  />
                </div>
              )}
              {selCell.cell.field && selCell.cell.field !== 'text' && (
                <div className="px-3 py-2 border-t border-zinc-100 mt-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      value={selCell.cell.prefix || ''}
                      onChange={e => { e.stopPropagation(); setAffix(selId!, 'prefix', e.target.value); }}
                      placeholder="Prefix..."
                      className="flex-1 min-w-0 px-2 py-1.5 text-[11px] rounded-lg border border-zinc-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-zinc-50"
                      onClick={e => e.stopPropagation()}
                    />
                    <span className="text-[10px] text-zinc-300 shrink-0">&gt;</span>
                    <input
                      value={selCell.cell.suffix || ''}
                      onChange={e => { e.stopPropagation(); setAffix(selId!, 'suffix', e.target.value); }}
                      placeholder="Suffix..."
                      className="flex-1 min-w-0 px-2 py-1.5 text-[11px] rounded-lg border border-zinc-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 bg-zinc-50"
                      onClick={e => e.stopPropagation()}
                    />
                  </div>
                </div>
              )}
              {selCell.cell.field && (
                <button onClick={() => { clearCell(selId!); setChangeOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[11px] text-red-500 hover:bg-red-50 flex items-center gap-2.5 border-t border-zinc-100 mt-1 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Remove field
                </button>
              )}
              {selCell.row.cells.length > 1 && (
                <button onClick={() => { removeCell(selCell.row.id, selCell.ci); setChangeOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[11px] text-red-500 hover:bg-red-50 flex items-center gap-2.5 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete cell
                </button>
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}

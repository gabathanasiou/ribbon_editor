import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GripVertical, Plus, Trash2, X, ArrowUpDown } from 'lucide-react';

interface RibbonCell {
  id: string;
  col: number;
  row: number;
  elementType: string | null;
  label: string;
}

interface ColumnDef {
  id: string;
  width: number;
}

type ElementType = {
  key: string;
  label: string;
};

const AVAILABLE_ELEMENTS: ElementType[] = [
  { key: 'dayNumber', label: 'Day #' },
  { key: 'date', label: 'Date' },
  { key: 'set', label: 'Set' },
  { key: 'cast', label: 'Cast' },
  { key: 'pages', label: 'Pages' },
  { key: 'location', label: 'Location' },
  { key: 'props', label: 'Props' },
  { key: 'wardrobe', label: 'Wardrobe' },
  { key: 'makeup', label: 'Makeup / Hair' },
  { key: 'sfx', label: 'SFX' },
  { key: 'vfx', label: 'VFX' },
  { key: 'sound', label: 'Sound' },
  { key: 'music', label: 'Music' },
  { key: 'animals', label: 'Animals' },
  { key: 'weapons', label: 'Weapons' },
  { key: 'greenery', label: 'Greenery' },
  { key: 'artDept', label: 'Art Dept' },
  { key: 'extras', label: 'Supporting Artists' },
  { key: 'stunts', label: 'Stunts' },
  { key: 'vehicles', label: 'Vehicles' },
  { key: 'notes', label: 'Notes' },
  { key: 'callTime', label: 'Call Time' },
  { key: 'intExt', label: 'I/E' },
  { key: 'dayNight', label: 'D/N' },
  { key: 'description', label: 'Synopsis' },
  { key: 'scriptDay', label: 'Script Day' },
  { key: 'sceneNumber', label: 'Scene #' },
];

const RIBBON_ROWS = 2;
const DEFAULT_COLUMNS: ColumnDef[] = [
  { id: 'c1', width: 40 },
  { id: 'c2', width: 35 },
  { id: 'c3', width: 40 },
  { id: 'c4', width: 40 },
  { id: 'c5', width: 200 },
  { id: 'c6', width: 75 },
  { id: 'c7', width: 50 },
  { id: 'c8', width: 50 },
];

function nextCellId() { return `cell-${Math.random().toString(36).slice(2)}`; }

function buildDefaultCells(): RibbonCell[] {
  const defaults: [number, number, string, string][] = [
    [0, 0, 'dayNumber', 'DAY #1'],
    [5, 0, 'date', 'Monday, 1 June 2026'],
    [1, 1, 'callTime', '08:00'],
    [4, 1, 'set', 'KITCHEN'],
    [6, 1, 'cast', '1, 2, 3'],
    [7, 1, 'pages', '4 3/8 pgs'],
  ];
  return defaults.map(([col, row, type, label]) => ({
    id: nextCellId(), col, row, elementType: type, label,
  }));
}

const SAMPLE_SCENES = [
  { scene: '1', set: 'KITCHEN', cast: '1. JOHN, 2. MARY', pages: '2 3/8 pgs', desc: 'John makes breakfast' },
  { scene: '2', set: 'KITCHEN', cast: '1. JOHN', pages: '1 pgs', desc: 'Phone call with Mary' },
  { scene: '3', set: 'LIVING ROOM', cast: '2. MARY, 3. ROBERT', pages: '1 5/8 pgs', desc: 'Mary confronts Robert' },
];

export default function App() {
  const [columns, setColumns] = useState<ColumnDef[]>(DEFAULT_COLUMNS);
  const [cells, setCells] = useState<RibbonCell[]>(buildDefaultCells);
  const [draggingEl, setDraggingEl] = useState<ElementType | null>(null);
  const [dropTarget, setDropTarget] = useState<{col: number; row: number} | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{colIdx: number; startX: number; startW: number} | null>(null);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  const totalWidth = columns.reduce((s, c) => s + c.width, 0);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (resizing) {
        const w = Math.max(30, resizing.startW + e.clientX - resizing.startX);
        setColumns(prev => prev.map((c, i) => i === resizing.colIdx ? { ...c, width: w } : c));
      }
    };
    const onUp = () => setResizing(null);
    if (resizing) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
    }
  }, [resizing]);

  const getCell = (col: number, row: number): RibbonCell | undefined =>
    cells.find(c => c.col === col && c.row === row);

  const handleDrop = (col: number, row: number) => {
    if (!draggingEl) return;
    setDraggingEl(null);
    setDropTarget(null);
    setCells(prev => {
      const existing = prev.find(c => c.col === col && c.row === row);
      if (existing) {
        return prev.map(c => c.id === existing.id ? { ...c, elementType: draggingEl.key, label: draggingEl.label } : c);
      }
      return [...prev, { id: nextCellId(), col, row, elementType: draggingEl.key, label: draggingEl.label }];
    });
  };

  const handleDragStart = (el: ElementType) => {
    setDraggingEl(el);
  };

  const removeCell = (cellId: string) => {
    setCells(prev => prev.filter(c => c.id !== cellId));
  };

  const addColumn = (after: number) => {
    const newCol: ColumnDef = { id: `c${Date.now()}`, width: 80 };
    setColumns(prev => [...prev.slice(0, after + 1), newCol, ...prev.slice(after + 1)]);
    setCells(prev => prev.map(c => c.col > after ? { ...c, col: c.col + 1 } : c));
  };

  const removeColumn = (idx: number) => {
    if (columns.length <= 1) return;
    setColumns(prev => prev.filter((_, i) => i !== idx));
    setCells(prev => prev.filter(c => c.col !== idx).map(c => c.col > idx ? { ...c, col: c.col - 1 } : c));
  };

  const updateCellLabel = (id: string, label: string) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, label } : c));
  };

  const renderRibbonPreview = () => {
    const headerRow = cells.filter(c => c.row === 0);
    const infoRow = cells.filter(c => c.row === 1);

    return (
      <div style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '11px', lineHeight: 1.2 }}>
        <div style={{
          background: '#000', color: '#fff', border: '2px solid #000',
          maxWidth: totalWidth + 4, margin: '0 auto',
        }}>
          {/* Row 1: Header */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                {columns.map((col, ci) => {
                  const cell = headerRow.find(c => c.col === ci);
                  return (
                    <td key={col.id} style={{
                      width: col.width, padding: '4px 6px',
                      fontSize: cell ? '9pt' : '8pt', fontWeight: cell ? 700 : 400,
                      textAlign: ci === 5 ? 'center' : 'left',
                      borderRight: ci < columns.length - 1 ? '1px solid #52525b' : 'none',
                    }}>
                      {cell?.label || ''}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
          {/* Row 2: Info */}
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                {columns.map((col, ci) => {
                  const cell = infoRow.find(c => c.col === ci);
                  return (
                    <td key={col.id} style={{
                      width: col.width, padding: '2px 6px',
                      fontSize: '8pt', fontWeight: cell ? 500 : 400,
                      color: cell ? '#fff' : '#a1a1aa',
                      textAlign: 'left',
                      borderRight: ci < columns.length - 1 ? '1px solid #52525b' : 'none',
                    }}>
                      {(cell?.elementType === 'callTime' || cell?.elementType === 'pages') && cell.label
                        ? cell.label
                        : cell?.label || ''}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Scene preview rows */}
        <div style={{ maxWidth: totalWidth + 4, margin: '0 auto', marginTop: 8 }}>
          <div style={{ fontSize: '8pt', color: '#71717a', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' }}>
            Scene Preview
          </div>
          {SAMPLE_SCENES.map((s, idx) => {
            const hasCast = cells.some(c => c.elementType === 'cast');
            const hasSet = cells.some(c => c.elementType === 'set');
            const hasPages = cells.some(c => c.elementType === 'pages');
            const hasDesc = cells.some(c => c.elementType === 'description');
            if (!hasCast && !hasSet && !hasPages && !hasDesc) return null;
            return (
              <div key={idx} style={{
                border: '1px solid #d4d4d8', borderBottom: idx < SAMPLE_SCENES.length - 1 ? 'none' : '1px solid #d4d4d8',
                padding: '3px 6px', fontSize: '8pt', background: idx % 2 ? '#fafafa' : '#fff',
                display: 'flex', gap: 12,
              }}>
                <span style={{ fontWeight: 700, minWidth: 28 }}>{s.scene}</span>
                {hasSet && <span style={{ flex: 1 }}>{s.set}</span>}
                {hasCast && <span style={{ flex: 1 }}>{s.cast}</span>}
                {hasPages && <span style={{ width: 70, textAlign: 'right' }}>{s.pages}</span>}
                {hasDesc && <span style={{ flex: 2, color: '#71717a' }}>{s.desc}</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-200" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '11px' }}>
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-300 shadow-sm shrink-0">
        <h1 className="text-sm font-bold text-zinc-900">Ribbon Editor</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">{columns.length} cols, {cells.length} cells</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Element palette */}
        <div className="w-[200px] shrink-0 bg-white border-r border-zinc-300 overflow-y-auto p-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2 px-1">
            Elements (drag to ribbon)
          </div>
          <div className="space-y-0.5">
            {AVAILABLE_ELEMENTS.map(el => (
              <div
                key={el.key}
                draggable
                onDragStart={() => handleDragStart(el)}
                onDragEnd={() => { setDraggingEl(null); setDropTarget(null); }}
                className="px-2 py-1.5 text-[10px] rounded cursor-grab hover:bg-zinc-100 text-zinc-600 border border-zinc-200 bg-zinc-50 active:cursor-grabbing select-none"
              >
                {el.label}
              </div>
            ))}
          </div>
        </div>

        {/* Center: Ribbon editor canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <div style={{ width: totalWidth + 40, margin: '0 auto' }}>
              {/* Column headers */}
              <div className="flex mb-0">
                <div style={{ width: 20, }} />
                {columns.map((col, ci) => (
                  <div key={col.id} style={{ width: col.width }} className="relative">
                    <div className="flex items-center justify-center gap-0.5 px-1 py-1 bg-zinc-100 border border-zinc-300 border-b-0 text-[10px] text-zinc-500">
                      <button onClick={() => addColumn(ci)} className="p-0.5 hover:bg-zinc-200 rounded" title="Add column"><Plus className="w-2.5 h-2.5" /></button>
                      <button onClick={() => removeColumn(ci)} className="p-0.5 hover:bg-red-100 text-red-400 rounded" title="Remove"><Trash2 className="w-2.5 h-2.5" /></button>
                    </div>
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-400 z-10"
                      onMouseDown={e => { e.preventDefault(); setResizing({ colIdx: ci, startX: e.clientX, startW: col.width }); }}
                    />
                  </div>
                ))}
              </div>

              {/* Ribbon rows */}
              {[0, 1].map(row => (
                <div key={row} className="flex" style={{ minHeight: row === 0 ? 36 : 28 }}>
                  <div className="flex items-center justify-center text-[10px] text-zinc-400 font-bold uppercase" style={{ width: 20, writingMode: 'vertical-lr' }}>
                    {row === 0 ? 'HDR' : 'INFO'}
                  </div>
                  {columns.map((col, ci) => {
                    const cell = getCell(ci, row);
                    const isTarget = dropTarget?.col === ci && dropTarget?.row === row;
                    return (
                      <div
                        key={`${col.id}-${row}`}
                        style={{ width: col.width }}
                        className={`border border-zinc-200 p-0.5 relative transition-colors
                          ${isTarget ? 'bg-blue-50 border-blue-400' : row === 0 ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-700 border-zinc-600'}
                          ${selectedCol === ci ? 'ring-1 ring-blue-400' : ''}`}
                        onDragOver={e => { e.preventDefault(); setDropTarget({ col: ci, row }); }}
                        onDragLeave={() => setDropTarget(null)}
                        onDrop={() => handleDrop(ci, row)}
                        onClick={() => { setSelectedCol(ci); if (cell) setEditingCell(cell.id); }}
                      >
                        {cell ? (
                          <div className="flex items-start gap-0.5">
                            {editingCell === cell.id ? (
                              <input
                                autoFocus
                                value={cell.label}
                                onChange={e => updateCellLabel(cell.id, e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={e => { if (e.key === 'Enter') setEditingCell(null); }}
                                className={`w-full bg-transparent outline-none text-[9px] px-0.5 py-0.5 ${row === 0 ? 'text-white' : 'text-white'}`}
                              />
                            ) : (
                              <span
                                className={`flex-1 text-[9px] truncate cursor-text ${row === 0 ? 'text-white' : 'text-zinc-200'}`}
                                onDoubleClick={() => setEditingCell(cell.id)}
                              >
                                {cell.label || `(${cell.elementType})`}
                              </span>
                            )}
                            <button onClick={() => removeCell(cell.id)} className="shrink-0 p-0.5 opacity-40 hover:opacity-100 text-red-400"><X className="w-2.5 h-2.5" /></button>
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-500 opacity-30">
                            <span className="truncate">{isTarget && draggingEl ? draggingEl.label : 'drop'}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}

              {/* Editing help */}
              <div className="mt-2 text-[9px] text-zinc-400">
                Drag elements from the left panel into cells. Double-click to edit labels. Drag column edges to resize.
              </div>
            </div>
          </div>

          {/* Bottom: Live preview */}
          <div className="shrink-0 bg-white border-t border-zinc-300 p-4 max-h-[320px] overflow-auto">
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Live Preview</div>
            {renderRibbonPreview()}
          </div>
        </div>

        {/* Right: Column widths */}
        <div className="w-[120px] shrink-0 bg-white border-l border-zinc-300 overflow-y-auto p-2">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Widths</div>
          {columns.map((col, ci) => (
            <div key={col.id} className="flex items-center gap-1 mb-1">
              <span className="text-[9px] text-zinc-400 w-6">{ci + 1}</span>
              <input
                type="number"
                value={col.width}
                onChange={e => {
                  const w = Math.max(20, parseInt(e.target.value) || 20);
                  setColumns(prev => prev.map((c, i) => i === ci ? { ...c, width: w } : c));
                }}
                className="w-full border border-zinc-200 rounded px-1 py-0.5 text-[10px]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

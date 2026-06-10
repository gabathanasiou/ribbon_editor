import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, GripVertical, ArrowUpDown, Columns2, PaintBucket } from 'lucide-react';

interface Cell {
  id: string;
  content: string;
  row: number;
  col: number;
  rowSpan?: number;
}

interface ColumnDef {
  id: string;
  label: string;
  width: number;
}

type RibbonRow = 'title' | 'info' | 'sw' | 'fw';

const RIBBON_ROWS: RibbonRow[] = ['title', 'info', 'sw', 'fw'];
const ROW_HEIGHTS: Record<RibbonRow, number> = { title: 40, info: 32, sw: 28, fw: 28 };

const INITIAL_COLUMNS: ColumnDef[] = [
  { id: 'day', label: 'Day / Date', width: 90 },
  { id: 'set', label: 'Set', width: 120 },
  { id: 'cast', label: 'Cast', width: 150 },
  { id: 'pages', label: 'Pages', width: 60 },
  { id: 'loc', label: 'Location', width: 120 },
  { id: 'props', label: 'Props', width: 120 },
  { id: 'wardrobe', label: 'Wardrobe', width: 120 },
  { id: 'makeup', label: 'Makeup', width: 100 },
  { id: 'notes', label: 'Notes', width: 140 },
];

const SAMPLE_ELEMENTS: Record<string, string[]> = {
  cast: ['1. JOHN', '2. MARY', '3. ROBERT', '4. LISA'],
  set: ['KITCHEN', 'LIVING ROOM', 'HALLWAY', 'GARAGE'],
  props: ['GUN', 'BADGE', 'CUFFS', 'RADIO'],
  wardrobe: ['UNIFORM', 'DRESS'],
  makeup: ['WOUND FX', 'BLOOD PACK'],
  vehicles: ['SEDAN', 'SUV', 'MOTORCYCLE'],
};

let uid = 0;
function nextId() { return `c${++uid}`; }

function buildInitialCells(): Cell[] {
  const cells: Cell[] = [];
  const merged: Record<string, { firstRow: number; cell: Cell }> = {};

  for (const col of INITIAL_COLUMNS) {
    for (let ri = 0; ri < RIBBON_ROWS.length; ri++) {
      const row = RIBBON_ROWS[ri];
      if (row === 'title') {
        cells.push({ id: nextId(), content: col.label, row: ri, col: INITIAL_COLUMNS.indexOf(col) });
      } else if (row === 'info' && col.id === 'cast') {
        const key = `${col.id}-merged`;
        const c: Cell = { id: nextId(), content: '', row: ri, col: INITIAL_COLUMNS.indexOf(col), rowSpan: 2 };
        merged[key] = { firstRow: ri, cell: c };
        cells.push(c);
      } else {
        const mergeKey = `${col.id}-merged`;
        if (merged[mergeKey] && ri > merged[mergeKey].firstRow && ri < merged[mergeKey].firstRow + (merged[mergeKey].cell.rowSpan || 1)) {
          continue;
        }
        cells.push({ id: nextId(), content: '', row: ri, col: INITIAL_COLUMNS.indexOf(col) });
      }
    }
  }
  return cells;
}

export default function App() {
  const [columns, setColumns] = useState<ColumnDef[]>(INITIAL_COLUMNS);
  const [cells, setCells] = useState<Cell[]>(buildInitialCells);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [rowHeights, setRowHeights] = useState<Record<RibbonRow, number>>({ ...ROW_HEIGHTS });
  const [dragging, setDragging] = useState<{ colIdx: number; startX: number; startW: number } | null>(null);
  const [draggingRow, setDraggingRow] = useState<{ row: RibbonRow; startY: number; startH: number } | null>(null);
  const [elementPanel, setElementPanel] = useState(false);
  const [selectedCol, setSelectedCol] = useState<number | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const colCount = columns.length;

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragging) {
        const diff = e.clientX - dragging.startX;
        const newW = Math.max(50, dragging.startW + diff);
        setColumns(prev => prev.map((c, i) => i === dragging.colIdx ? { ...c, width: newW } : c));
      }
      if (draggingRow) {
        const diff = e.clientY - dragging.startY;
        const newH = Math.max(20, draggingRow.startH + diff);
        setRowHeights(prev => ({ ...prev, [draggingRow.row]: newH }));
      }
    };
    const onUp = () => { setDragging(null); setDraggingRow(null); };
    if (dragging || draggingRow) {
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      return () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
    }
  }, [dragging, draggingRow]);

  const addColumn = useCallback((afterIdx: number) => {
    const newCol: ColumnDef = { id: `col-${Date.now()}`, label: 'New', width: 100 };
    setColumns(prev => [...prev.slice(0, afterIdx + 1), newCol, ...prev.slice(afterIdx + 1)]);
    const newCells = cells.map(c => c.col > afterIdx ? { ...c, col: c.col + 1 } : c);
    for (let r = 0; r < RIBBON_ROWS.length; r++) {
      newCells.push({ id: nextId(), content: r === 0 ? 'New' : '', row: r, col: afterIdx + 1 });
    }
    setCells(newCells);
  }, [cells]);

  const removeColumn = useCallback((idx: number) => {
    if (columns.length <= 1) return;
    setColumns(prev => prev.filter((_, i) => i !== idx));
    const remain = cells.filter(c => c.col !== idx).map(c => c.col > idx ? { ...c, col: c.col - 1 } : c);
    setCells(remain);
  }, [cells, columns]);

  const updateCell = useCallback((id: string, content: string) => {
    setCells(prev => prev.map(c => c.id === id ? { ...c, content } : c));
  }, []);

  const mergeCells = useCallback((colIdx: number, fromRow: number, toRow: number) => {
    if (fromRow >= toRow) return;
    const span = toRow - fromRow + 1;
    setCells(prev => {
      const next = prev.map(c => c.col === colIdx && c.row === fromRow ? { ...c, rowSpan: span } : c);
      return next.filter(c => !(c.col === colIdx && c.row > fromRow && c.row <= toRow));
    });
  }, []);

  const splitCells = useCallback((colIdx: number, row: number) => {
    setCells(prev => {
      const target = prev.find(c => c.col === colIdx && c.row === row);
      if (!target || !target.rowSpan || target.rowSpan <= 1) return prev;
      const next = prev.map(c => c.id === target.id ? { ...c, rowSpan: undefined } : c);
      for (let r = row + 1; r < row + target.rowSpan; r++) {
        next.push({ id: nextId(), content: '', row: r, col: colIdx });
      }
      return next;
    });
  }, []);

  const getCellAt = (colIdx: number, row: number): Cell | undefined => {
    for (const c of cells) {
      if (c.col !== colIdx) continue;
      const span = c.rowSpan || 1;
      if (row >= c.row && row < c.row + span) return c;
    }
    return undefined;
  };

  const handleCellDoubleClick = (colIdx: number, row: number) => {
    const cell = getCellAt(colIdx, row);
    if (!cell) return;
    setSelectedCol(colIdx);
    setEditingCell(cell.id);
    setEditText(cell.content);
  };

  const commitEdit = () => {
    if (editingCell) {
      updateCell(editingCell, editText);
      setEditingCell(null);
    }
  };

  const rowBg = (row: RibbonRow) =>
    row === 'title' ? 'bg-zinc-900 text-white' :
    row === 'info' ? 'bg-zinc-100' :
    row === 'sw' ? 'bg-emerald-50' :
    'bg-emerald-50';

  const rowLabel = (row: RibbonRow) =>
    row === 'title' ? 'Day Title' :
    row === 'info' ? 'Info' :
    row === 'sw' ? 'SW' :
    'FW';

  const handleDragCol = (colIdx: number) => {
    if (colIdx < colCount - 1) {
      const a = columns.map(c => ({ ...c }));
      [a[colIdx], a[colIdx + 1]] = [a[colIdx + 1], a[colIdx]];
      setColumns(a);
      setCells(prev => prev.map(c => {
        if (c.col === colIdx) return { ...c, col: colIdx + 1 };
        if (c.col === colIdx + 1) return { ...c, col: colIdx };
        return c;
      }));
    }
  };

  return (
    <div className="h-screen flex flex-col bg-zinc-200" style={{ fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '9px' }}>
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-zinc-300 shadow-sm shrink-0">
        <h1 className="text-sm font-bold text-zinc-900">Ribbon Editor</h1>
        <div className="flex items-center gap-2">
          <button onClick={() => setElementPanel(p => !p)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-zinc-100 hover:bg-zinc-200 rounded-md transition-colors">
            <PaintBucket className="w-3.5 h-3.5" /> Elements
          </button>
          <span className="text-xs text-zinc-400">{columns.length} columns, {cells.length} cells</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-auto" ref={gridRef}>
          <table className="border-collapse" style={{ minWidth: columns.reduce((s, c) => s + c.width, 0) + 60 }}>
            <thead>
              <tr>
                <th className="w-[60px] sticky left-0 bg-zinc-100 border-r border-b border-zinc-300 z-10" />
                {columns.map((col, ci) => (
                  <th key={col.id} className="relative border-r border-b border-zinc-300 bg-zinc-100 p-0 select-none" style={{ width: col.width, minWidth: col.width }}>
                    <div className="flex items-center justify-between px-1.5 py-1">
                      <button onClick={() => addColumn(ci)} className="p-0.5 rounded hover:bg-zinc-200" title="Add column">
                        <Plus className="w-3 h-3 text-zinc-400" />
                      </button>
                      <span className="text-[10px] font-semibold text-zinc-600 truncate">{col.label}</span>
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => handleDragCol(ci)} className="p-0.5 rounded hover:bg-zinc-200" title="Swap right">
                          <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                        </button>
                        <button onClick={() => removeColumn(ci)} className="p-0.5 rounded hover:bg-red-100 text-zinc-400 hover:text-red-500" title="Remove">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div
                      className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-blue-400 z-20"
                      onMouseDown={e => { e.preventDefault(); setDragging({ colIdx: ci, startX: e.clientX, startW: col.width }); }}
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RIBBON_ROWS.map((row, ri) => (
                <tr key={row}>
                  <td
                    className="sticky left-0 bg-zinc-100 border-r border-b border-zinc-300 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-500 z-10 select-none relative"
                    style={{ height: rowHeights[row] }}
                  >
                    {rowLabel(row)}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1.5 cursor-row-resize hover:bg-blue-400 z-20"
                      onMouseDown={e => { e.preventDefault(); setDraggingRow({ row, startY: e.clientY, startH: rowHeights[row] }); }}
                    />
                  </td>
                  {columns.map((col, ci) => {
                    const cell = getCellAt(ci, ri);
                    const isEditing = editingCell === cell?.id;
                    const spanH = (cell?.rowSpan || 1) * rowHeights[row] + (cell?.rowSpan || 1 > 1 ? (cell!.rowSpan! - 1) * 1 : 0);
                    const isFirstOfSpan = cell?.row === ri;
                    const isPartOfSpan = cell && !isFirstOfSpan;

                    if (isPartOfSpan) return null;

                    return (
                      <td
                        key={`${col.id}-${ri}`}
                        className={`border-r border-zinc-300 p-0 relative ${rowBg(row)} ${selectedCol === ci ? 'ring-2 ring-blue-400 ring-inset' : ''}`}
                        style={{ width: col.width, minWidth: col.width, height: rowHeights[row] }}
                        rowSpan={isFirstOfSpan ? cell?.rowSpan || 1 : 1}
                        onDoubleClick={() => handleCellDoubleClick(ci, ri)}
                      >
                        {isEditing && cell ? (
                          <textarea
                            autoFocus
                            value={editText}
                            onChange={e => setEditText(e.target.value)}
                            onBlur={commitEdit}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); commitEdit(); } if (e.key === 'Escape') { setEditingCell(null); } }}
                            className="w-full h-full resize-none bg-white/80 border-2 border-blue-400 outline-none p-1 text-[10px]"
                            style={{ minHeight: 40 }}
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center p-1 text-[10px] cursor-text hover:bg-black/5 whitespace-pre-wrap break-words leading-tight"
                            style={{ minHeight: cell?.rowSpan ? spanH - 2 : rowHeights[row] - 2 }}
                            title="Double-click to edit"
                          >
                            {cell?.content || ''}
                          </div>
                        )}
                        {isFirstOfSpan && (
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-0.5 opacity-0 hover:opacity-100 transition-opacity">
                            {cell?.rowSpan && cell.rowSpan > 1 ? (
                              <button onClick={() => splitCells(ci, ri)} className="px-1 py-0.5 bg-zinc-700 text-white text-[9px] rounded" title="Split">
                                ✂ Split
                              </button>
                            ) : ri < RIBBON_ROWS.length - 1 ? (
                              <button onClick={() => mergeCells(ci, ri, ri + 1)} className="px-1 py-0.5 bg-blue-500 text-white text-[9px] rounded" title="Merge down">
                                ⬍ Merge
                              </button>
                            ) : null}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {elementPanel && (
          <div className="w-[220px] shrink-0 bg-white border-l border-zinc-300 overflow-y-auto p-3 space-y-4">
            <h2 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Elements</h2>
            {Object.entries(SAMPLE_ELEMENTS).map(([cat, items]) => (
              <div key={cat}>
                <div className="text-[10px] font-semibold text-zinc-400 uppercase mb-1">{cat}</div>
                <div className="space-y-0.5">
                  {items.map(item => (
                    <button
                      key={item}
                      onClick={() => {
                        if (editingCell && selectedCol != null) {
                          const cell = getCellAt(selectedCol - 1 >= 0 ? selectedCol - 1 : 0, RIBBON_ROWS.indexOf('info'));
                          if (cell) setEditText(prev => prev ? `${prev}, ${item}` : item);
                        }
                      }}
                      className="block w-full text-left px-2 py-1 text-[10px] rounded hover:bg-zinc-100 text-zinc-600 truncate"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button onClick={() => setElementPanel(false)} className="text-[10px] text-zinc-400 hover:text-zinc-700">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

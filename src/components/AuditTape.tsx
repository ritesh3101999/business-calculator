import React, { useState, useEffect, useRef } from 'react';
import { TapeLine } from '../types/calculator';
import { Printer, Copy, Trash2, Check, Edit2, Download } from 'lucide-react';
import { formatCurrency } from '../utils/currencies';

interface AuditTapeProps {
  lines: TapeLine[];
  currencySymbol: string;
  onClearTape: () => void;
  onUpdateLineNote: (id: string, note: string) => void;
  onPrintReceipt: () => void;
  shopName: string;
}

export const AuditTape: React.FC<AuditTapeProps> = ({
  lines,
  currencySymbol,
  onClearTape,
  onUpdateLineNote,
  onPrintReceipt,
  shopName,
}) => {
  const [copied, setCopied] = useState(false);
  const [editingLineId, setEditingLineId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const tapeEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll paper roll to bottom on new line
  useEffect(() => {
    tapeEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines.length]);

  const handleCopyTape = () => {
    const text = lines
      .map((l) => {
        const op = l.operator ? ` ${l.operator}` : '';
        const note = l.note ? ` (${l.note})` : '';
        return `${l.text}${op} = ${formatCurrency(l.value, currencySymbol)}${note}`;
      })
      .join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportText = () => {
    const text = [
      `==================================`,
      `  ${shopName || 'ShopCalc Pro'} - AUDIT TAPE`,
      `  Date: ${new Date().toLocaleString()}`,
      `==================================`,
      ...lines.map((l, i) => {
        const note = l.note ? ` [${l.note}]` : '';
        return `${String(i + 1).padStart(3, ' ')}. ${l.operator || ' '} ${l.text.padStart(12, ' ')} -> ${formatCurrency(l.value, currencySymbol)}${note}`;
      }),
      `==================================`,
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-tape-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const startEditNote = (line: TapeLine) => {
    setEditingLineId(line.id);
    setNoteText(line.note || '');
  };

  const saveNote = (id: string) => {
    onUpdateLineNote(id, noteText);
    setEditingLineId(null);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-300 shadow-xl overflow-hidden flex flex-col h-full max-h-[720px]">
      {/* Tape Header Controls */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h2 className="text-xs sm:text-sm font-bold tracking-tight text-slate-800">
            AUDIT TAPE ROLL
          </h2>
          <span className="text-[11px] font-mono text-slate-500">
            ({lines.length} lines)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopyTape}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            title="Copy Tape to Clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleExportText}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            title="Download Tape as Text"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={onPrintReceipt}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition-colors"
            title="Print Thermal Receipt"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onClearTape}
            disabled={lines.length === 0}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-colors"
            title="Clear Tape"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Realistic Paper Roll Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 paper-tape-bg font-mono text-xs sm:text-sm text-slate-800 space-y-2 select-text">
        {/* Paper top header banner */}
        <div className="text-center border-b border-dashed border-slate-400 pb-3 mb-3 text-slate-600">
          <p className="font-bold tracking-wider uppercase text-xs">{shopName || 'SHOP REGISTER'}</p>
          <p className="text-[10px] text-slate-500">ELECTRONIC TAPE PRINT</p>
          <p className="text-[10px] text-slate-400">{new Date().toLocaleDateString()} · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
        </div>

        {lines.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs italic">
            Tape is empty. Tap numbers and operators to begin printing entries.
          </div>
        ) : (
          lines.map((line, index) => {
            const isEditing = editingLineId === line.id;

            return (
              <div
                key={line.id}
                className={`group relative rounded p-1.5 transition-colors ${
                  line.isTotal
                    ? 'border-t-2 border-b-2 border-slate-900 bg-emerald-50/50 font-bold my-2 text-slate-900'
                    : line.isSubtotal
                    ? 'border-t border-b border-dashed border-slate-400 font-semibold bg-amber-50/40'
                    : 'hover:bg-slate-200/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* Left: Step number, operator tag, and text */}
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                    <span className="text-[10px] text-slate-400 w-5 select-none">
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {line.operator && (
                      <span
                        className={`text-[11px] font-bold px-1 rounded select-none ${
                          line.isTotal
                            ? 'bg-slate-900 text-white'
                            : line.operator === 'TAX+' || line.operator === 'TAX-'
                            ? 'bg-emerald-200 text-emerald-900'
                            : line.operator === 'DISC'
                            ? 'bg-amber-200 text-amber-900'
                            : 'text-slate-600'
                        }`}
                      >
                        {line.operator}
                      </span>
                    )}

                    <span className="truncate font-mono-num font-medium text-slate-700">
                      {line.text}
                    </span>
                  </div>

                  {/* Right: Calculated value */}
                  <div className="text-right font-mono-num font-semibold text-slate-900 whitespace-nowrap">
                    {formatCurrency(line.value, currencySymbol)}
                  </div>
                </div>

                {/* Optional line note / department label */}
                {isEditing ? (
                  <div className="mt-1 flex items-center gap-1 bg-white p-1 rounded border border-slate-300">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Add item name or note..."
                      className="flex-1 text-xs px-1.5 py-0.5 border-none outline-none font-sans"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveNote(line.id);
                        if (e.key === 'Escape') setEditingLineId(null);
                      }}
                    />
                    <button
                      onClick={() => saveNote(line.id)}
                      className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-sans"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-0.5">
                    {line.note ? (
                      <span className="italic text-slate-600 flex items-center gap-1">
                        <span># {line.note}</span>
                        <button
                          onClick={() => startEditNote(line)}
                          className="opacity-0 group-hover:opacity-100 hover:text-slate-800"
                          title="Edit note"
                        >
                          <Edit2 className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    ) : (
                      <button
                        onClick={() => startEditNote(line)}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-emerald-700 underline"
                      >
                        + add note
                      </button>
                    )}

                    {line.runningTotal !== undefined && !line.isTotal && (
                      <span className="text-[10px] text-slate-400 ml-auto">
                        run: {formatCurrency(line.runningTotal, currencySymbol)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={tapeEndRef} />
      </div>

      {/* Paper tear bottom edge effect */}
      <div className="bg-slate-200 border-t border-slate-300 px-4 py-2 flex items-center justify-between text-xs text-slate-600 font-mono">
        <span>FEED: OK</span>
        <button
          onClick={onPrintReceipt}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>
    </div>
  );
};

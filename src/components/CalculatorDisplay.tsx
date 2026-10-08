import React from 'react';
import { CalculationMode, TapeLine } from '../types/calculator';
import { formatCurrency } from '../utils/currencies';

interface CalculatorDisplayProps {
  mainDisplay: string;
  formulaDisplay: string;
  subtotal: number;
  memoryValue: number;
  mode: CalculationMode;
  activeTaxRate: number;
  currencySymbol: string;
  lastTapeLine?: TapeLine;
  itemCount: number;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  mainDisplay,
  formulaDisplay,
  subtotal,
  memoryValue,
  mode,
  activeTaxRate,
  currencySymbol,
  lastTapeLine,
  itemCount,
}) => {
  return (
    <div className="bg-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl relative overflow-hidden select-none">
      {/* Subtle glass reflection gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.04] to-transparent pointer-events-none" />

      {/* Top Status & Flags Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          {/* Memory flag */}
          <span
            className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
              memoryValue !== 0
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-slate-600'
            }`}
          >
            M {memoryValue !== 0 ? `(${formatCurrency(memoryValue, currencySymbol, 0)})` : ''}
          </span>

          {/* Mode indicator */}
          <span className="px-1.5 py-0.5 rounded text-[11px] font-semibold bg-slate-800 text-slate-300">
            {mode === 'standard' ? 'STD MODE' : 'ADD-2 TILL'}
          </span>

          {/* Tax rate preset */}
          <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-900/60">
            GST/TAX {activeTaxRate}%
          </span>
        </div>

        {/* Counter of entries / items */}
        <div className="flex items-center gap-2 text-slate-400">
          <span>ITEMS: <strong className="text-white font-mono">{itemCount}</strong></span>
          <span className="hidden sm:inline">·</span>
          <span className="hidden sm:inline">RUNNING: <strong className="text-emerald-400 font-mono">{formatCurrency(subtotal, currencySymbol)}</strong></span>
        </div>
      </div>

      {/* Expression / Formula secondary line */}
      <div className="h-6 flex items-center justify-end text-xs sm:text-sm font-mono-num text-slate-400 overflow-hidden text-ellipsis whitespace-nowrap">
        {formulaDisplay || (lastTapeLine ? `${lastTapeLine.text} = ${formatCurrency(lastTapeLine.value, currencySymbol)}` : 'READY')}
      </div>

      {/* Giant primary digits line */}
      <div className="flex items-baseline justify-between mt-1 mb-1">
        <span className="text-xl sm:text-2xl font-mono text-emerald-500/70 select-none">
          {currencySymbol}
        </span>
        <div className="text-right flex-1 pl-2">
          <span
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold font-mono-num tracking-tight text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.25)] select-all"
            style={{ letterSpacing: '-0.02em' }}
          >
            {mainDisplay}
          </span>
        </div>
      </div>

      {/* Bottom context strip (tax details or last entry breakdown) */}
      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] sm:text-xs font-mono text-slate-400">
        <div>
          {lastTapeLine?.taxInfo ? (
            <span className="text-emerald-400">
              Tax @{lastTapeLine.taxInfo.rate}%: {currencySymbol}{lastTapeLine.taxInfo.amount.toFixed(2)} (Base: {currencySymbol}{lastTapeLine.taxInfo.base.toFixed(2)})
            </span>
          ) : lastTapeLine?.discountInfo ? (
            <span className="text-amber-400">
              Discount {lastTapeLine.discountInfo.rateOrFlat}%: Saved {currencySymbol}{lastTapeLine.discountInfo.savedAmount.toFixed(2)}
            </span>
          ) : (
            <span className="text-slate-500">Commercial 12-Digit Business Adding Engine</span>
          )}
        </div>
        <div className="text-slate-400">
          Subtotal: <span className="text-slate-200 font-bold">{formatCurrency(subtotal, currencySymbol)}</span>
        </div>
      </div>
    </div>
  );
};

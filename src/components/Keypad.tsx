import React from 'react';
import { CalculationMode } from '../types/calculator';
import { Delete, Percent, Calculator, DollarSign, ArrowDownUp } from 'lucide-react';

interface KeypadProps {
  onDigit: (digit: string) => void;
  onOperator: (op: '+' | '-' | '×' | '÷') => void;
  onEquals: () => void;
  onClear: () => void;
  onAllClear: () => void;
  onBackspace: () => void;
  onDecimal: () => void;
  onDoubleZero: () => void;
  onNegate: () => void;
  onSubtotal: () => void;
  onMemoryAdd: () => void;
  onMemorySub: () => void;
  onMemoryRecall: () => void;
  onMemoryClear: () => void;
  onTaxPlus: () => void;
  onTaxMinus: () => void;
  onQuickDiscount: () => void;
  onOpenCostMargin: () => void;
  onOpenCashTill: () => void;
  mode: CalculationMode;
  onToggleMode: () => void;
  activeTaxRate: number;
}

export const Keypad: React.FC<KeypadProps> = ({
  onDigit,
  onOperator,
  onEquals,
  onClear,
  onAllClear,
  onBackspace,
  onDecimal,
  onDoubleZero,
  onNegate,
  onSubtotal,
  onMemoryAdd,
  onMemorySub,
  onMemoryRecall,
  onMemoryClear,
  onTaxPlus,
  onTaxMinus,
  onQuickDiscount,
  onOpenCostMargin,
  onOpenCashTill,
  mode,
  onToggleMode,
  activeTaxRate,
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-xl space-y-2.5">
      {/* 1. Business & Retail Function Ribbon */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <button
          onClick={onTaxPlus}
          className="py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-all active:scale-95 flex flex-col items-center justify-center shadow-sm"
          title={`Add ${activeTaxRate}% Tax/GST`}
        >
          <span className="leading-tight">TAX +</span>
          <span className="text-[10px] text-emerald-400 font-mono font-normal">+{activeTaxRate}%</span>
        </button>

        <button
          onClick={onTaxMinus}
          className="py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 transition-all active:scale-95 flex flex-col items-center justify-center shadow-sm"
          title={`Extract ${activeTaxRate}% Tax/GST`}
        >
          <span className="leading-tight">TAX -</span>
          <span className="text-[10px] text-emerald-400 font-mono font-normal">-{activeTaxRate}%</span>
        </button>

        <button
          onClick={onQuickDiscount}
          className="py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold bg-amber-950/70 hover:bg-amber-900/80 border border-amber-700/50 text-amber-300 transition-all active:scale-95 flex flex-col items-center justify-center shadow-sm"
          title="Apply Discount %"
        >
          <span className="flex items-center gap-0.5 leading-tight">
            DISC <Percent className="w-3 h-3" />
          </span>
          <span className="text-[10px] text-amber-400 font-mono font-normal">Off %</span>
        </button>

        <button
          onClick={onOpenCostMargin}
          className="py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-300 transition-all active:scale-95 flex flex-col items-center justify-center shadow-sm"
          title="Cost, Sell & Profit Margin Solver"
        >
          <span className="leading-tight">MARGIN</span>
          <span className="text-[10px] text-indigo-400 font-mono font-normal">Cost/Sell</span>
        </button>

        <button
          onClick={onOpenCashTill}
          className="py-2.5 px-1 sm:px-2 rounded-xl text-xs font-bold bg-blue-900 hover:bg-blue-800 border border-blue-600 text-white transition-all active:scale-95 flex flex-col items-center justify-center shadow-sm"
          title="Cash Tendered & Change Breakdown"
        >
          <span className="flex items-center gap-0.5 leading-tight">
            <DollarSign className="w-3.5 h-3.5" /> TILL
          </span>
          <span className="text-[10px] text-blue-200 font-mono font-normal">Change</span>
        </button>
      </div>

      {/* 2. Memory & Subtotal Row */}
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        <button
          onClick={onMemoryClear}
          className="py-2 px-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95"
          title="Memory Clear"
        >
          MC
        </button>
        <button
          onClick={onMemoryRecall}
          className="py-2 px-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95"
          title="Memory Recall"
        >
          MR
        </button>
        <button
          onClick={onMemorySub}
          className="py-2 px-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95"
          title="Memory Subtract"
        >
          M-
        </button>
        <button
          onClick={onMemoryAdd}
          className="py-2 px-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/70 transition-all active:scale-95"
          title="Memory Add"
        >
          M+
        </button>
        <button
          onClick={onSubtotal}
          className="py-2 px-1 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-all active:scale-95 flex items-center justify-center gap-1"
          title="Print Subtotal to Tape"
        >
          <span>SUBTOTAL</span>
        </button>
      </div>

      {/* 3. Main Calculator Keypad Grid */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {/* Row 1: AC, C, Backspace, Divide */}
        <button
          onClick={onAllClear}
          className="py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold bg-rose-950/70 hover:bg-rose-900 border border-rose-800/60 text-rose-300 transition-all active:scale-95 shadow-sm"
          title="All Clear (AC)"
        >
          AC
        </button>
        <button
          onClick={onClear}
          className="py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all active:scale-95"
          title="Clear Entry (C)"
        >
          C
        </button>
        <button
          onClick={onBackspace}
          className="py-3 sm:py-3.5 rounded-xl text-sm sm:text-base font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all active:scale-95 flex items-center justify-center"
          title="Backspace / Delete"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          onClick={() => onOperator('÷')}
          className="py-3 sm:py-3.5 rounded-xl text-lg font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 transition-all active:scale-95 font-mono"
          title="Divide"
        >
          ÷
        </button>

        {/* Row 2: 7, 8, 9, Multiply */}
        <button
          onClick={() => onDigit('7')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          7
        </button>
        <button
          onClick={() => onDigit('8')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          8
        </button>
        <button
          onClick={() => onDigit('9')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          9
        </button>
        <button
          onClick={() => onOperator('×')}
          className="py-3.5 sm:py-4 rounded-xl text-lg font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 transition-all active:scale-95 font-mono"
          title="Multiply"
        >
          ×
        </button>

        {/* Row 3: 4, 5, 6, Subtract */}
        <button
          onClick={() => onDigit('4')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          4
        </button>
        <button
          onClick={() => onDigit('5')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          5
        </button>
        <button
          onClick={() => onDigit('6')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          6
        </button>
        <button
          onClick={() => onOperator('-')}
          className="py-3.5 sm:py-4 rounded-xl text-xl font-bold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-emerald-400 transition-all active:scale-95 font-mono"
          title="Subtract"
        >
          −
        </button>

        {/* Row 4: 1, 2, 3, Add */}
        <button
          onClick={() => onDigit('1')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          1
        </button>
        <button
          onClick={() => onDigit('2')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          2
        </button>
        <button
          onClick={() => onDigit('3')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          3
        </button>
        <button
          onClick={() => onOperator('+')}
          className="py-3.5 sm:py-4 rounded-xl text-xl font-bold bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-600/70 text-emerald-300 transition-all active:scale-95 font-mono shadow-sm"
          title="Add"
        >
          +
        </button>

        {/* Row 5: 0, 00, Decimal, Equals */}
        <button
          onClick={() => onDigit('0')}
          className="py-3.5 sm:py-4 rounded-xl text-lg sm:text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          0
        </button>
        <button
          onClick={onDoubleZero}
          className="py-3.5 sm:py-4 rounded-xl text-base sm:text-lg font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
          title="Double Zero (00)"
        >
          00
        </button>
        <button
          onClick={onDecimal}
          className="py-3.5 sm:py-4 rounded-xl text-xl font-bold bg-slate-800/90 hover:bg-slate-700 border border-slate-700/80 text-white transition-all active:scale-95 shadow-sm font-mono-num"
        >
          .
        </button>
        <button
          onClick={onEquals}
          className="py-3.5 sm:py-4 rounded-xl text-xl sm:text-2xl font-black bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white transition-all active:scale-95 shadow-lg shadow-emerald-950 font-mono"
          title="Equals / Print Total (=)"
        >
          =
        </button>
      </div>

      {/* Mode Switcher / Mechanical Desk switch */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={onNegate}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono"
            title="Toggle +/- Sign"
          >
            ± Sign
          </button>
        </div>

        <button
          onClick={onToggleMode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
          title="Switch between Standard and Commercial Adding Machine Mode"
        >
          <ArrowDownUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>Mode: </span>
          <strong className="text-white font-semibold">
            {mode === 'standard' ? 'Standard' : 'Adding Machine'}
          </strong>
        </button>
      </div>
    </div>
  );
};

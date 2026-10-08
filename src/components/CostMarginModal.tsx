import React, { useState } from 'react';
import { X, TrendingUp, ArrowRight, ArrowDownRight, Percent } from 'lucide-react';
import { formatCurrency } from '../utils/currencies';
import {
  calculateSellFromCostAndMargin,
  calculateMarginFromCostAndSell,
  calculateCostFromSellAndMargin,
} from '../utils/calculatorEngine';
import { sounds } from '../utils/audio';

interface CostMarginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
  onLoadPriceToCalculator: (price: number, label: string) => void;
}

export const CostMarginModal: React.FC<CostMarginModalProps> = ({
  isOpen,
  onClose,
  currencySymbol,
  onLoadPriceToCalculator,
}) => {
  const [calcMode, setCalcMode] = useState<'find_sell' | 'find_margin' | 'find_cost'>('find_sell');
  const [costInput, setCostInput] = useState('100');
  const [marginInput, setMarginInput] = useState('25');
  const [sellInput, setSellInput] = useState('133.33');

  if (!isOpen) return null;

  const cost = parseFloat(costInput) || 0;
  const margin = parseFloat(marginInput) || 0;
  const sell = parseFloat(sellInput) || 0;

  let result: {
    cost?: number;
    sell?: number;
    profit?: number;
    marginPercent?: number;
    markupPercent?: number;
    error?: string;
  } = {};

  if (calcMode === 'find_sell') {
    result = calculateSellFromCostAndMargin(cost, margin);
  } else if (calcMode === 'find_margin') {
    result = calculateMarginFromCostAndSell(cost, sell);
  } else if (calcMode === 'find_cost') {
    result = calculateCostFromSellAndMargin(sell, margin);
  }

  const handleApply = () => {
    sounds.playKeypadClick();
    const finalPrice = calcMode === 'find_sell' ? (result.sell || 0) : sell;
    onLoadPriceToCalculator(finalPrice, `Margin ${result.marginPercent || margin}%`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-base tracking-tight">
              Cost, Selling Price &amp; Profit Margin Solver
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setCalcMode('find_sell')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                calcMode === 'find_sell' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Find Selling Price
            </button>
            <button
              onClick={() => setCalcMode('find_margin')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                calcMode === 'find_margin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Find Margin %
            </button>
            <button
              onClick={() => setCalcMode('find_cost')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                calcMode === 'find_cost' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Find Max Cost
            </button>
          </div>

          {/* Inputs Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Cost Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Cost Price ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                disabled={calcMode === 'find_cost'}
                value={calcMode === 'find_cost' ? (result.cost?.toFixed(2) || '') : costInput}
                onChange={(e) => setCostInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 disabled:bg-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Margin % Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Profit Margin (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  disabled={calcMode === 'find_margin'}
                  value={calcMode === 'find_margin' ? (result.marginPercent?.toFixed(2) || '') : marginInput}
                  onChange={(e) => setMarginInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 disabled:bg-slate-100 focus:outline-none focus:border-indigo-500"
                />
                <Percent className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Selling Price Input (enabled for find_margin or find_cost) */}
            <div className="col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Selling Price ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                disabled={calcMode === 'find_sell'}
                value={calcMode === 'find_sell' ? (result.sell?.toFixed(2) || '') : sellInput}
                onChange={(e) => setSellInput(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-mono text-base font-bold text-slate-900 disabled:bg-slate-100 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs text-indigo-950">
              <span className="font-semibold">Calculated Selling Price:</span>
              <strong className="text-base font-mono font-bold text-indigo-900">
                {formatCurrency(result.sell || sell, currencySymbol)}
              </strong>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-950">
              <span className="font-semibold">Gross Profit per Unit:</span>
              <strong className="text-sm font-mono font-bold text-emerald-700">
                +{formatCurrency(result.profit || 0, currencySymbol)}
              </strong>
            </div>

            <div className="flex items-center justify-between text-xs text-indigo-950 pt-2 border-t border-indigo-200/70">
              <span>Gross Margin (% of Sell):</span>
              <span className="font-mono font-bold">
                {result.marginPercent !== undefined ? `${result.marginPercent}%` : `${margin}%`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Markup (% on Cost):</span>
              <span className="font-mono font-bold text-slate-700">
                {result.markupPercent !== undefined ? `${result.markupPercent}%` : '0%'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="flex-2 py-3 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-md shadow-indigo-950 flex items-center justify-center gap-1.5"
            >
              <span>Load Price to Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

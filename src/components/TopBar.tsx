import React from 'react';
import { Volume2, VolumeX, Store, RotateCcw, ReceiptText, BookOpen, Settings } from 'lucide-react';
import { CURRENCIES } from '../utils/currencies';

interface TopBarProps {
  activeTab: 'calculator' | 'quick-items' | 'day-book' | 'settings';
  setActiveTab: (tab: 'calculator' | 'quick-items' | 'day-book' | 'settings') => void;
  shopName: string;
  currencyCode: string;
  onCurrencyChange: (code: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onNewBill: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  shopName,
  currencyCode,
  onCurrencyChange,
  soundEnabled,
  onToggleSound,
  onNewBill,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand title (single text element wordmark) */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-lg shadow-inner">
            <Store className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-white whitespace-nowrap">
              {shopName ? `${shopName} · ShopCalc` : 'ShopCalc Pro'}
            </h1>
          </div>
        </div>

        {/* Zone 2: Navigation tabs (single-line controls) */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ReceiptText className="w-4 h-4" />
            <span>Till &amp; Tape</span>
          </button>

          <button
            onClick={() => setActiveTab('day-book')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'day-book'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Day Book</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Settings</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions & quick switches */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Currency Selector */}
          <select
            value={currencyCode}
            onChange={(e) => onCurrencyChange(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-slate-700 text-xs sm:text-sm rounded-lg px-2.5 py-1.5 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
            title="Change Currency"
          >
            {Object.keys(CURRENCIES).map((code) => (
              <option key={code} value={code}>
                {CURRENCIES[code].symbol} {code}
              </option>
            ))}
          </select>

          {/* Sound Mute/Unmute */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-lg border transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
            title={soundEnabled ? 'Mechanical Key Sounds Enabled' : 'Key Sounds Muted'}
            aria-label="Toggle calculator sounds"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* New Transaction / Reset Bill */}
          <button
            onClick={onNewBill}
            className="px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            title="Clear and Start Fresh Bill"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">New Bill</span>
          </button>
        </div>
      </div>
    </header>
  );
};

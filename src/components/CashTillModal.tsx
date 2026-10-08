import React, { useState, useMemo } from 'react';
import { Denomination } from '../types/calculator';
import { calculateDenominationBreakdown } from '../utils/calculatorEngine';
import { formatCurrency } from '../utils/currencies';
import { X, CheckCircle2, Coins, CreditCard, QrCode, Banknote, ShieldAlert } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CashTillModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  currencySymbol: string;
  denominations: Denomination[];
  onFinalizeSale: (saleData: {
    paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
    cashTendered?: number;
    changeGiven?: number;
    customerNote?: string;
  }) => void;
}

export const CashTillModal: React.FC<CashTillModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  currencySymbol,
  denominations,
  onFinalizeSale,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'upi' | 'credit'>('cash');
  const [tenderedInput, setTenderedInput] = useState<string>(String(Math.ceil(grandTotal)));
  const [customerNote, setCustomerNote] = useState('');

  const tenderedAmount = parseFloat(tenderedInput) || 0;
  const changeDue = Math.max(0, tenderedAmount - grandTotal);
  const isShort = tenderedAmount < grandTotal;

  // Calculate denominations breakdown
  const breakdown = useMemo(() => {
    if (paymentMethod !== 'cash' || changeDue <= 0) {
      return { items: [], exactChange: true, remainder: 0 };
    }
    return calculateDenominationBreakdown(changeDue, denominations);
  }, [changeDue, denominations, paymentMethod]);

  if (!isOpen) return null;

  const handleQuickTender = (amount: number) => {
    sounds.playKeypadClick();
    setTenderedInput(String(amount));
  };

  const handleComplete = () => {
    sounds.playCashRegisterChime();
    onFinalizeSale({
      paymentMethod,
      cashTendered: paymentMethod === 'cash' ? tenderedAmount : grandTotal,
      changeGiven: paymentMethod === 'cash' ? changeDue : 0,
      customerNote: customerNote.trim() || undefined,
    });
    onClose();
  };

  // Generate sensible quick cash shortcuts
  const quickCashOptions = [
    grandTotal,
    Math.ceil(grandTotal / 10) * 10,
    Math.ceil(grandTotal / 50) * 50,
    Math.ceil(grandTotal / 100) * 100,
    Math.ceil(grandTotal / 500) * 500,
  ].filter((v, i, a) => v >= grandTotal && a.indexOf(v) === i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base tracking-tight">
              Cash Tender &amp; Change Calculator
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
          {/* Total Bill Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Bill Amount
              </p>
              <p className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {formatCurrency(grandTotal, currencySymbol)}
              </p>
            </div>
            <div className="flex items-center gap-1.5 p-1 bg-slate-200 rounded-lg">
              <button
                onClick={() => setPaymentMethod('cash')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  paymentMethod === 'cash' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <Banknote className="w-3.5 h-3.5" /> Cash
              </button>
              <button
                onClick={() => setPaymentMethod('upi')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  paymentMethod === 'upi' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" /> UPI/QR
              </button>
              <button
                onClick={() => setPaymentMethod('card')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
                  paymentMethod === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" /> Card
              </button>
            </div>
          </div>

          {paymentMethod === 'cash' ? (
            <>
              {/* Customer Cash Given Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                  Customer Cash Tendered ({currencySymbol})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-slate-400 font-bold text-lg">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={tenderedInput}
                    onChange={(e) => setTenderedInput(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 rounded-xl border border-slate-300 font-mono text-xl font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    placeholder="0.00"
                    autoFocus
                  />
                </div>

                {/* Quick cash shortcut chips */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 py-1">Quick:</span>
                  {quickCashOptions.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => handleQuickTender(opt)}
                      className="px-2.5 py-1 text-xs font-mono font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-200 transition-colors"
                    >
                      {formatCurrency(opt, currencySymbol, 0)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Due Display */}
              <div
                className={`rounded-xl p-4 border transition-colors ${
                  isShort
                    ? 'bg-rose-50 border-rose-200 text-rose-800'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isShort ? (
                      <ShieldAlert className="w-5 h-5 text-rose-600" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                    <span className="text-xs font-bold uppercase tracking-wider">
                      {isShort ? 'Amount Short (Pending)' : 'Change Due to Customer'}
                    </span>
                  </div>
                  <span className="text-2xl font-black font-mono">
                    {formatCurrency(Math.abs(tenderedAmount - grandTotal), currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Denomination Breakdown */}
              {changeDue > 0 && breakdown.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Recommended Change Denominations
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {breakdown.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 flex items-center justify-between"
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate">
                            {item.denomination.label}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {item.denomination.type === 'note' ? 'Banknote' : 'Coin'}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                            ×{item.count}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-200 space-y-2">
              <p className="text-sm font-semibold text-slate-700">
                Payment mode: {paymentMethod === 'upi' ? 'UPI / QR Code Scan' : 'Credit / Debit Card Terminal'}
              </p>
              <p className="text-xs text-slate-500">
                Collect exact payment of <strong className="text-slate-900 font-mono">{formatCurrency(grandTotal, currencySymbol)}</strong>.
              </p>
            </div>
          )}

          {/* Customer / Transaction Note */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Customer Name / Invoice Note (Optional)
            </label>
            <input
              type="text"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder="e.g. Table 4 / Ramesh Kumar / Counter Sale"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleComplete}
              disabled={isShort && paymentMethod === 'cash'}
              className="flex-2 py-3 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:pointer-events-none rounded-xl transition-all shadow-md shadow-emerald-950 flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Sale &amp; Ring Till</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

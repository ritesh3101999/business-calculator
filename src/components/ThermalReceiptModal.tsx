import React from 'react';
import { CompletedSale, ShopProfile, TapeLine } from '../types/calculator';
import { formatCurrency } from '../utils/currencies';
import { X, Printer, Download, Check } from 'lucide-react';

interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopProfile: ShopProfile;
  currencySymbol: string;
  // Either a completed sale OR current tape lines
  sale?: CompletedSale;
  currentTapeLines?: TapeLine[];
  currentSubtotal?: number;
  currentGrandTotal?: number;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  shopProfile,
  currencySymbol,
  sale,
  currentTapeLines,
  currentSubtotal = 0,
  currentGrandTotal = 0,
}) => {
  if (!isOpen) return null;

  const lines = sale ? sale.lines : (currentTapeLines || []);
  const receiptNo = sale ? sale.receiptNumber : `REC-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = sale ? sale.date : new Date().toLocaleString();
  const grandTotal = sale ? sale.grandTotal : currentGrandTotal;
  const subtotal = sale ? sale.subtotal : currentSubtotal;
  const paymentMethod = sale ? sale.paymentMethod : 'cash';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-sm w-full border border-slate-300 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Control Header */}
        <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Thermal Cash Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Paper Scroll Container */}
        <div className="flex-1 overflow-y-auto p-6 bg-amber-50/20 font-mono text-xs text-slate-800 select-text">
          <div id="printable-receipt" className="space-y-3">
            {/* Header / Shop Info */}
            <div className="text-center space-y-0.5 border-b border-dashed border-slate-400 pb-3">
              <h2 className="text-base font-black text-slate-950 tracking-tight uppercase">
                {shopProfile.name || 'SHOPCALC STORE'}
              </h2>
              {shopProfile.tagline && (
                <p className="text-[11px] text-slate-600 italic">{shopProfile.tagline}</p>
              )}
              {shopProfile.address && (
                <p className="text-[10px] text-slate-600">{shopProfile.address}</p>
              )}
              {shopProfile.phone && (
                <p className="text-[10px] text-slate-600">TEL: {shopProfile.phone}</p>
              )}
              {shopProfile.taxId && (
                <p className="text-[10px] text-slate-700 font-bold">GSTIN/TAX: {shopProfile.taxId}</p>
              )}
            </div>

            {/* Receipt Meta */}
            <div className="text-[10px] text-slate-600 border-b border-dashed border-slate-400 pb-2 space-y-0.5">
              <div className="flex justify-between">
                <span>Receipt: <strong>{receiptNo}</strong></span>
                <span>Pay: <strong className="uppercase">{paymentMethod}</strong></span>
              </div>
              <div className="flex justify-between">
                <span>Date: {dateStr}</span>
              </div>
              {sale?.customerNote && (
                <div className="pt-0.5 text-slate-700 italic">
                  Note: {sale.customerNote}
                </div>
              )}
            </div>

            {/* Items Table */}
            <div className="space-y-1.5 py-1">
              <div className="flex justify-between font-bold text-[10px] uppercase border-b border-slate-300 pb-1">
                <span>Description / Item</span>
                <span>Amount</span>
              </div>

              {lines.map((l, idx) => (
                <div key={idx} className="flex justify-between text-xs py-0.5">
                  <span className="truncate pr-2">
                    {l.note ? `${l.note} (${l.text})` : l.text}
                    {l.operator ? ` [${l.operator}]` : ''}
                  </span>
                  <span className="font-semibold whitespace-nowrap">
                    {formatCurrency(l.value, currencySymbol)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals Section */}
            <div className="border-t border-dashed border-slate-400 pt-2 space-y-1 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>{formatCurrency(subtotal, currencySymbol)}</span>
              </div>

              {sale && sale.taxTotal > 0 && (
                <div className="flex justify-between text-slate-600 text-[11px]">
                  <span>Total Tax / GST:</span>
                  <span>{formatCurrency(sale.taxTotal, currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between font-black text-sm text-slate-950 pt-1 border-t border-slate-300">
                <span>TOTAL PAYABLE:</span>
                <span>{formatCurrency(grandTotal, currencySymbol)}</span>
              </div>

              {sale?.cashTendered !== undefined && sale.cashTendered > 0 && (
                <div className="pt-1 border-t border-dotted border-slate-300 text-[11px] text-slate-600 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>{formatCurrency(sale.cashTendered, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>Change Returned:</span>
                    <span>{formatCurrency(sale.changeGiven || 0, currencySymbol)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Greeting */}
            <div className="text-center border-t border-dashed border-slate-400 pt-3 text-[10px] text-slate-500 space-y-0.5">
              <p className="font-bold text-slate-700">*** THANK YOU FOR YOUR BUSINESS ***</p>
              <p>Please visit again</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

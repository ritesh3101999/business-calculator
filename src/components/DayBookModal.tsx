import React, { useState } from 'react';
import { CompletedSale } from '../types/calculator';
import { formatCurrency } from '../utils/currencies';
import {
  X,
  BookOpen,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Banknote,
  QrCode,
  TrendingUp,
  Receipt,
  Trash2,
} from 'lucide-react';

interface DayBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  sales: CompletedSale[];
  currencySymbol: string;
  shopName: string;
  onViewReceipt: (sale: CompletedSale) => void;
  onClearHistory: () => void;
}

export const DayBookModal: React.FC<DayBookModalProps> = ({
  isOpen,
  onClose,
  sales,
  currencySymbol,
  shopName,
  onViewReceipt,
  onClearHistory,
}) => {
  const [filterPayment, setFilterPayment] = useState<string>('all');

  if (!isOpen) return null;

  // Filter sales
  const filteredSales = sales.filter((s) => {
    if (filterPayment === 'all') return true;
    return s.paymentMethod === filterPayment;
  });

  // Calculate day totals
  const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
  const totalTax = sales.reduce((sum, s) => sum + s.taxTotal, 0);
  const cashTotal = sales
    .filter((s) => s.paymentMethod === 'cash')
    .reduce((sum, s) => sum + s.grandTotal, 0);
  const digitalTotal = sales
    .filter((s) => s.paymentMethod === 'upi' || s.paymentMethod === 'card')
    .reduce((sum, s) => sum + s.grandTotal, 0);
  const avgTicket = sales.length > 0 ? totalRevenue / sales.length : 0;

  const handleExportCSV = () => {
    const headers = [
      'Receipt No',
      'Date & Time',
      'Payment Method',
      'Subtotal',
      'Tax',
      'Grand Total',
      'Cash Tendered',
      'Change Given',
      'Note',
    ];

    const rows = sales.map((s) => [
      s.receiptNumber,
      `"${s.date}"`,
      s.paymentMethod.toUpperCase(),
      s.subtotal.toFixed(2),
      s.taxTotal.toFixed(2),
      s.grandTotal.toFixed(2),
      (s.cashTendered || 0).toFixed(2),
      (s.changeGiven || 0).toFixed(2),
      `"${(s.customerNote || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `day-book-sales-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-base tracking-tight">
                Daily Sales Register &amp; Day Book
              </h3>
              <p className="text-xs text-slate-400">
                {shopName || 'Shop Register'} · {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={sales.length === 0}
              className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metric Cards Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-5 bg-slate-50 border-b border-slate-200 shrink-0">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Revenue
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-emerald-700 mt-0.5">
              {formatCurrency(totalRevenue, currencySymbol)}
            </p>
            <span className="text-[10px] text-slate-400">{sales.length} transactions</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Cash In Till
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-slate-900 mt-0.5">
              {formatCurrency(cashTotal, currencySymbol)}
            </p>
            <span className="text-[10px] text-slate-400">Physical drawer cash</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Digital / UPI / Card
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-indigo-700 mt-0.5">
              {formatCurrency(digitalTotal, currencySymbol)}
            </p>
            <span className="text-[10px] text-slate-400">Online &amp; card sales</span>
          </div>

          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tax Collected
            </span>
            <p className="text-xl sm:text-2xl font-black font-mono text-amber-700 mt-0.5">
              {formatCurrency(totalTax, currencySymbol)}
            </p>
            <span className="text-[10px] text-slate-400">Avg ticket: {formatCurrency(avgTicket, currencySymbol, 0)}</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-slate-600 mr-1">Filter Payment:</span>
            {['all', 'cash', 'upi', 'card'].map((method) => (
              <button
                key={method}
                onClick={() => setFilterPayment(method)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors uppercase ${
                  filterPayment === method
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {method}
              </button>
            ))}
          </div>

          {sales.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to clear today\'s sales log?')) {
                  onClearHistory();
                }
              }}
              className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Register</span>
            </button>
          )}
        </div>

        {/* Sales Table */}
        <div className="flex-1 overflow-y-auto p-5">
          {filteredSales.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No transactions recorded for today yet.
              <p className="text-xs text-slate-400 mt-1">
                Complete sales using the "TILL" or "Cash Tender" button to ring register.
              </p>
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Note / Customer</th>
                    <th className="py-2.5 px-3 text-right">Tax</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                    <th className="py-2.5 px-3 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-num text-slate-700">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                        {sale.receiptNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap">
                        {sale.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1 ${
                            sale.paymentMethod === 'cash'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sale.paymentMethod === 'upi'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {sale.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 font-sans max-w-[140px] truncate">
                        {sale.customerNote || '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-500">
                        {formatCurrency(sale.taxTotal, currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-900 text-sm">
                        {formatCurrency(sale.grandTotal, currencySymbol)}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          onClick={() => onViewReceipt(sale)}
                          className="px-2 py-1 text-[11px] font-sans font-semibold text-emerald-700 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-1"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>View</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

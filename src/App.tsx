/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CalculationMode,
  TapeLine,
  ShopProfile,
  QuickDepartmentItem,
  CompletedSale,
} from './types/calculator';
import { CURRENCIES, DEFAULT_CURRENCY, formatCurrency, formatNumberOnly } from './utils/currencies';
import {
  roundTo,
  formatDisplayNumber,
  calculateTaxPlus,
  calculateTaxMinus,
  calculateDiscount,
} from './utils/calculatorEngine';
import { sounds } from './utils/audio';

import { TopBar } from './components/TopBar';
import { CalculatorDisplay } from './components/CalculatorDisplay';
import { Keypad } from './components/Keypad';
import { AuditTape } from './components/AuditTape';
import { QuickItemsBar } from './components/QuickItemsBar';
import { CashTillModal } from './components/CashTillModal';
import { CostMarginModal } from './components/CostMarginModal';
import { DayBookModal } from './components/DayBookModal';
import { ShopSettingsModal } from './components/ShopSettingsModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';

import {
  Receipt,
  RotateCcw,
  BookOpen,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle,
} from 'lucide-react';

const DEFAULT_SHOP_PROFILE: ShopProfile = {
  name: 'Bhumihar Retail & General Store',
  tagline: 'Retail, Wholesale & Provisions',
  phone: '+91 98765 43210',
  taxId: 'GSTIN: 07AAAAA0000A1Z5',
  address: 'Shop No. 14, Main Commercial Market',
  currencyCode: DEFAULT_CURRENCY,
  taxRates: [0, 5, 12, 18, 28],
  activeTaxRate: 18,
  taxInclusivePricing: false,
};

const DEFAULT_QUICK_ITEMS: QuickDepartmentItem[] = [
  { id: '1', name: 'General Grocery', price: 100, taxRate: 5 },
  { id: '2', name: 'Milk & Dairy', price: 60, taxRate: 0 },
  { id: '3', name: 'Flour / Atta 5kg', price: 210, taxRate: 5 },
  { id: '4', name: 'Refined Oil 1L', price: 145, taxRate: 5 },
  { id: '5', name: 'Packaged Snacks', price: 30, taxRate: 12 },
  { id: '6', name: 'Beverages / Soda', price: 40, taxRate: 18 },
  { id: '7', name: 'Stationery & Pens', price: 20, taxRate: 12 },
  { id: '8', name: 'Eco Carry Bag', price: 5, taxRate: 18 },
];

export default function App() {
  // Navigation & tabs
  const [activeTab, setActiveTab] = useState<'calculator' | 'quick-items' | 'day-book' | 'settings'>('calculator');

  // Shop Profile state
  const [profile, setProfile] = useState<ShopProfile>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopcalc_profile');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_SHOP_PROFILE;
  });

  // Quick department items state
  const [quickItems, setQuickItems] = useState<QuickDepartmentItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopcalc_quick_items');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_QUICK_ITEMS;
  });

  // Sales Register / Day Book
  const [sales, setSales] = useState<CompletedSale[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shopcalc_sales');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return [];
  });

  // Calculator core engine state
  const [displayValue, setDisplayValue] = useState<string>('0');
  const [accumulator, setAccumulator] = useState<number>(0);
  const [pendingOperator, setPendingOperator] = useState<'+' | '-' | '×' | '÷' | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState<boolean>(true);
  const [formulaDisplay, setFormulaDisplay] = useState<string>('');
  const [memory, setMemory] = useState<number>(0);
  const [mode, setMode] = useState<CalculationMode>('standard');
  const [tapeLines, setTapeLines] = useState<TapeLine[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => sounds.getSoundEnabled());

  // Modals state
  const [showCashTill, setShowCashTill] = useState<boolean>(false);
  const [showCostMargin, setShowCostMargin] = useState<boolean>(false);
  const [showDayBook, setShowDayBook] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showReceipt, setShowReceipt] = useState<boolean>(false);
  const [activeReceiptSale, setActiveReceiptSale] = useState<CompletedSale | undefined>(undefined);
  const [showSaleCelebration, setShowSaleCelebration] = useState<boolean>(false);

  // Active currency details
  const activeCurrency = useMemo(() => {
    return CURRENCIES[profile.currencyCode] || CURRENCIES.INR;
  }, [profile.currencyCode]);

  // Persist Profile
  useEffect(() => {
    localStorage.setItem('shopcalc_profile', JSON.stringify(profile));
  }, [profile]);

  // Persist Quick Items
  useEffect(() => {
    localStorage.setItem('shopcalc_quick_items', JSON.stringify(quickItems));
  }, [quickItems]);

  // Persist Sales
  useEffect(() => {
    localStorage.setItem('shopcalc_sales', JSON.stringify(sales));
  }, [sales]);

  // Running subtotal calculation
  const subtotal = useMemo(() => {
    if (tapeLines.length === 0) return parseFloat(displayValue) || 0;
    // Look at last line running total or compute from lines
    const lastLine = tapeLines[tapeLines.length - 1];
    return lastLine.runningTotal !== undefined ? lastLine.runningTotal : parseFloat(displayValue) || 0;
  }, [tapeLines, displayValue]);

  // Add line to audit tape
  const appendTapeLine = useCallback((line: Omit<TapeLine, 'id' | 'timestamp'>) => {
    sounds.playPaperFeed();
    const newLine: TapeLine = {
      ...line,
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setTapeLines((prev) => [...prev, newLine]);
  }, []);

  // Digit Input
  const handleDigit = useCallback((digit: string) => {
    sounds.playKeypadClick();
    setDisplayValue((prev) => {
      if (waitingForOperand) {
        setWaitingForOperand(false);
        return digit;
      }
      if (prev === '0') {
        return digit;
      }
      // Max 12 digits for clean commercial display
      if (prev.replace('.', '').length >= 12) return prev;
      return prev + digit;
    });
  }, [waitingForOperand]);

  // Double Zero (00)
  const handleDoubleZero = useCallback(() => {
    sounds.playKeypadClick();
    setDisplayValue((prev) => {
      if (waitingForOperand) {
        setWaitingForOperand(false);
        return '0';
      }
      if (prev === '0') return '0';
      if (prev.replace('.', '').length >= 11) return prev;
      return prev + '00';
    });
  }, [waitingForOperand]);

  // Decimal Point
  const handleDecimal = useCallback(() => {
    sounds.playKeypadClick();
    setDisplayValue((prev) => {
      if (waitingForOperand) {
        setWaitingForOperand(false);
        return '0.';
      }
      if (!prev.includes('.')) {
        return prev + '.';
      }
      return prev;
    });
  }, [waitingForOperand]);

  // Toggle +/- sign
  const handleNegate = useCallback(() => {
    sounds.playKeypadClick();
    setDisplayValue((prev) => {
      const num = parseFloat(prev);
      if (isNaN(num) || num === 0) return prev;
      return String(roundTo(-num, 4));
    });
  }, []);

  // Clear Entry (C)
  const handleClear = useCallback(() => {
    sounds.playClearClick();
    setDisplayValue('0');
    setWaitingForOperand(true);
  }, []);

  // All Clear (AC)
  const handleAllClear = useCallback(() => {
    sounds.playClearClick();
    setDisplayValue('0');
    setAccumulator(0);
    setPendingOperator(null);
    setWaitingForOperand(true);
    setFormulaDisplay('');
  }, []);

  // Full New Bill Reset
  const handleNewBill = useCallback(() => {
    sounds.playClearClick();
    setDisplayValue('0');
    setAccumulator(0);
    setPendingOperator(null);
    setWaitingForOperand(true);
    setFormulaDisplay('');
    setTapeLines([]);
  }, []);

  // Backspace (⌫)
  const handleBackspace = useCallback(() => {
    sounds.playKeypadClick();
    setDisplayValue((prev) => {
      if (waitingForOperand || prev.length <= 1) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [waitingForOperand]);

  // Standard Arithmetic Calculation Helper
  const evaluateOperation = useCallback((a: number, b: number, op: '+' | '-' | '×' | '÷'): number => {
    switch (op) {
      case '+': return roundTo(a + b, 4);
      case '-': return roundTo(a - b, 4);
      case '×': return roundTo(a * b, 4);
      case '÷': return b !== 0 ? roundTo(a / b, 4) : 0;
      default: return b;
    }
  }, []);

  // Arithmetic Operator (+, -, ×, ÷)
  const handleOperator = useCallback((nextOp: '+' | '-' | '×' | '÷') => {
    sounds.playOperatorClick();
    const inputValue = parseFloat(displayValue) || 0;

    // Commercial Adding Machine Mode: '+' and '-' accumulate directly to the tape ledger
    if (mode === 'adding_machine') {
      const currentRunning = tapeLines.length > 0 ? (tapeLines[tapeLines.length - 1].runningTotal || 0) : 0;
      const newRunning = nextOp === '-' ? roundTo(currentRunning - inputValue, 2) : roundTo(currentRunning + inputValue, 2);

      appendTapeLine({
        text: formatNumberOnly(inputValue),
        operator: nextOp,
        value: inputValue,
        runningTotal: newRunning,
      });

      setAccumulator(newRunning);
      setDisplayValue(String(newRunning));
      setWaitingForOperand(true);
      return;
    }

    // Standard Algebraic Mode
    if (pendingOperator && !waitingForOperand) {
      const result = evaluateOperation(accumulator, inputValue, pendingOperator);
      appendTapeLine({
        text: `${formatNumberOnly(accumulator)} ${pendingOperator} ${formatNumberOnly(inputValue)}`,
        operator: pendingOperator,
        value: result,
        runningTotal: result,
      });
      setAccumulator(result);
      setDisplayValue(String(result));
      setFormulaDisplay(`${result} ${nextOp}`);
    } else {
      setAccumulator(inputValue);
      setFormulaDisplay(`${inputValue} ${nextOp}`);
    }

    setPendingOperator(nextOp);
    setWaitingForOperand(true);
  }, [displayValue, mode, pendingOperator, waitingForOperand, accumulator, tapeLines, evaluateOperation, appendTapeLine]);

  // Equals (=)
  const handleEquals = useCallback(() => {
    sounds.playOperatorClick();
    const inputValue = parseFloat(displayValue) || 0;

    if (mode === 'adding_machine') {
      // Adding Machine prints Total
      const currentRunning = tapeLines.length > 0 ? (tapeLines[tapeLines.length - 1].runningTotal || 0) : inputValue;
      appendTapeLine({
        text: 'TOTAL DUE',
        operator: '=',
        value: currentRunning,
        runningTotal: currentRunning,
        isTotal: true,
      });
      setDisplayValue(String(currentRunning));
      setWaitingForOperand(true);
      return;
    }

    if (pendingOperator) {
      const result = evaluateOperation(accumulator, inputValue, pendingOperator);
      appendTapeLine({
        text: `${formatNumberOnly(accumulator)} ${pendingOperator} ${formatNumberOnly(inputValue)}`,
        operator: '=',
        value: result,
        runningTotal: result,
        isTotal: true,
      });
      setAccumulator(result);
      setDisplayValue(String(result));
      setPendingOperator(null);
      setFormulaDisplay('');
      setWaitingForOperand(true);
    } else {
      // Even without pending operator, hitting = commits the current entry as a Total line
      appendTapeLine({
        text: 'SUBTOTAL / ENTRY',
        operator: '=',
        value: inputValue,
        runningTotal: inputValue,
        isTotal: true,
      });
      setWaitingForOperand(true);
    }
  }, [displayValue, mode, pendingOperator, accumulator, tapeLines, evaluateOperation, appendTapeLine]);

  // Subtotal (◊)
  const handleSubtotal = useCallback(() => {
    sounds.playOperatorClick();
    const current = subtotal;
    appendTapeLine({
      text: 'SUBTOTAL (RUNNING)',
      operator: 'SUBTOTAL',
      value: current,
      runningTotal: current,
      isSubtotal: true,
    });
    setDisplayValue(String(current));
    setWaitingForOperand(true);
  }, [subtotal, appendTapeLine]);

  // Tax + (Add Tax / GST to current value or running total)
  const handleTaxPlus = useCallback(() => {
    sounds.playOperatorClick();
    const currentVal = parseFloat(displayValue) || 0;
    const base = currentVal !== 0 ? currentVal : subtotal;
    if (base <= 0) return;

    const taxRes = calculateTaxPlus(base, profile.activeTaxRate);
    appendTapeLine({
      text: `Tax @${profile.activeTaxRate}% (+${formatNumberOnly(taxRes.taxAmount)})`,
      operator: 'TAX+',
      value: taxRes.total,
      runningTotal: taxRes.total,
      taxInfo: {
        rate: profile.activeTaxRate,
        amount: taxRes.taxAmount,
        base: taxRes.base,
      },
      isTotal: true,
    });

    setDisplayValue(String(taxRes.total));
    setAccumulator(taxRes.total);
    setWaitingForOperand(true);
  }, [displayValue, subtotal, profile.activeTaxRate, appendTapeLine]);

  // Tax - (Extract Tax / GST from Gross Value)
  const handleTaxMinus = useCallback(() => {
    sounds.playOperatorClick();
    const currentVal = parseFloat(displayValue) || 0;
    if (currentVal <= 0) return;

    const taxRes = calculateTaxMinus(currentVal, profile.activeTaxRate);
    appendTapeLine({
      text: `Gross ${formatNumberOnly(currentVal)} less ${profile.activeTaxRate}% Tax (-${formatNumberOnly(taxRes.taxAmount)})`,
      operator: 'TAX-',
      value: taxRes.base,
      runningTotal: taxRes.base,
      taxInfo: {
        rate: profile.activeTaxRate,
        amount: taxRes.taxAmount,
        base: taxRes.base,
      },
    });

    setDisplayValue(String(taxRes.base));
    setAccumulator(taxRes.base);
    setWaitingForOperand(true);
  }, [displayValue, profile.activeTaxRate, appendTapeLine]);

  // Quick Discount %
  const handleQuickDiscount = useCallback(() => {
    const input = prompt('Enter discount percentage (%) to apply:', '10');
    if (!input) return;
    const pct = parseFloat(input);
    if (isNaN(pct) || pct <= 0) return;

    sounds.playOperatorClick();
    const currentVal = parseFloat(displayValue) || 0;
    const base = currentVal !== 0 ? currentVal : subtotal;
    if (base <= 0) return;

    const discRes = calculateDiscount(base, pct);
    appendTapeLine({
      text: `Discount ${pct}% (Saved ${formatNumberOnly(discRes.savedAmount)})`,
      operator: 'DISC',
      value: discRes.finalPrice,
      runningTotal: discRes.finalPrice,
      discountInfo: {
        rateOrFlat: pct,
        isPercent: true,
        savedAmount: discRes.savedAmount,
      },
    });

    setDisplayValue(String(discRes.finalPrice));
    setAccumulator(discRes.finalPrice);
    setWaitingForOperand(true);
  }, [displayValue, subtotal, appendTapeLine]);

  // Memory Functions (M+, M-, MR, MC)
  const handleMemoryAdd = useCallback(() => {
    sounds.playOperatorClick();
    const current = parseFloat(displayValue) || 0;
    const nextMem = roundTo(memory + current, 2);
    setMemory(nextMem);
    setWaitingForOperand(true);
  }, [displayValue, memory]);

  const handleMemorySub = useCallback(() => {
    sounds.playOperatorClick();
    const current = parseFloat(displayValue) || 0;
    const nextMem = roundTo(memory - current, 2);
    setMemory(nextMem);
    setWaitingForOperand(true);
  }, [displayValue, memory]);

  const handleMemoryRecall = useCallback(() => {
    sounds.playKeypadClick();
    setDisplayValue(String(memory));
    setWaitingForOperand(true);
  }, [memory]);

  const handleMemoryClear = useCallback(() => {
    sounds.playClearClick();
    setMemory(0);
  }, []);

  // Quick department item addition
  const handleAddItemToBill = useCallback((item: QuickDepartmentItem, qty: number) => {
    const itemTotal = roundTo(item.price * qty, 2);
    const currentRunning = tapeLines.length > 0 ? (tapeLines[tapeLines.length - 1].runningTotal || 0) : 0;
    const nextRunning = roundTo(currentRunning + itemTotal, 2);

    appendTapeLine({
      text: `${item.name} (${qty}×${formatNumberOnly(item.price)})`,
      operator: '+',
      value: itemTotal,
      runningTotal: nextRunning,
      note: item.name,
      taxInfo: item.taxRate ? {
        rate: item.taxRate,
        amount: roundTo(itemTotal * (item.taxRate / 100), 2),
        base: itemTotal,
      } : undefined,
    });

    setDisplayValue(String(nextRunning));
    setAccumulator(nextRunning);
    setWaitingForOperand(true);
  }, [tapeLines, appendTapeLine]);

  // Add / Delete quick department keys
  const handleSaveNewItem = useCallback((newItem: Omit<QuickDepartmentItem, 'id'>) => {
    const item: QuickDepartmentItem = {
      ...newItem,
      id: `${Date.now()}`,
    };
    setQuickItems((prev) => [...prev, item]);
  }, []);

  const handleDeleteItem = useCallback((id: string) => {
    setQuickItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  // Update line note on tape
  const handleUpdateLineNote = useCallback((id: string, note: string) => {
    setTapeLines((prev) =>
      prev.map((l) => (l.id === id ? { ...l, note } : l))
    );
  }, []);

  // Finalize Sale from Cash Till
  const handleFinalizeSale = useCallback((saleData: {
    paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
    cashTendered?: number;
    changeGiven?: number;
    customerNote?: string;
  }) => {
    const grand = subtotal;
    const taxesCollected = tapeLines.reduce((sum, l) => sum + (l.taxInfo?.amount || 0), 0);
    const discountsGiven = tapeLines.reduce((sum, l) => sum + (l.discountInfo?.savedAmount || 0), 0);

    const newSale: CompletedSale = {
      id: `sale-${Date.now()}`,
      receiptNumber: `REC-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleString(),
      lines: [...tapeLines],
      subtotal: grand - taxesCollected + discountsGiven,
      taxTotal: taxesCollected,
      discountTotal: discountsGiven,
      grandTotal: grand,
      paymentMethod: saleData.paymentMethod,
      cashTendered: saleData.cashTendered,
      changeGiven: saleData.changeGiven,
      customerNote: saleData.customerNote,
    };

    setSales((prev) => [newSale, ...prev]);

    // Show temporary completion badge
    setShowSaleCelebration(true);
    setTimeout(() => setShowSaleCelebration(false), 3000);

    // Prepare fresh bill
    handleNewBill();
  }, [subtotal, tapeLines, handleNewBill]);

  // Physical Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if focus is in an input or textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement ||
        document.activeElement instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key;

      if (/^[0-9]$/.test(key)) {
        e.preventDefault();
        handleDigit(key);
      } else if (key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (key === '-') {
        e.preventDefault();
        handleOperator('-');
      } else if (key === '*' || key === 'x' || key === 'X') {
        e.preventDefault();
        handleOperator('×');
      } else if (key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (key === 'Enter' || key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (key === 'Escape') {
        e.preventDefault();
        handleAllClear();
      } else if (key === 't' || key === 'T') {
        e.preventDefault();
        handleTaxPlus();
      } else if (key === 'c' || key === 'C') {
        // 'c' opens till if bill has balance
        if (subtotal > 0 && !showCashTill) {
          e.preventDefault();
          setShowCashTill(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleDigit,
    handleDecimal,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleAllClear,
    handleTaxPlus,
    subtotal,
    showCashTill,
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-900">
      {/* 3-Zone Top Navigation Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        shopName={profile.name}
        currencyCode={profile.currencyCode}
        onCurrencyChange={(code) => setProfile((p) => ({ ...p, currencyCode: code }))}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(sounds.toggleSound())}
        onNewBill={handleNewBill}
      />

      {/* Sale Ring Toast Notification */}
      {showSaleCelebration && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-sm font-semibold animate-in slide-in-from-top-4 duration-200">
          <CheckCircle className="w-5 h-5 text-white" />
          <span>Sale Recorded &amp; Cash Till Ringed!</span>
        </div>
      )}

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 md:p-6 flex flex-col gap-4">
        {/* Quick Items / Department Key Shelf */}
        <QuickItemsBar
          items={quickItems}
          currencySymbol={activeCurrency.symbol}
          onAddItemToBill={handleAddItemToBill}
          onSaveNewItem={handleSaveNewItem}
          onDeleteItem={handleDeleteItem}
        />

        {/* Dual Main Columns: Left = Commercial Calculator, Right = Digital Audit Tape */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start flex-1">
          {/* Left Column: Calculator Station (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            {/* VFD / LCD Digital Screen */}
            <CalculatorDisplay
              mainDisplay={formatDisplayNumber(displayValue)}
              formulaDisplay={formulaDisplay}
              subtotal={subtotal}
              memoryValue={memory}
              mode={mode}
              activeTaxRate={profile.activeTaxRate}
              currencySymbol={activeCurrency.symbol}
              lastTapeLine={tapeLines[tapeLines.length - 1]}
              itemCount={tapeLines.length}
            />

            {/* Industrial Commercial Keypad */}
            <Keypad
              onDigit={handleDigit}
              onOperator={handleOperator}
              onEquals={handleEquals}
              onClear={handleClear}
              onAllClear={handleAllClear}
              onBackspace={handleBackspace}
              onDecimal={handleDecimal}
              onDoubleZero={handleDoubleZero}
              onNegate={handleNegate}
              onSubtotal={handleSubtotal}
              onMemoryAdd={handleMemoryAdd}
              onMemorySub={handleMemorySub}
              onMemoryRecall={handleMemoryRecall}
              onMemoryClear={handleMemoryClear}
              onTaxPlus={handleTaxPlus}
              onTaxMinus={handleTaxMinus}
              onQuickDiscount={handleQuickDiscount}
              onOpenCostMargin={() => setShowCostMargin(true)}
              onOpenCashTill={() => setShowCashTill(true)}
              mode={mode}
              onToggleMode={() => setMode((m) => (m === 'standard' ? 'adding_machine' : 'standard'))}
              activeTaxRate={profile.activeTaxRate}
            />

            {/* Cash Drawer & Quick Till Action Bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400">Bill Payable:</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {formatCurrency(subtotal, activeCurrency.symbol)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCostMargin(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Margin %</span>
                </button>

                <button
                  onClick={() => setShowCashTill(true)}
                  disabled={subtotal <= 0}
                  className="px-4 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:pointer-events-none text-white rounded-lg transition-all shadow-md shadow-emerald-950 flex items-center gap-1.5"
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Tender Cash / Till</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Continuous Paper Audit Tape Roll (5 cols on lg) */}
          <div className="lg:col-span-5 h-[520px] lg:h-[650px]">
            <AuditTape
              lines={tapeLines}
              currencySymbol={activeCurrency.symbol}
              onClearTape={() => setTapeLines([])}
              onUpdateLineNote={handleUpdateLineNote}
              onPrintReceipt={() => {
                setActiveReceiptSale(undefined);
                setShowReceipt(true);
              }}
              shopName={profile.name}
            />
          </div>
        </div>
      </main>

      {/* Modals & Business Drawers */}
      <CashTillModal
        isOpen={showCashTill}
        onClose={() => setShowCashTill(false)}
        grandTotal={subtotal}
        currencySymbol={activeCurrency.symbol}
        denominations={activeCurrency.denominations}
        onFinalizeSale={handleFinalizeSale}
      />

      <CostMarginModal
        isOpen={showCostMargin}
        onClose={() => setShowCostMargin(false)}
        currencySymbol={activeCurrency.symbol}
        onLoadPriceToCalculator={(price, label) => {
          setDisplayValue(String(price));
          setWaitingForOperand(false);
          appendTapeLine({
            text: `${label}: ${formatNumberOnly(price)}`,
            value: price,
            note: label,
          });
        }}
      />

      <DayBookModal
        isOpen={showDayBook || activeTab === 'day-book'}
        onClose={() => {
          setShowDayBook(false);
          if (activeTab === 'day-book') setActiveTab('calculator');
        }}
        sales={sales}
        currencySymbol={activeCurrency.symbol}
        shopName={profile.name}
        onViewReceipt={(sale) => {
          setActiveReceiptSale(sale);
          setShowReceipt(true);
        }}
        onClearHistory={() => setSales([])}
      />

      <ShopSettingsModal
        isOpen={showSettings || activeTab === 'settings'}
        onClose={() => {
          setShowSettings(false);
          if (activeTab === 'settings') setActiveTab('calculator');
        }}
        profile={profile}
        onSaveProfile={(updated) => setProfile(updated)}
      />

      <ThermalReceiptModal
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
        shopProfile={profile}
        currencySymbol={activeCurrency.symbol}
        sale={activeReceiptSale}
        currentTapeLines={tapeLines}
        currentSubtotal={subtotal}
        currentGrandTotal={subtotal}
      />
    </div>
  );
}

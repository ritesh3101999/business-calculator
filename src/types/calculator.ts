export type CalculationMode = 'standard' | 'adding_machine';

export interface TapeLine {
  id: string;
  timestamp: string;
  text: string;
  operator?: '+' | '-' | '×' | '÷' | '=' | 'TAX+' | 'TAX-' | 'DISC' | 'MU' | 'SUBTOTAL';
  value: number;
  runningTotal?: number;
  note?: string;
  isTotal?: boolean;
  isSubtotal?: boolean;
  taxInfo?: {
    rate: number;
    amount: number;
    base: number;
  };
  discountInfo?: {
    rateOrFlat: number;
    isPercent: boolean;
    savedAmount: number;
  };
}

export interface Denomination {
  value: number;
  label: string;
  type: 'note' | 'coin';
}

export interface CurrencyConfig {
  code: string;
  name: string;
  symbol: string;
  denominations: Denomination[];
}

export interface ShopProfile {
  name: string;
  tagline: string;
  phone: string;
  taxId: string; // GSTIN or Tax Reg No
  address: string;
  currencyCode: string;
  taxRates: number[];
  activeTaxRate: number;
  taxInclusivePricing: boolean;
}

export interface QuickDepartmentItem {
  id: string;
  name: string;
  price: number;
  taxRate?: number;
  shortcut?: string;
}

export interface CompletedSale {
  id: string;
  receiptNumber: string;
  date: string;
  lines: TapeLine[];
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'credit';
  cashTendered?: number;
  changeGiven?: number;
  customerNote?: string;
}

import { Denomination } from '../types/calculator';

// Round to specified decimal places without floating precision errors
export function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

// Format numbers for display with comma grouping
export function formatDisplayNumber(value: string | number): string {
  if (value === '' || value === '-' || value === undefined || value === null) {
    return '0';
  }
  const str = String(value);
  if (str === 'Error' || str === 'NaN' || str === 'Infinity') {
    return 'Error';
  }

  const parts = str.split('.');
  const intPart = parts[0];
  const decPart = parts.length > 1 ? '.' + parts[1] : '';

  // Handle negative sign
  const isNegative = intPart.startsWith('-');
  const rawInt = isNegative ? intPart.substring(1) : intPart;

  // Add commas
  const formattedInt = rawInt.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return (isNegative ? '-' : '') + formattedInt + decPart;
}

// Calculate Tax Plus: Given net amount and rate %, returns total amount, tax amount, and base
export function calculateTaxPlus(amount: number, taxRate: number) {
  const tax = roundTo(amount * (taxRate / 100), 2);
  const total = roundTo(amount + tax, 2);
  return {
    base: amount,
    taxRate,
    taxAmount: tax,
    total,
  };
}

// Calculate Tax Minus: Given gross amount (tax inclusive) and rate %, extracts base and tax
export function calculateTaxMinus(grossAmount: number, taxRate: number) {
  const base = roundTo(grossAmount / (1 + taxRate / 100), 2);
  const tax = roundTo(grossAmount - base, 2);
  return {
    gross: grossAmount,
    taxRate,
    base,
    taxAmount: tax,
  };
}

// Calculate Discount
export function calculateDiscount(amount: number, discountPercent: number) {
  const saved = roundTo(amount * (discountPercent / 100), 2);
  const finalPrice = roundTo(amount - saved, 2);
  return {
    original: amount,
    discountPercent,
    savedAmount: saved,
    finalPrice,
  };
}

// Cost / Sell / Margin calculations
export function calculateSellFromCostAndMargin(cost: number, marginPercent: number) {
  if (marginPercent >= 100) return { error: 'Margin must be less than 100%' };
  const sell = roundTo(cost / (1 - marginPercent / 100), 2);
  const profit = roundTo(sell - cost, 2);
  const markupPercent = cost > 0 ? roundTo((profit / cost) * 100, 2) : 0;
  return { cost, sell, profit, marginPercent, markupPercent };
}

export function calculateMarginFromCostAndSell(cost: number, sell: number) {
  if (sell <= 0) return { error: 'Sell price must be greater than 0' };
  const profit = roundTo(sell - cost, 2);
  const marginPercent = roundTo((profit / sell) * 100, 2);
  const markupPercent = cost > 0 ? roundTo((profit / cost) * 100, 2) : 0;
  return { cost, sell, profit, marginPercent, markupPercent };
}

export function calculateCostFromSellAndMargin(sell: number, marginPercent: number) {
  const profit = roundTo(sell * (marginPercent / 100), 2);
  const cost = roundTo(sell - profit, 2);
  const markupPercent = cost > 0 ? roundTo((profit / cost) * 100, 2) : 0;
  return { cost, sell, profit, marginPercent, markupPercent };
}

// Change denomination breakdown optimizer
export interface DenominationBreakdownItem {
  denomination: Denomination;
  count: number;
  totalValue: number;
}

export function calculateDenominationBreakdown(
  changeDue: number,
  denominations: Denomination[]
): {
  items: DenominationBreakdownItem[];
  exactChange: boolean;
  remainder: number;
} {
  if (changeDue <= 0) {
    return { items: [], exactChange: true, remainder: 0 };
  }

  let remainingCents = Math.round(changeDue * 100);
  const sortedDenoms = [...denominations].sort((a, b) => b.value - a.value);
  const items: DenominationBreakdownItem[] = [];

  for (const denom of sortedDenoms) {
    const denomCents = Math.round(denom.value * 100);
    if (denomCents <= 0) continue;

    if (remainingCents >= denomCents) {
      const count = Math.floor(remainingCents / denomCents);
      if (count > 0) {
        remainingCents -= count * denomCents;
        items.push({
          denomination: denom,
          count,
          totalValue: roundTo(count * denom.value, 2),
        });
      }
    }
  }

  const remainder = roundTo(remainingCents / 100, 2);

  return {
    items,
    exactChange: remainder === 0,
    remainder,
  };
}

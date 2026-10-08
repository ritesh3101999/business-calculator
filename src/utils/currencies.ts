import { CurrencyConfig } from '../types/calculator';

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: {
    code: 'INR',
    name: 'Indian Rupee',
    symbol: '₹',
    denominations: [
      { value: 2000, label: '₹2,000 Note', type: 'note' },
      { value: 500, label: '₹500 Note', type: 'note' },
      { value: 200, label: '₹200 Note', type: 'note' },
      { value: 100, label: '₹100 Note', type: 'note' },
      { value: 50, label: '₹50 Note', type: 'note' },
      { value: 20, label: '₹20 Note', type: 'note' },
      { value: 10, label: '₹10 Note / Coin', type: 'note' },
      { value: 5, label: '₹5 Coin', type: 'coin' },
      { value: 2, label: '₹2 Coin', type: 'coin' },
      { value: 1, label: '₹1 Coin', type: 'coin' },
    ],
  },
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    denominations: [
      { value: 100, label: '$100 Bill', type: 'note' },
      { value: 50, label: '$50 Bill', type: 'note' },
      { value: 20, label: '$20 Bill', type: 'note' },
      { value: 10, label: '$10 Bill', type: 'note' },
      { value: 5, label: '$5 Bill', type: 'note' },
      { value: 1, label: '$1 Bill', type: 'note' },
      { value: 0.25, label: '25¢ Quarter', type: 'coin' },
      { value: 0.10, label: '10¢ Dime', type: 'coin' },
      { value: 0.05, label: '5¢ Nickel', type: 'coin' },
      { value: 0.01, label: '1¢ Penny', type: 'coin' },
    ],
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    denominations: [
      { value: 100, label: '€100 Note', type: 'note' },
      { value: 50, label: '€50 Note', type: 'note' },
      { value: 20, label: '€20 Note', type: 'note' },
      { value: 10, label: '€10 Note', type: 'note' },
      { value: 5, label: '€5 Note', type: 'note' },
      { value: 2, label: '€2 Coin', type: 'coin' },
      { value: 1, label: '€1 Coin', type: 'coin' },
      { value: 0.50, label: '50c Coin', type: 'coin' },
      { value: 0.20, label: '20c Coin', type: 'coin' },
      { value: 0.10, label: '10c Coin', type: 'coin' },
    ],
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    denominations: [
      { value: 50, label: '£50 Note', type: 'note' },
      { value: 20, label: '£20 Note', type: 'note' },
      { value: 10, label: '£10 Note', type: 'note' },
      { value: 5, label: '£5 Note', type: 'note' },
      { value: 2, label: '£2 Coin', type: 'coin' },
      { value: 1, label: '£1 Coin', type: 'coin' },
      { value: 0.50, label: '50p Coin', type: 'coin' },
      { value: 0.20, label: '20p Coin', type: 'coin' },
      { value: 0.10, label: '10p Coin', type: 'coin' },
    ],
  },
  AED: {
    code: 'AED',
    name: 'UAE Dirham',
    symbol: 'AED ',
    denominations: [
      { value: 500, label: '500 AED Note', type: 'note' },
      { value: 200, label: '200 AED Note', type: 'note' },
      { value: 100, label: '100 AED Note', type: 'note' },
      { value: 50, label: '50 AED Note', type: 'note' },
      { value: 20, label: '20 AED Note', type: 'note' },
      { value: 10, label: '10 AED Note', type: 'note' },
      { value: 5, label: '5 AED Note', type: 'note' },
      { value: 1, label: '1 AED Coin', type: 'coin' },
      { value: 0.50, label: '50 Fils Coin', type: 'coin' },
      { value: 0.25, label: '25 Fils Coin', type: 'coin' },
    ],
  },
};

export const DEFAULT_CURRENCY = 'INR';

export function formatCurrency(amount: number, symbol: string = '₹', decimals: number = 2): string {
  const isNegative = amount < 0;
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
}

export function formatNumberOnly(amount: number, decimals: number = 2): string {
  return amount.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

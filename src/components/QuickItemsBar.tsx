import React, { useState } from 'react';
import { QuickDepartmentItem } from '../types/calculator';
import { formatCurrency } from '../utils/currencies';
import { Plus, Tag, ShoppingBag, X } from 'lucide-react';
import { sounds } from '../utils/audio';

interface QuickItemsBarProps {
  items: QuickDepartmentItem[];
  currencySymbol: string;
  onAddItemToBill: (item: QuickDepartmentItem, qty: number) => void;
  onSaveNewItem: (item: Omit<QuickDepartmentItem, 'id'>) => void;
  onDeleteItem: (id: string) => void;
}

export const QuickItemsBar: React.FC<QuickItemsBarProps> = ({
  items,
  currencySymbol,
  onAddItemToBill,
  onSaveNewItem,
  onDeleteItem,
}) => {
  const [qty, setQty] = useState<number>(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [newItemTax, setNewItemTax] = useState('');

  const handleItemClick = (item: QuickDepartmentItem) => {
    sounds.playKeypadClick();
    onAddItemToBill(item, qty);
    setQty(1); // reset qty after click
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(price) || price < 0) return;

    onSaveNewItem({
      name: newItemName.trim(),
      price,
      taxRate: newItemTax ? parseFloat(newItemTax) : undefined,
    });

    setNewItemName('');
    setNewItemPrice('');
    setNewItemTax('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl p-3 sm:p-4 border border-slate-800 shadow-md">
      {/* Top Header & Quantity Multiplier */}
      <div className="flex items-center justify-between gap-3 mb-2.5 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-slate-200 tracking-wide uppercase">
            Quick Shop Items / PLU Keys
          </h3>
        </div>

        {/* Quantity Stepper Multiplier */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[11px] text-slate-400 px-1 font-mono">QTY:</span>
          {[1, 2, 3, 5, 10].map((q) => (
            <button
              key={q}
              onClick={() => {
                sounds.playKeypadClick();
                setQty(q);
              }}
              className={`px-2 py-0.5 rounded text-xs font-mono font-bold transition-all ${
                qty === q
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {q}×
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Quick Keys */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
        {items.map((item) => (
          <div key={item.id} className="relative group">
            <button
              onClick={() => handleItemClick(item)}
              className="w-full text-left p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-100 transition-all active:scale-95 shadow-xs flex flex-col justify-between h-14"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold truncate text-slate-200">
                  {item.name}
                </span>
                {item.taxRate ? (
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 px-1 rounded">
                    {item.taxRate}%
                  </span>
                ) : null}
              </div>
              <div className="flex items-baseline justify-between w-full mt-0.5">
                <span className="text-xs font-mono font-bold text-emerald-300">
                  {formatCurrency(item.price * qty, currencySymbol)}
                </span>
                {qty > 1 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({qty}×{formatCurrency(item.price, currencySymbol)})
                  </span>
                )}
              </div>
            </button>

            {/* Quick delete item button on hover */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteItem(item.id);
              }}
              className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 hover:scale-110 flex items-center justify-center transition-all shadow-xs"
              title="Delete quick item"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </div>
        ))}

        {/* Add New Quick Item Key */}
        <button
          onClick={() => setShowAddModal(true)}
          className="p-2 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500 bg-slate-900/40 hover:bg-slate-800/50 text-slate-400 hover:text-emerald-400 transition-all flex flex-col items-center justify-center gap-1 h-14"
          title="Add Custom Quick Product Key"
        >
          <Plus className="w-4 h-4" />
          <span className="text-[10px] font-medium">+ Add Item</span>
        </button>
      </div>

      {/* Add New Quick Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Create Quick Product Key</span>
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product / Service Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Milk 1L, Coffee, Delivery"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Price ({currencySymbol})
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newItemPrice}
                    onChange={(e) => setNewItemPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={newItemTax}
                    onChange={(e) => setNewItemTax(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm"
                >
                  Save Key
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

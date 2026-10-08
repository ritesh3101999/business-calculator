import React, { useState } from 'react';
import { ShopProfile } from '../types/calculator';
import { CURRENCIES } from '../utils/currencies';
import { X, Settings, Store, Phone, FileText, MapPin, Percent, Save } from 'lucide-react';

interface ShopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ShopProfile;
  onSaveProfile: (updated: ShopProfile) => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [formData, setFormData] = useState<ShopProfile>({ ...profile });
  const [customTaxInput, setCustomTaxInput] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  const handleAddTaxRate = () => {
    const rate = parseFloat(customTaxInput);
    if (!isNaN(rate) && rate > 0 && !formData.taxRates.includes(rate)) {
      setFormData({
        ...formData,
        taxRates: [...formData.taxRates, rate].sort((a, b) => a - b),
        activeTaxRate: rate,
      });
      setCustomTaxInput('');
    }
  };

  const handleRemoveTaxRate = (rate: number) => {
    const newRates = formData.taxRates.filter((r) => r !== rate);
    if (newRates.length > 0) {
      setFormData({
        ...formData,
        taxRates: newRates,
        activeTaxRate: formData.activeTaxRate === rate ? newRates[0] : formData.activeTaxRate,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base tracking-tight">
              Shop Profile &amp; Calculator Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Shop Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span>Shop / Store Name</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Sharma General Store &amp; Traders"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Subtitle / Tagline */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Shop Tagline / Type
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="e.g. Retail, Wholesale &amp; Grocery"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Phone & Tax ID (GSTIN) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-500" />
                <span>Contact Phone</span>
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <FileText className="w-3 h-3 text-slate-500" />
                <span>GSTIN / Tax ID</span>
              </label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                placeholder="22AAAAA0000A1Z5"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono focus:outline-none focus:border-emerald-500 uppercase"
              />
            </div>
          </div>

          {/* Shop Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-slate-500" />
              <span>Shop Address / Receipt Header</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Main Market Road, City - 110001"
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Currency Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Operating Currency
            </label>
            <select
              value={formData.currencyCode}
              onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500"
            >
              {Object.keys(CURRENCIES).map((code) => (
                <option key={code} value={code}>
                  {CURRENCIES[code].symbol} - {CURRENCIES[code].name} ({code})
                </option>
              ))}
            </select>
          </div>

          {/* Tax / GST Presets */}
          <div className="pt-2 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5 flex items-center gap-1">
              <Percent className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tax / GST Rates Presets</span>
            </label>

            {/* Existing rate badges */}
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.taxRates.map((rate) => (
                <div
                  key={rate}
                  onClick={() => setFormData({ ...formData, activeTaxRate: rate })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                    formData.activeTaxRate === rate
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  }`}
                >
                  <span>{rate}%</span>
                  {formData.taxRates.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTaxRate(rate);
                      }}
                      className="text-slate-400 hover:text-rose-500 text-xs leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add new rate */}
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="any"
                value={customTaxInput}
                onChange={(e) => setCustomTaxInput(e.target.value)}
                placeholder="Add custom rate (e.g. 8.25)"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddTaxRate}
                className="px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                + Add Rate
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-2 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-950 flex items-center justify-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Shop Settings</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

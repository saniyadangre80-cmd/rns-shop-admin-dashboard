import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  Trash2, 
  Check, 
  Copy, 
  Calendar, 
  Sparkles, 
  X,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Coupon } from '../../types/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface CouponsViewProps {
  coupons: Coupon[];
  currency?: string;
  onCreateCoupon: (coupon: Partial<Coupon>) => Promise<void>;
  onUpdateCoupon: (id: number, coupon: Partial<Coupon>) => Promise<void>;
  onDeleteCoupon: (id: number) => Promise<void>;
}

export const CouponsView: React.FC<CouponsViewProps> = ({
  coupons,
  currency = '$',
  onCreateCoupon,
  onUpdateCoupon,
  onDeleteCoupon
}) => {
  const { showToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [code, setCode] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState<number | string>(20);
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>(50);
  const [expiryDate, setExpiryDate] = useState('2026-12-31');
  const [maxUsage, setMaxUsage] = useState<number | string>(500);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateRandomCode = () => {
    const prefixes = ['RNS', 'SUMMER', 'WINTER', 'FLASH', 'VIP', 'OFFER'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = [10, 15, 20, 25, 30, 40, 50][Math.floor(Math.random() * 7)];
    setCode(`${prefix}${num}`);
    setDiscountPercentage(num);
  };

  const copyCode = (coupon: Coupon) => {
    navigator.clipboard.writeText(coupon.code);
    setCopiedId(coupon.id);
    showToast('info', 'Code Copied', `Coupon ${coupon.code} copied to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Coupon code is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onCreateCoupon({
        code: code.trim().toUpperCase(),
        discount_percentage: Number(discountPercentage),
        min_order_amount: Number(minOrderAmount || 0),
        expiry_date: expiryDate,
        max_usage: Number(maxUsage || 1000),
        status
      });
      setModalOpen(false);
      setCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to create coupon');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Coupons & Promotional Offers</h2>
          <p className="text-xs text-slate-500">Create discount percentage codes and minimum spend triggers for RNS SHOP shoppers</p>
        </div>
        <button
          onClick={() => {
            generateRandomCode();
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Coupon Code</th>
                <th className="py-3 px-4">Discount</th>
                <th className="py-3 px-4">Minimum Order</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Redemption Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {coupons.map(coupon => {
                const isExpired = new Date(coupon.expiry_date) < new Date();

                return (
                  <tr key={coupon.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Code & Copy button */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2.5 py-1 rounded-lg text-xs">
                          {coupon.code}
                        </span>
                        <button
                          onClick={() => copyCode(coupon)}
                          className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Copy Code"
                        >
                          {copiedId === coupon.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>

                    {/* Discount */}
                    <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-900 tabular-nums">
                      {coupon.discount_percentage}% OFF
                    </td>

                    {/* Minimum Order */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium tabular-nums">
                      {coupon.min_order_amount > 0 ? `${currency}${coupon.min_order_amount.toFixed(2)}` : 'No minimum'}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 font-mono text-[11px] ${
                        isExpired ? 'text-rose-600 font-bold' : 'text-slate-600'
                      }`}>
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{coupon.expiry_date}</span>
                        {isExpired && <span>(Expired)</span>}
                      </span>
                    </td>

                    {/* Redemptions */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 tabular-nums">
                      <span className="font-semibold text-slate-800">{coupon.usage_count}</span>
                      <span className="text-slate-400"> / {coupon.max_usage} uses</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <button
                        onClick={() => onUpdateCoupon(coupon.id, { status: coupon.status === 'active' ? 'inactive' : 'active' })}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                          coupon.status === 'active' && !isExpired
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {coupon.status === 'active' ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{coupon.status === 'active' ? 'Active' : 'Disabled'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => onDeleteCoupon(coupon.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create Discount Coupon</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Coupon Code *</label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={code}
                  onChange={e => setCode(e.target.value.toUpperCase())}
                  placeholder="RNS25"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold tracking-wider uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Discount (%) *</label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={discountPercentage}
                    onChange={e => setDiscountPercentage(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min. Order ({currency})</label>
                  <input
                    type="number"
                    min="0"
                    value={minOrderAmount}
                    onChange={e => setMinOrderAmount(e.target.value)}
                    placeholder="50"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expiry Date *</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={e => setExpiryDate(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={maxUsage}
                    onChange={e => setMaxUsage(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Launch Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

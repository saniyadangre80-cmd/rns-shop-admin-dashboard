import React, { useState } from 'react';
import { 
  Warehouse, 
  AlertTriangle, 
  XCircle, 
  CheckCircle, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  History,
  RotateCcw,
  Plus,
  Minus
} from 'lucide-react';
import { Product, InventoryLog } from '../../types/index.ts';

interface InventoryViewProps {
  products: Product[];
  inventoryLogs: InventoryLog[];
  currency?: string;
  onAdjustStock: (productId: number, adjustment: number, reason: string) => Promise<void>;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  inventoryLogs,
  currency = '$',
  onAdjustStock
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Low' | 'Out' | 'InStock'>('All');
  const [selectedProductForRestock, setSelectedProductForRestock] = useState<Product | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(10);
  const [restockReason, setRestockReason] = useState<string>('Restock from Manufacturer');
  const [loading, setLoading] = useState(false);

  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity < 10).length;
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length;
  const totalUnits = products.reduce((sum, p) => sum + p.stock_quantity, 0);

  const filteredProducts = products.filter(p => {
    if (filter === 'Low' && (p.stock_quantity <= 0 || p.stock_quantity >= 10)) return false;
    if (filter === 'Out' && p.stock_quantity > 0) return false;
    if (filter === 'InStock' && p.stock_quantity < 10) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });

  const handleRestockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForRestock || !restockAmount) return;

    setLoading(true);
    try {
      await onAdjustStock(selectedProductForRestock.id, Number(restockAmount), restockReason);
      setSelectedProductForRestock(null);
      setRestockAmount(10);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Inventory Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Warehouse Units</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1 tabular-nums">{totalUnits} pcs</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across {products.length} catalog items</p>
        </div>

        <div 
          onClick={() => setFilter('Low')} 
          className="bg-orange-50/60 border border-orange-200/70 rounded-2xl p-4 shadow-xs cursor-pointer hover:bg-orange-100/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-orange-800 uppercase tracking-wider">Low Stock Warning</span>
            <AlertTriangle className="w-4 h-4 text-orange-600" />
          </div>
          <p className="text-2xl font-extrabold text-orange-950 mt-1 tabular-nums">{lowStockCount} items</p>
          <p className="text-[11px] text-orange-700 mt-0.5">&lt; 10 units remaining</p>
        </div>

        <div 
          onClick={() => setFilter('Out')}
          className="bg-rose-50/60 border border-rose-200/70 rounded-2xl p-4 shadow-xs cursor-pointer hover:bg-rose-100/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">Out of Stock</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-rose-950 mt-1 tabular-nums">{outOfStockCount} items</p>
          <p className="text-[11px] text-rose-700 mt-0.5">Orders temporarily halted</p>
        </div>

        <div 
          onClick={() => setFilter('InStock')}
          className="bg-emerald-50/60 border border-emerald-200/70 rounded-2xl p-4 shadow-xs cursor-pointer hover:bg-emerald-100/60 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">Adequate Stock</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-950 mt-1 tabular-nums">
            {products.length - lowStockCount - outOfStockCount} items
          </p>
          <p className="text-[11px] text-emerald-700 mt-0.5">Healthy supply chain</p>
        </div>
      </div>

      {/* Main Stock Table & Controls */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter stock by product name or SKU..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {(['All', 'Low', 'Out', 'InStock'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  filter === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {tab === 'All' ? 'All Products' : tab === 'Low' ? 'Low Stock' : tab === 'Out' ? 'Out of Stock' : 'Nominal'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Apparel Product</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Stock Level</th>
                <th className="py-3 px-4 text-right">Quick Restock Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map(p => {
                const isLow = p.stock_quantity > 0 && p.stock_quantity < 10;
                const isOut = p.stock_quantity === 0;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover ring-1 ring-slate-200 shrink-0" />
                        <div>
                          <p className="font-bold text-slate-900">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.sizes?.join(', ')}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-semibold text-slate-600">
                      {p.sku}
                    </td>

                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {p.category}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 tabular-nums">
                      {currency}{p.price.toFixed(2)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        isOut ? 'bg-rose-100 text-rose-800' :
                        isLow ? 'bg-orange-100 text-orange-800' :
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {isOut ? 'Out of Stock (0)' : `${p.stock_quantity} available`}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onAdjustStock(p.id, 5, 'Quick Restock +5')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                          title="Restock 5 units"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => onAdjustStock(p.id, 10, 'Quick Restock +10')}
                          className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] transition-colors"
                          title="Restock 10 units"
                        >
                          +10
                        </button>
                        <button
                          onClick={() => {
                            setSelectedProductForRestock(p);
                            setRestockAmount(25);
                          }}
                          className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition-colors ml-1 cursor-pointer"
                        >
                          Custom Restock
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inventory Movement Audit Logs */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <History className="w-4 h-4 text-indigo-600" />
          <h3 className="text-sm font-bold text-slate-900">Inventory Movement Audit Trail</h3>
          <span className="text-[11px] text-slate-400">Live stock ledger</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3">Reason</th>
                <th className="py-2.5 px-3">Stock Change</th>
                <th className="py-2.5 px-3">Previous</th>
                <th className="py-2.5 px-3">New Stock</th>
                <th className="py-2.5 px-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {inventoryLogs.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="py-2 px-3 font-sans font-medium text-slate-800">
                    {log.product_name}
                  </td>
                  <td className="py-2 px-3 font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                      log.reason === 'Restock' ? 'bg-emerald-50 text-emerald-700' :
                      log.reason === 'Order Placed' ? 'bg-blue-50 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {log.reason}
                    </span>
                  </td>
                  <td className={`py-2 px-3 font-bold ${log.change > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </td>
                  <td className="py-2 px-3 text-slate-500">{log.previous_stock}</td>
                  <td className="py-2 px-3 font-bold text-slate-900">{log.new_stock}</td>
                  <td className="py-2 px-3 text-right text-slate-400 font-sans text-[11px]">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Custom Restock Modal */}
      {selectedProductForRestock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900">Restock Product</h3>
            <p className="text-xs text-slate-500 mt-1">
              Adding inventory to <span className="font-semibold text-slate-800">{selectedProductForRestock.name}</span>
            </p>

            <form onSubmit={handleRestockSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Units to Add</label>
                <input
                  type="number"
                  min="1"
                  value={restockAmount}
                  onChange={e => setRestockAmount(Number(e.target.value))}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Restock Reason / Supplier Note</label>
                <input
                  type="text"
                  value={restockReason}
                  onChange={e => setRestockReason(e.target.value)}
                  placeholder="e.g. Batch Shipment #5492 from Mill"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Current Stock:</span>
                  <span className="font-mono font-bold">{selectedProductForRestock.stock_quantity} pcs</span>
                </div>
                <div className="flex justify-between font-bold text-indigo-700 pt-1 border-t border-slate-200">
                  <span>Projected New Stock:</span>
                  <span className="font-mono">{selectedProductForRestock.stock_quantity + (Number(restockAmount) || 0)} pcs</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedProductForRestock(null)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {loading ? 'Updating...' : 'Confirm Restock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  Check, 
  AlertTriangle, 
  Tag, 
  ArrowUpDown,
  Eye,
  EyeOff
} from 'lucide-react';
import { Product, Category } from '../../types/index.ts';

interface ProductsViewProps {
  products: Product[];
  categories: Category[];
  currency?: string;
  onOpenAddModal: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => Promise<void>;
  onToggleStatus: (product: Product) => Promise<void>;
  onQuickUpdateStock: (id: number, adjustment: number) => Promise<void>;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  categories,
  currency = '$',
  onOpenAddModal,
  onEditProduct,
  onDeleteProduct,
  onToggleStatus,
  onQuickUpdateStock
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out'>('All');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'newest'>('newest');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'All' && p.status !== selectedStatus) {
        return false;
      }
      // Stock filter
      if (stockFilter === 'Low' && (p.stock_quantity <= 0 || p.stock_quantity >= 10)) {
        return false;
      }
      if (stockFilter === 'Out' && p.stock_quantity > 0) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesSku = p.sku.toLowerCase().includes(q);
        const matchesCat = p.category.toLowerCase().includes(q);
        return matchesName || matchesSku || matchesCat;
      }
      return true;
    }).sort((a, b) => {
      let result = 0;
      if (sortBy === 'name') result = a.name.localeCompare(b.name);
      else if (sortBy === 'price') result = a.price - b.price;
      else if (sortBy === 'stock') result = a.stock_quantity - b.stock_quantity;
      else if (sortBy === 'newest') result = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return sortOrder === 'asc' ? result : -result;
    });
  }, [products, selectedCategory, selectedStatus, stockFilter, search, sortBy, sortOrder]);

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    setIsDeleting(true);
    try {
      await onDeleteProduct(deleteCandidate.id);
      setDeleteCandidate(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSort = (field: 'name' | 'price' | 'stock' | 'newest') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products by title, SKU, or tag..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>

          {/* Add Product Button */}
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
          {/* Category Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Categories ({products.length})</option>
              {categories.map(c => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Visibility
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Stock Level Filter */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Stock Alerts
            </label>
            <select
              value={stockFilter}
              onChange={e => setStockFilter(e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Stock Levels</option>
              <option value="Low">Low Stock (&lt; 10 units)</option>
              <option value="Out">Out of Stock (0 units)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Sort By
            </label>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={e => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              <option value="newest-desc">Newest Added</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="stock-asc">Stock: Low to High</option>
              <option value="stock-desc">Stock: High to Low</option>
              <option value="name-asc">Product Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Product Details</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('price')}>
                  <div className="flex items-center gap-1">
                    <span>Pricing</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-slate-900" onClick={() => toggleSort('stock')}>
                  <div className="flex items-center gap-1">
                    <span>Inventory</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No products match your filter criteria.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try resetting the category filter or search query.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const isLow = product.stock_quantity > 0 && product.stock_quantity < 10;
                  const isOut = product.stock_quantity === 0;

                  return (
                    <tr key={product.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0 bg-slate-100"
                          />
                          <div className="min-w-0 max-w-xs">
                            <p className="font-bold text-slate-900 truncate leading-snug">{product.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-400">
                              <span className="font-mono text-slate-500 font-semibold">{product.sku}</span>
                              <span>·</span>
                              <span>{product.sizes?.join(', ')}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {product.category}
                      </td>

                      {/* Pricing & Discount */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-bold text-slate-900 text-sm tabular-nums">
                            {currency}{product.price.toFixed(2)}
                          </span>
                          {product.original_price > product.price && (
                            <span className="text-[11px] line-through text-slate-400 tabular-nums">
                              {currency}{product.original_price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {product.discount > 0 && (
                          <span className="inline-block text-[10px] font-bold text-indigo-600 mt-0.5">
                            {product.discount}% OFF
                          </span>
                        )}
                      </td>

                      {/* Inventory Stock & Quick Adjustment */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut ? 'bg-rose-100 text-rose-800' :
                            isLow ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {isOut ? 'Out of Stock' : `${product.stock_quantity} in stock`}
                          </span>
                          {/* Quick Adjust Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onQuickUpdateStock(product.id, 5)}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold transition-colors"
                              title="Restock +5 units"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => onQuickUpdateStock(product.id, -1)}
                              disabled={product.stock_quantity <= 0}
                              className="px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[10px] font-bold transition-colors disabled:opacity-30"
                              title="Deduct -1 unit"
                            >
                              -1
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => onToggleStatus(product)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                            product.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                          }`}
                          title={`Click to mark ${product.status === 'active' ? 'Inactive' : 'Active'}`}
                        >
                          {product.status === 'active' ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="capitalize">{product.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="Edit Product"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteCandidate(product)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredProducts.length} of {products.length} products</span>
          <span className="font-semibold text-slate-700">RNS SHOP Catalog Database</span>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Delete Product?</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-slate-800">"{deleteCandidate.name}"</span>? This will permanently remove the item from the catalog.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

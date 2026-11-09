import React, { useState, useEffect } from 'react';
import { X, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { Product, Category } from '../../types/index.ts';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (productData: Partial<Product>) => Promise<void>;
  productToEdit?: Product | null;
  categories: Category[];
  currency?: string;
}

// Preset high-fidelity studio assets available in the project
const PRESET_IMAGES = [
  { label: 'Indigo Denim Jacket', url: '/src/assets/images/rns_denim_jacket_1794128109654.jpg' },
  { label: 'Charcoal Streetwear Hoodie', url: '/src/assets/images/rns_oversized_hoodie_1794128108141.jpg' },
  { label: 'Ivory Silk Blouse', url: '/src/assets/images/rns_silk_blouse_1794128111363.jpg' },
  { label: 'Pleated Linen Trousers', url: '/src/assets/images/rns_linen_trousers_1794128110487.jpg' },
  { label: 'Midnight Wool Overcoat', url: 'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600' },
  { label: 'Ribbed Merino Knit', url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600' },
  { label: 'Cotton Poplin Shirt', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600' },
  { label: 'Italian Leather Belt', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  productToEdit,
  categories,
  currency = '$'
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState<number | string>('');
  const [originalPrice, setOriginalPrice] = useState<number | string>('');
  const [discount, setDiscount] = useState<number>(0);
  const [image, setImage] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number | string>('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [sku, setSku] = useState('');
  const [sizes, setSizes] = useState<string[]>(['S', 'M', 'L', 'XL']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setDescription(productToEdit.description);
      setCategory(productToEdit.category);
      setPrice(productToEdit.price);
      setOriginalPrice(productToEdit.original_price || productToEdit.price);
      setDiscount(productToEdit.discount || 0);
      setImage(productToEdit.image);
      setStockQuantity(productToEdit.stock_quantity);
      setStatus(productToEdit.status);
      setSku(productToEdit.sku);
      setSizes(productToEdit.sizes || ['S', 'M', 'L', 'XL']);
    } else {
      // Defaults for new product
      setName('');
      setDescription('');
      setCategory(categories[0]?.name || 'Denim & Outerwear');
      setPrice('');
      setOriginalPrice('');
      setDiscount(0);
      setImage(PRESET_IMAGES[0].url);
      setStockQuantity(25);
      setStatus('active');
      setSku(`RNS-PRD-${Math.floor(100 + Math.random() * 900)}`);
      setSizes(['S', 'M', 'L', 'XL']);
    }
    setError(null);
  }, [productToEdit, categories, isOpen]);

  // Recalculate discount whenever price or original price changes
  const handlePriceChange = (val: string) => {
    setPrice(val);
    const p = parseFloat(val);
    const op = parseFloat(String(originalPrice));
    if (!isNaN(p) && !isNaN(op) && op > p) {
      setDiscount(Math.round(((op - p) / op) * 100));
    }
  };

  const handleOriginalPriceChange = (val: string) => {
    setOriginalPrice(val);
    const op = parseFloat(val);
    const p = parseFloat(String(price));
    if (!isNaN(p) && !isNaN(op) && op > p) {
      setDiscount(Math.round(((op - p) / op) * 100));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Product name is required');
      return;
    }
    if (!price || Number(price) <= 0) {
      setError('Please provide a valid selling price');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedCategoryObj = categories.find(c => c.name === category);
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        category,
        category_id: selectedCategoryObj?.id || 1,
        price: Number(price),
        original_price: Number(originalPrice || price),
        discount: Number(discount),
        image: image || PRESET_IMAGES[0].url,
        stock_quantity: Number(stockQuantity || 0),
        status,
        sku: sku.trim() || `RNS-PRD-${Math.floor(100 + Math.random() * 900)}`,
        sizes
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {productToEdit ? 'Edit Fashion Product' : 'Add New Clothing Product'}
            </h2>
            <p className="text-xs text-slate-500">
              {productToEdit ? `Updating #${productToEdit.sku}` : 'Fill in the catalog details and stock levels'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Product Name & SKU */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Vintage Distressed Indigo Denim Jacket"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                SKU Code
              </label>
              <input
                type="text"
                value={sku}
                onChange={e => setSku(e.target.value)}
                placeholder="RNS-DNM-001"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description & Fabric Details
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="Crafted from 100% Japanese selvedge denim with tailored distressing..."
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Visibility Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'active' | 'inactive')}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="active">Active (Visible in Catalog)</option>
                <option value="inactive">Inactive (Hidden from Store)</option>
              </select>
            </div>
          </div>

          {/* Pricing, Original Price & Discount */}
          <div className="grid grid-cols-3 gap-3.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/70">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price ({currency}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => handlePriceChange(e.target.value)}
                placeholder="139.99"
                required
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Original Price ({currency})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={originalPrice}
                onChange={e => handleOriginalPriceChange(e.target.value)}
                placeholder="189.99"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Discount (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-indigo-700 font-mono font-bold focus:outline-none focus:border-indigo-500"
                />
                <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">%</span>
              </div>
            </div>
          </div>

          {/* Stock Quantity & Sizes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Stock Quantity <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                value={stockQuantity}
                onChange={e => setStockQuantity(e.target.value)}
                placeholder="40"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Available Sizes (comma-separated)
              </label>
              <input
                type="text"
                value={sizes.join(', ')}
                onChange={e => setSizes(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                placeholder="S, M, L, XL"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Product Image Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Product Image URL / Asset
            </label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
                {image ? (
                  <img src={image} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300">
                    <Upload className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="https://... or choose preset below"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-[11px] font-semibold text-slate-700 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Image File</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                  <span className="text-[11px] text-slate-400">or pick preset:</span>
                </div>
              </div>
            </div>

            {/* Presets Gallery */}
            <div className="mt-3">
              <div className="flex items-center gap-1.5 mb-2 text-[11px] font-semibold text-slate-500">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>RNS Studio High-Res Fashion Presets:</span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_IMAGES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(preset.url)}
                    className={`h-14 rounded-lg overflow-hidden border-2 transition-all relative ${
                      image === preset.url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-slate-200 hover:border-slate-300'
                    }`}
                    title={preset.label}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Saving...' : productToEdit ? 'Update Product' : 'Add to Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

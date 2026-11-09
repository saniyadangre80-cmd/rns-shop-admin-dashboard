import React, { useState } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Layers, 
  X, 
  Upload, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { Category } from '../../types/index.ts';

interface CategoriesViewProps {
  categories: Category[];
  onCreateCategory: (cat: Partial<Category>) => Promise<void>;
  onUpdateCategory: (id: number, cat: Partial<Category>) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

export const CategoriesView: React.FC<CategoriesViewProps> = ({
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setImage('/src/assets/images/rns_denim_jacket_1794128109654.jpg');
    setStatus('active');
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description);
    setImage(cat.image);
    setStatus(cat.status);
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, {
          name: name.trim(),
          slug,
          description: description.trim(),
          image,
          status
        });
      } else {
        await onCreateCategory({
          name: name.trim(),
          slug,
          description: description.trim(),
          image: image || '/src/assets/images/rns_denim_jacket_1794128109654.jpg',
          status
        });
      }
      setModalOpen(false);
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Apparel Categories</h2>
          <p className="text-xs text-slate-500">Organize and curate RNS SHOP clothing departments and hero collections</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {categories.map(cat => (
          <div
            key={cat.id}
            className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="relative h-40 bg-slate-100 overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-xs ${
                    cat.status === 'active' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {cat.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">{cat.name}</h3>
                  <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {cat.product_count} {cat.product_count === 1 ? 'item' : 'items'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {cat.description || 'No description provided.'}
                </p>
                <p className="text-[10px] font-mono text-slate-400 mt-2">
                  slug: /{cat.slug}
                </p>
              </div>
            </div>

            {/* Footer actions */}
            <div className="px-4 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => onUpdateCategory(cat.id, { status: cat.status === 'active' ? 'inactive' : 'active' })}
                className="text-[11px] font-semibold text-slate-600 hover:text-indigo-600 flex items-center gap-1"
              >
                {cat.status === 'active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{cat.status === 'active' ? 'Deactivate' : 'Activate'}</span>
              </button>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => openEditModal(cat)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                  title="Edit Category"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteCategory(cat.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Add / Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-base font-bold text-slate-900">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Vintage Leather Jackets"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Apparel department description..."
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Image URL
                </label>
                <input
                  type="text"
                  value={image}
                  onChange={e => setImage(e.target.value)}
                  placeholder="/src/assets/images/... or https://"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                >
                  <option value="active">Active (Visible in Catalog)</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

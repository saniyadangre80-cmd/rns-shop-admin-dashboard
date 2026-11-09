import React from 'react';
import { Menu, Search, Bell, ExternalLink, Plus, RefreshCw } from 'lucide-react';
import { NavTab } from './Sidebar.tsx';

interface HeaderProps {
  currentTab: NavTab;
  onOpenSidebar: () => void;
  onOpenStorefront: () => void;
  onAddProduct: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lowStockCount?: number;
  pendingOrderCount?: number;
}

const TAB_TITLES: Record<NavTab, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard Overview', subtitle: 'Real-time sales, order statistics, and store performance' },
  products: { title: 'Product Catalog', subtitle: 'Manage prices, discounts, stock levels, and apparel items' },
  'add-product': { title: 'Add New Product', subtitle: 'Create a new clothing product with images and stock' },
  categories: { title: 'Categories Management', subtitle: 'Organize fashion collections and category imagery' },
  orders: { title: 'Order Fulfillment', subtitle: 'Track shipments, update statuses, and customer invoices' },
  customers: { title: 'Customer Directory', subtitle: 'Client spending, order histories, and contact information' },
  inventory: { title: 'Inventory & Stock Control', subtitle: 'Stock movements, restock alerts, and audit trails' },
  coupons: { title: 'Offers & Promotional Coupons', subtitle: 'Create and activate discount codes for marketing' },
  reports: { title: 'Reports & Analytics', subtitle: 'Revenue forecasts, sales breakdown, and data export' },
  settings: { title: 'Store Settings & MySQL Schema', subtitle: 'Configure RNS SHOP branding, rates, and database queries' }
};

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onOpenSidebar,
  onOpenStorefront,
  onAddProduct,
  onRefresh,
  isRefreshing,
  searchQuery,
  onSearchChange,
  lowStockCount = 0,
  pendingOrderCount = 0
}) => {
  const currentMeta = TAB_TITLES[currentTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-all">
      {/* Left: Mobile hamburger & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>RNS SHOP</span>
            <span aria-hidden="true" className="text-slate-300">/</span>
            <span className="text-indigo-600 font-semibold capitalize">{currentTab.replace('-', ' ')}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 truncate">
            {currentMeta.title}
          </h1>
        </div>
      </div>

      {/* Right: Search, Storefront Switcher, Quick Action */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        {/* Search Input (tablet & desktop) */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={`Search ${currentTab}...`}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
          title="Refresh database data"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-600' : ''}`} />
        </button>

        {/* Low Stock / Notification Indicator */}
        <div className="relative">
          <button 
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors relative"
            title={`${lowStockCount} items low on stock, ${pendingOrderCount} pending orders`}
          >
            <Bell className="w-4 h-4" />
            {(lowStockCount > 0 || pendingOrderCount > 0) && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* Live Customer Storefront Preview Button */}
        <button
          onClick={onOpenStorefront}
          className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all cursor-pointer shadow-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Customer Storefront</span>
        </button>

        {/* Add Product Shortcut (if not on add-product page) */}
        {currentTab !== 'add-product' && (
          <button
            onClick={onAddProduct}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        )}
      </div>
    </header>
  );
};

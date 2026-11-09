import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  Layers, 
  ShoppingCart, 
  Users, 
  Warehouse, 
  Tag, 
  BarChart3, 
  Settings, 
  LogOut, 
  X,
  ExternalLink,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

export type NavTab = 
  | 'dashboard' 
  | 'products' 
  | 'add-product' 
  | 'categories' 
  | 'orders' 
  | 'customers' 
  | 'inventory' 
  | 'coupons' 
  | 'reports' 
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onClose: () => void;
  counts?: {
    pendingOrders?: number;
    lowStock?: number;
  };
  onOpenStorefront?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onClose,
  counts,
  onOpenStorefront
}) => {
  const { user, logout } = useAuth();

  const menuItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'add-product', label: 'Add Product', icon: PlusCircle },
    { id: 'categories', label: 'Categories', icon: Layers },
    { 
      id: 'orders', 
      label: 'Orders', 
      icon: ShoppingCart, 
      badge: counts?.pendingOrders ? `${counts.pendingOrders} new` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
    },
    { id: 'customers', label: 'Customers', icon: Users },
    { 
      id: 'inventory', 
      label: 'Inventory', 
      icon: Warehouse,
      badge: counts?.lowStock ? `${counts.lowStock} alert` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
    },
    { id: 'coupons', label: 'Coupons & Discounts', icon: Tag },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-slate-950/70 z-40 lg:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      {/* Sidebar container */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo & Brand Zone */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 ring-1 ring-white/20">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold tracking-tight text-white">RNS</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-indigo-500 to-purple-600 text-white tracking-wider">
                  SHOP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">ADMIN CONSOLE</p>
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Storefront Quick Switcher Button */}
        {onOpenStorefront && (
          <div className="px-3 pt-3">
            <button
              onClick={() => {
                onOpenStorefront();
                onClose();
              }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 hover:bg-indigo-900/50 hover:text-white transition-all text-xs font-semibold group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>View Storefront</span>
              </div>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300">Live</span>
            </button>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu
          </div>

          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* User Card & Logout Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                alt={user?.name || "Admin"}
                className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name || 'Saniya Dangre'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.role || 'Super Admin'}</p>
              </div>
            </div>

            <button
              onClick={logout}
              title="Logout from Admin Dashboard"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

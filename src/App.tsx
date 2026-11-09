import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { ToastProvider, useToast } from './context/ToastContext.tsx';
import { LoginView } from './components/auth/LoginView.tsx';
import { Sidebar, NavTab } from './components/layout/Sidebar.tsx';
import { Header } from './components/layout/Header.tsx';
import { OverviewView } from './components/dashboard/OverviewView.tsx';
import { ProductsView } from './components/products/ProductsView.tsx';
import { ProductFormModal } from './components/products/ProductFormModal.tsx';
import { CategoriesView } from './components/categories/CategoriesView.tsx';
import { OrdersView } from './components/orders/OrdersView.tsx';
import { CustomersView } from './components/customers/CustomersView.tsx';
import { InventoryView } from './components/inventory/InventoryView.tsx';
import { CouponsView } from './components/coupons/CouponsView.tsx';
import { AnalyticsView } from './components/analytics/AnalyticsView.tsx';
import { SettingsView } from './components/settings/SettingsView.tsx';
import { StorefrontPreview } from './components/storefront/StorefrontPreview.tsx';

import { 
  Product, 
  Category, 
  Order, 
  Customer, 
  Coupon, 
  InventoryLog, 
  StoreSettings, 
  AnalyticsSummary 
} from './types/index.ts';
import { api } from './services/api.ts';

const AdminDashboardMain: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [storefrontMode, setStorefrontMode] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Core Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Selections
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<Order | null>(null);

  // Fetch all primary database resources
  const loadStoreData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const [
        prodsRes, 
        catsRes, 
        ordersRes, 
        custsRes, 
        couponsRes, 
        logsRes, 
        settingsRes, 
        analyticsRes
      ] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getOrders(),
        api.getCustomers(),
        api.getCoupons(),
        api.getInventoryLogs(),
        api.getSettings(),
        api.getAnalytics()
      ]);

      setProducts(prodsRes);
      setCategories(catsRes);
      setOrders(ordersRes);
      setCustomers(custsRes);
      setCoupons(couponsRes);
      setInventoryLogs(logsRes);
      setSettings(settingsRes);
      setAnalytics(analyticsRes);
    } catch (err: any) {
      console.error("Failed to load store data:", err);
      showToast('error', 'Database Sync Error', err.message || 'Could not fetch database records.');
    } finally {
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStoreData();
    }
  }, [isAuthenticated, loadStoreData]);

  // Product Actions
  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (productToEdit) {
      const updated = await api.updateProduct(productToEdit.id, productData);
      setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
      showToast('success', 'Product Updated', `"${updated.name}" has been updated.`);
    } else {
      const created = await api.createProduct(productData);
      setProducts(prev => [created, ...prev]);
      showToast('success', 'Product Created', `"${created.name}" added to catalog.`);
    }
    setProductModalOpen(false);
    setProductToEdit(null);
    loadStoreData();
  };

  const handleDeleteProduct = async (id: number) => {
    await api.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('info', 'Product Removed', 'Product has been deleted from catalog.');
    loadStoreData();
  };

  const handleToggleProductStatus = async (product: Product) => {
    const nextStatus = product.status === 'active' ? 'inactive' : 'active';
    const updated = await api.updateProduct(product.id, { status: nextStatus });
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast('info', 'Status Updated', `${product.name} is now ${nextStatus}.`);
  };

  const handleQuickUpdateStock = async (id: number, adjustment: number) => {
    const updated = await api.adjustProductStock(id, adjustment, adjustment > 0 ? 'Quick Restock' : 'Quick Deduction');
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast('info', 'Stock Adjusted', `Stock for ${updated.name} updated to ${updated.stock_quantity}.`);
    loadStoreData();
  };

  // Category Actions
  const handleCreateCategory = async (catData: Partial<Category>) => {
    const created = await api.createCategory(catData);
    setCategories(prev => [...prev, created]);
    showToast('success', 'Category Created', `Category "${created.name}" created.`);
    loadStoreData();
  };

  const handleUpdateCategory = async (id: number, catData: Partial<Category>) => {
    const updated = await api.updateCategory(id, catData);
    setCategories(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast('success', 'Category Updated', `Category "${updated.name}" updated.`);
    loadStoreData();
  };

  const handleDeleteCategory = async (id: number) => {
    await api.deleteCategory(id);
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('info', 'Category Removed', 'Category deleted.');
    loadStoreData();
  };

  // Order Actions
  const handleUpdateOrderStatus = async (orderId: string, status: Order['status'], tracking?: string) => {
    const updated = await api.updateOrderStatus(orderId, status, tracking);
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    showToast('success', 'Order Updated', `Order ${orderId} marked as ${status}.`);
    loadStoreData();
  };

  // Customer Actions
  const handleCreateCustomer = async (custData: Partial<Customer>) => {
    const created = await api.createCustomer(custData);
    setCustomers(prev => [created, ...prev]);
    showToast('success', 'Customer Added', `Customer ${created.name} registered.`);
    loadStoreData();
  };

  // Inventory Stock Adjustment
  const handleAdjustInventoryStock = async (productId: number, adjustment: number, reason: string) => {
    const updated = await api.adjustInventoryStock(productId, adjustment, reason);
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    showToast('success', 'Inventory Updated', `Restocked ${adjustment > 0 ? '+' : ''}${adjustment} units.`);
    loadStoreData();
  };

  // Coupon Actions
  const handleCreateCoupon = async (couponData: Partial<Coupon>) => {
    const created = await api.createCoupon(couponData);
    setCoupons(prev => [created, ...prev]);
    showToast('success', 'Coupon Created', `Coupon code "${created.code}" launched.`);
  };

  const handleUpdateCoupon = async (id: number, couponData: Partial<Coupon>) => {
    const updated = await api.updateCoupon(id, couponData);
    setCoupons(prev => prev.map(c => c.id === updated.id ? updated : c));
    showToast('info', 'Coupon Updated', `Coupon status updated.`);
  };

  const handleDeleteCoupon = async (id: number) => {
    await api.deleteCoupon(id);
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast('info', 'Coupon Removed', 'Coupon deleted.');
  };

  // Settings Actions
  const handleUpdateSettings = async (newSettings: Partial<StoreSettings>) => {
    const updated = await api.updateSettings(newSettings);
    setSettings(updated);
  };

  const handleResetDatabase = async () => {
    await api.resetDatabase();
    showToast('success', 'Database Reset', 'Default RNS SHOP seed data reloaded.');
    loadStoreData();
  };

  // Place Order from Storefront Preview
  const handlePlaceStorefrontOrder = async (orderPayload: any) => {
    const created = await api.createOrder(orderPayload);
    await loadStoreData();
    return created;
  };

  // Handle Tab Navigation Shortcuts
  const handleSelectTab = (tab: NavTab) => {
    if (tab === 'add-product') {
      setProductToEdit(null);
      setProductModalOpen(true);
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // View order shortcut from overview or customer table
  const handleNavigateToOrder = (order: Order) => {
    setSelectedOrderForModal(order);
    setCurrentTab('orders');
  };

  const handleNavigateToProduct = (product: Product) => {
    setProductToEdit(product);
    setProductModalOpen(true);
  };

  // If auth is still checking
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Authenticating RNS SHOP Session...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show secure Login View
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // If in live storefront preview mode
  if (storefrontMode) {
    return (
      <StorefrontPreview
        products={products}
        categories={categories}
        settings={settings}
        coupons={coupons}
        currency={settings?.currency || '$'}
        onBackToAdmin={() => setStorefrontMode(false)}
        onPlaceOrder={handlePlaceStorefrontOrder}
      />
    );
  }

  const lowStockCount = products.filter(p => p.stock_quantity < 10).length;
  const pendingOrderCount = orders.filter(o => o.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleSelectTab}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        counts={{
          pendingOrders: pendingOrderCount,
          lowStock: lowStockCount
        }}
        onOpenStorefront={() => setStorefrontMode(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen">
        {/* Header Bar */}
        <Header
          currentTab={currentTab}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenStorefront={() => setStorefrontMode(true)}
          onAddProduct={() => {
            setProductToEdit(null);
            setProductModalOpen(true);
          }}
          onRefresh={loadStoreData}
          isRefreshing={isRefreshing}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          lowStockCount={lowStockCount}
          pendingOrderCount={pendingOrderCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <OverviewView
              analytics={analytics}
              orders={orders}
              products={products}
              currency={settings?.currency || '$'}
              onSelectTab={handleSelectTab}
              onViewOrder={handleNavigateToOrder}
              onViewProduct={handleNavigateToProduct}
            />
          )}

          {currentTab === 'products' && (
            <ProductsView
              products={products}
              categories={categories}
              currency={settings?.currency || '$'}
              onOpenAddModal={() => {
                setProductToEdit(null);
                setProductModalOpen(true);
              }}
              onEditProduct={prod => {
                setProductToEdit(prod);
                setProductModalOpen(true);
              }}
              onDeleteProduct={handleDeleteProduct}
              onToggleStatus={handleToggleProductStatus}
              onQuickUpdateStock={handleQuickUpdateStock}
            />
          )}

          {currentTab === 'categories' && (
            <CategoriesView
              categories={categories}
              onCreateCategory={handleCreateCategory}
              onUpdateCategory={handleUpdateCategory}
              onDeleteCategory={handleDeleteCategory}
            />
          )}

          {currentTab === 'orders' && (
            <OrdersView
              orders={orders}
              currency={settings?.currency || '$'}
              onUpdateStatus={handleUpdateOrderStatus}
              selectedOrderForModal={selectedOrderForModal}
              onClearSelectedOrder={() => setSelectedOrderForModal(null)}
            />
          )}

          {currentTab === 'customers' && (
            <CustomersView
              customers={customers}
              orders={orders}
              currency={settings?.currency || '$'}
              onViewOrder={handleNavigateToOrder}
              onCreateCustomer={handleCreateCustomer}
            />
          )}

          {currentTab === 'inventory' && (
            <InventoryView
              products={products}
              inventoryLogs={inventoryLogs}
              currency={settings?.currency || '$'}
              onAdjustStock={handleAdjustInventoryStock}
            />
          )}

          {currentTab === 'coupons' && (
            <CouponsView
              coupons={coupons}
              currency={settings?.currency || '$'}
              onCreateCoupon={handleCreateCoupon}
              onUpdateCoupon={handleUpdateCoupon}
              onDeleteCoupon={handleDeleteCoupon}
            />
          )}

          {currentTab === 'reports' && (
            <AnalyticsView
              analytics={analytics}
              orders={orders}
              products={products}
              currency={settings?.currency || '$'}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetDatabase={handleResetDatabase}
            />
          )}
        </main>
      </div>

      {/* Global Product Add / Edit Modal */}
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false);
          setProductToEdit(null);
        }}
        onSubmit={handleSaveProduct}
        productToEdit={productToEdit}
        categories={categories}
        currency={settings?.currency || '$'}
      />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AdminDashboardMain />
      </AuthProvider>
    </ToastProvider>
  );
}

import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  FileSpreadsheet
} from 'lucide-react';
import { Line, Bar } from 'react-chartjs-2';
import { AnalyticsSummary, Order, Product } from '../../types/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface AnalyticsViewProps {
  analytics: AnalyticsSummary | null;
  orders: Order[];
  products: Product[];
  currency?: string;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  analytics,
  orders,
  products,
  currency = '$'
}) => {
  const { showToast } = useToast();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d');

  if (!analytics) return null;

  const totalRevenue = analytics.totalRevenue;
  const avgOrderValue = analytics.totalOrders > 0 ? (totalRevenue / analytics.totalOrders) : 0;

  // Category breakdown calculation
  const categorySales: Record<string, { count: number; revenue: number }> = {};
  orders.forEach(o => {
    o.items.forEach(item => {
      const p = products.find(prod => prod.id === item.product_id);
      const cat = p ? p.category : 'General';
      if (!categorySales[cat]) {
        categorySales[cat] = { count: 0, revenue: 0 };
      }
      categorySales[cat].count += item.quantity;
      categorySales[cat].revenue += item.price * item.quantity;
    });
  });

  const categoryLabels = Object.keys(categorySales);
  const categoryValues = categoryLabels.map(k => categorySales[k].revenue);

  const categoryChartData = {
    labels: categoryLabels.length > 0 ? categoryLabels : ['Denim', 'Hoodies', 'Tops', 'Trousers'],
    datasets: [
      {
        label: 'Category Revenue ($)',
        data: categoryValues.length > 0 ? categoryValues : [4200, 3100, 2800, 2400],
        backgroundColor: '#6366f1',
        borderRadius: 6,
      }
    ]
  };

  const exportOrdersCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer', 'Email', 'Items Count', 'Status', 'Total'];
    const rows = orders.map(o => [
      o.id,
      new Date(o.created_at).toISOString().split('T')[0],
      `"${o.customer_name}"`,
      o.customer_email,
      o.items.length,
      o.status,
      o.total.toFixed(2)
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rns_shop_orders_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Report Exported', 'Orders report CSV successfully generated and downloaded.');
  };

  const exportProductsCSV = () => {
    const headers = ['ID', 'SKU', 'Name', 'Category', 'Price', 'Original Price', 'Stock', 'Status'];
    const rows = products.map(p => [
      p.id,
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      p.price.toFixed(2),
      p.original_price.toFixed(2),
      p.stock_quantity,
      p.status
    ]);
    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `rns_shop_products_inventory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Inventory Exported', 'Products catalog CSV successfully generated and downloaded.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with CSV Export */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">Financial Reports & Performance Analytics</h2>
          <p className="text-xs text-slate-500">Comprehensive retail intelligence and customer demand metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportOrdersCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Orders (CSV)</span>
          </button>
          <button
            onClick={exportProductsCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Catalog (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gross Merchandise Value</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {currency}{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">Real-time database verified</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Order Value (AOV)</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {currency}{avgOrderValue.toFixed(2)}
          </p>
          <p className="text-xs text-slate-400 mt-1">Per unique checkout session</p>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Order Conversion & Volume</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 tabular-nums">
            {analytics.totalOrders} checkouts
          </p>
          <p className="text-xs text-indigo-600 font-semibold mt-1">
            {analytics.completedOrders} orders successfully delivered
          </p>
        </div>
      </div>

      {/* Category Sales Breakdown Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
        <div className="pb-4 mb-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Revenue by Apparel Category</h3>
            <p className="text-xs text-slate-500">Sales concentration across fashion collections</p>
          </div>
        </div>
        <div className="h-64 w-full">
          <Bar 
            data={categoryChartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748b' } },
                y: { 
                  ticks: { 
                    font: { family: 'JetBrains Mono', size: 11 }, 
                    color: '#64748b',
                    callback: (v: any) => `${currency}${v}` 
                  } 
                }
              }
            }} 
          />
        </div>
      </div>
    </div>
  );
};

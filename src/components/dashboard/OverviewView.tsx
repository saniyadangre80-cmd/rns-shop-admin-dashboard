import React from 'react';
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  ArrowUpRight,
  Eye,
  ChevronRight
} from 'lucide-react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement, 
  ArcElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler 
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { AnalyticsSummary, Order, Product } from '../../types/index.ts';
import { NavTab } from '../layout/Sidebar.tsx';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface OverviewViewProps {
  analytics: AnalyticsSummary | null;
  orders: Order[];
  products: Product[];
  currency?: string;
  onSelectTab: (tab: NavTab) => void;
  onViewOrder: (order: Order) => void;
  onViewProduct: (product: Product) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  orders,
  products,
  currency = '$',
  onSelectTab,
  onViewOrder,
  onViewProduct
}) => {
  if (!analytics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading RNS SHOP performance data...</p>
        </div>
      </div>
    );
  }

  // Chart 1: Daily Sales (Area line chart)
  const dailySalesData = {
    labels: analytics.dailySales.labels,
    datasets: [
      {
        label: 'Sales Revenue ($)',
        data: analytics.dailySales.values,
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.12)',
        tension: 0.35,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#0f172a',
        titleFont: { family: 'Plus Jakarta Sans', size: 12 },
        bodyFont: { family: 'JetBrains Mono', size: 12 },
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { family: 'Plus Jakarta Sans', size: 11 }, color: '#64748b' }
      },
      y: {
        grid: { color: 'rgba(226, 232, 240, 0.6)' },
        ticks: { 
          font: { family: 'JetBrains Mono', size: 11 }, 
          color: '#64748b',
          callback: (value: any) => `${currency}${value}`
        }
      }
    }
  };

  // Chart 2: Monthly Revenue (Bar chart)
  const monthlyRevenueData = {
    labels: analytics.monthlyRevenue.labels,
    datasets: [
      {
        label: 'Revenue ($)',
        data: analytics.monthlyRevenue.values,
        backgroundColor: '#8b5cf6',
        borderRadius: 6,
        hoverBackgroundColor: '#7c3aed',
      }
    ]
  };

  // Chart 3: Order Status (Doughnut chart)
  const orderStatusData = {
    labels: analytics.orderStatusDistribution.labels,
    datasets: [
      {
        data: analytics.orderStatusDistribution.counts,
        backgroundColor: [
          '#10b981', // Delivered
          '#3b82f6', // Shipped
          '#8b5cf6', // Processing
          '#f59e0b', // Confirmed
          '#64748b', // Pending
          '#ef4444', // Cancelled
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      }
    ]
  };

  const recentOrders = orders.slice(0, 5);
  const lowStockItems = products.filter(p => p.stock_quantity < 10);

  return (
    <div className="space-y-6">
      {/* Top 4 Primary Highlight KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {currency}{analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs font-semibold text-emerald-600">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4% from last month</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Orders</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {analytics.totalOrders}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
              <span>{analytics.pendingOrders} pending fulfillment</span>
            </div>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Catalog Products</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {analytics.totalProducts}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
              <span>Across {analytics.totalProducts > 0 ? 5 : 0} fashion categories</span>
            </div>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden group hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Customers</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
              {analytics.totalCustomers}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-500 font-medium">
              <span>Active buyers registered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary 4 Order Status & Inventory KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-amber-50/60 border border-amber-200/70 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-amber-900">Pending Orders</p>
            <p className="text-lg font-bold text-amber-950 tabular-nums">{analytics.pendingOrders}</p>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200/70 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-emerald-900">Delivered Orders</p>
            <p className="text-lg font-bold text-emerald-950 tabular-nums">{analytics.completedOrders}</p>
          </div>
        </div>

        <div className="bg-rose-50/60 border border-rose-200/70 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-rose-900">Cancelled Orders</p>
            <p className="text-lg font-bold text-rose-950 tabular-nums">{analytics.cancelledOrders}</p>
          </div>
        </div>

        <div 
          onClick={() => onSelectTab('inventory')}
          className="bg-orange-50/60 border border-orange-200/70 rounded-xl p-3.5 flex items-center gap-3 cursor-pointer hover:bg-orange-100/60 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-orange-900">Low Stock Alert</p>
            <p className="text-lg font-bold text-orange-950 tabular-nums">{analytics.lowStockProducts} items</p>
          </div>
        </div>
      </div>

      {/* Charts Section: Daily Sales (Area) & Monthly Revenue (Bar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Sales Trends */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Daily Sales Trends</h2>
              <p className="text-xs text-slate-500">Revenue trajectory over the past 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Current Week</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <Line data={dailySalesData} options={chartOptions} />
          </div>
        </div>

        {/* Order Status Breakdown (Doughnut) */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col">
          <div className="pb-4 mb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Order Statistics</h2>
            <p className="text-xs text-slate-500">Fulfillment lifecycle breakdown</p>
          </div>
          <div className="flex-1 min-h-[200px] flex items-center justify-center">
            <div className="h-48 w-48 relative">
              <Doughnut 
                data={orderStatusData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { legend: { display: false } },
                  cutout: '72%'
                }} 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-semibold text-slate-400">Total</span>
                <span className="text-xl font-extrabold text-slate-900 tabular-nums">{analytics.totalOrders}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Delivered ({analytics.completedOrders})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Pending ({analytics.pendingOrders})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span>Shipped</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Cancelled ({analytics.cancelledOrders})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Monthly Revenue & Best-Selling Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <div className="lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="pb-4 mb-2 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Monthly Revenue</h2>
            <p className="text-xs text-slate-500">6-month fiscal progression</p>
          </div>
          <div className="h-60 w-full">
            <Bar data={monthlyRevenueData} options={chartOptions} />
          </div>
        </div>

        {/* Best-Selling Products */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Best-Selling Products</h2>
                <p className="text-xs text-slate-500">Top revenue drivers in RNS SHOP clothing catalog</p>
              </div>
              <button
                onClick={() => onSelectTab('products')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View Catalog</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {analytics.bestSellers.map((item, index) => (
                <div 
                  key={item.id}
                  onClick={() => onViewProduct(item)}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-xs font-bold text-slate-400 tabular-nums">#{index + 1}</span>
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-11 h-11 rounded-lg object-cover ring-1 ring-slate-200 shrink-0" 
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500">{item.category} · SKU: {item.sku}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <p className="text-xs font-bold text-slate-900 tabular-nums">{currency}{item.price.toFixed(2)}</p>
                    <p className="text-[11px] font-semibold text-emerald-600 tabular-nums">{item.units_sold} sold</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Orders Table & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Recent Customer Orders</h2>
              <p className="text-xs text-slate-500">Live order flow ready for processing and shipment</p>
            </div>
            <button
              onClick={() => onSelectTab('orders')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
            >
              <span>All Orders</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Order ID</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                      {order.id}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-slate-800">{order.customer_name}</p>
                      <p className="text-[11px] text-slate-400">{order.customer_email}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 tabular-nums">
                      {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-900 tabular-nums">
                      {currency}{order.total.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'Processing' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'Confirmed' ? 'bg-amber-100 text-amber-800' :
                        order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' :
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onViewOrder(order)}
                        className="p-1 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                        title="View Order Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h2 className="text-base font-bold text-slate-900">Low Stock Watch</h2>
              </div>
              <button
                onClick={() => onSelectTab('inventory')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Manage
              </button>
            </div>

            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">All inventory levels are nominal.</p>
              ) : (
                lowStockItems.map(item => (
                  <div key={item.id} className="p-3 rounded-xl bg-orange-50/50 border border-orange-200/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-10 h-10 rounded-lg object-cover ring-1 ring-orange-200 shrink-0" 
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{item.name}</p>
                        <p className="text-[11px] text-slate-500">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.stock_quantity === 0 ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {item.stock_quantity === 0 ? 'Out of Stock' : `${item.stock_quantity} left`}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onSelectTab('inventory')}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors text-center cursor-pointer"
            >
              Open Inventory & Restock Hub
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

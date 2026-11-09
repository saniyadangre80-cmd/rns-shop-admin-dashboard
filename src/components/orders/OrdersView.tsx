import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Eye, 
  Truck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Printer, 
  MapPin, 
  Phone, 
  Mail, 
  Tag, 
  ArrowRight,
  X,
  CreditCard,
  Package
} from 'lucide-react';
import { Order } from '../../types/index.ts';

interface OrdersViewProps {
  orders: Order[];
  currency?: string;
  onUpdateStatus: (orderId: string, status: Order['status'], trackingNumber?: string) => Promise<void>;
  selectedOrderForModal?: Order | null;
  onClearSelectedOrder?: () => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  currency = '$',
  onUpdateStatus,
  selectedOrderForModal,
  onClearSelectedOrder
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [activeOrder, setActiveOrder] = useState<Order | null>(selectedOrderForModal || null);
  const [trackingInput, setTrackingInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Sync prop changes
  React.useEffect(() => {
    if (selectedOrderForModal) {
      setActiveOrder(selectedOrderForModal);
    }
  }, [selectedOrderForModal]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (statusFilter !== 'All' && o.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          o.id.toLowerCase().includes(q) ||
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          (o.tracking_number && o.tracking_number.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const handleStatusChange = async (newStatus: Order['status'], tracking?: string) => {
    if (!activeOrder) return;
    setUpdating(true);
    try {
      await onUpdateStatus(activeOrder.id, newStatus, tracking);
      // Update local copy
      setActiveOrder(prev => prev ? { ...prev, status: newStatus, tracking_number: tracking || prev.tracking_number } : null);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    const map: Record<Order['status'], { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
      Pending: { bg: 'bg-slate-100 text-slate-800', text: 'Pending', icon: Clock },
      Confirmed: { bg: 'bg-amber-100 text-amber-800', text: 'Confirmed', icon: CheckCircle },
      Processing: { bg: 'bg-purple-100 text-purple-800', text: 'Processing', icon: Package },
      Shipped: { bg: 'bg-blue-100 text-blue-800', text: 'Shipped', icon: Truck },
      Delivered: { bg: 'bg-emerald-100 text-emerald-800', text: 'Delivered', icon: CheckCircle },
      Cancelled: { bg: 'bg-rose-100 text-rose-800', text: 'Cancelled', icon: XCircle },
    };
    const s = map[status] || map.Pending;
    const Icon = s.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${s.bg}`}>
        <Icon className="w-3 h-3" />
        <span>{s.text}</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by Order ID (ORD-...), customer, or tracking..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status Tab buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
          {['All', 'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Items Ordered</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Fulfillment Status</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No orders found.</p>
                    <p className="text-[11px] text-slate-400 mt-1">Try switching status filters or search term.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Order ID & Date */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-bold text-slate-900 font-mono">{order.id}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {new Date(order.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                    </td>

                    {/* Customer */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{order.customer_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{order.customer_email}</p>
                    </td>

                    {/* Items */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <img
                            key={idx}
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                            title={`${item.name} (${item.quantity}x)`}
                          />
                        ))}
                        {order.items.length > 3 && (
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 rounded-md px-1.5 py-0.5">
                            +{order.items.length - 3}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <p className="font-extrabold text-slate-900 text-sm tabular-nums">
                        {currency}{order.total.toFixed(2)}
                      </p>
                      <span className="text-[10px] text-emerald-600 font-semibold">
                        {order.payment_method.split(' ')[0]} · {order.payment_status}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                      {order.tracking_number && (
                        <p className="text-[10px] font-mono text-slate-500 mt-1 truncate max-w-[130px]">
                          {order.tracking_number}
                        </p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          setActiveOrder(order);
                          setTrackingInput(order.tracking_number || '');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Manage</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Drawer / Modal */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 font-mono">{activeOrder.id}</h3>
                    {getStatusBadge(activeOrder.status)}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Placed on {new Date(activeOrder.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInvoice(!showInvoice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  title="Toggle Printable Invoice"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Invoice</span>
                </button>
                <button
                  onClick={() => {
                    setActiveOrder(null);
                    if (onClearSelectedOrder) onClearSelectedOrder();
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {/* Quick Status Workflow Actions */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  Update Fulfillment Status:
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {activeOrder.status === 'Pending' && (
                    <button
                      onClick={() => handleStatusChange('Confirmed')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors cursor-pointer"
                    >
                      Accept & Confirm Order
                    </button>
                  )}

                  {(activeOrder.status === 'Confirmed' || activeOrder.status === 'Pending') && (
                    <button
                      onClick={() => handleStatusChange('Processing')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer"
                    >
                      Send to Packing & Processing
                    </button>
                  )}

                  {activeOrder.status !== 'Shipped' && activeOrder.status !== 'Delivered' && activeOrder.status !== 'Cancelled' && (
                    <div className="flex items-center gap-2 w-full mt-2 pt-2 border-t border-slate-200">
                      <input
                        type="text"
                        value={trackingInput}
                        onChange={e => setTrackingInput(e.target.value)}
                        placeholder="Tracking Number (e.g. FEDEX-12345)"
                        className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleStatusChange('Shipped', trackingInput || `TRK-${Math.floor(10000000 + Math.random() * 90000000)}`)}
                        disabled={updating}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors shrink-0 cursor-pointer"
                      >
                        Mark as Shipped
                      </button>
                    </div>
                  )}

                  {activeOrder.status === 'Shipped' && (
                    <button
                      onClick={() => handleStatusChange('Delivered')}
                      disabled={updating}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                    >
                      Mark as Delivered
                    </button>
                  )}

                  {activeOrder.status !== 'Cancelled' && activeOrder.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusChange('Cancelled')}
                      disabled={updating}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors ml-auto cursor-pointer"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Shipping Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shipping Destination</span>
                  </p>
                  <p className="font-semibold text-slate-800">{activeOrder.customer_name}</p>
                  <p className="text-slate-600">{activeOrder.shipping_address.street}</p>
                  <p className="text-slate-600">
                    {activeOrder.shipping_address.city}, {activeOrder.shipping_address.state} {activeOrder.shipping_address.zip}
                  </p>
                  <p className="text-slate-500">{activeOrder.shipping_address.country}</p>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <p className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>Payment & Contact</span>
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Method:</span> {activeOrder.payment_method}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Email:</span> {activeOrder.customer_email}
                  </p>
                  <p className="text-slate-700">
                    <span className="font-semibold">Phone:</span> {activeOrder.customer_phone || 'N/A'}
                  </p>
                  {activeOrder.notes && (
                    <p className="text-amber-800 bg-amber-50 p-2 rounded-lg text-[11px] mt-1 border border-amber-200">
                      Note: {activeOrder.notes}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Ordered Table */}
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Order Items ({activeOrder.items.length})
                </p>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Item</th>
                        <th className="py-2.5 px-3">Size</th>
                        <th className="py-2.5 px-3">Unit Price</th>
                        <th className="py-2.5 px-3">Qty</th>
                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {activeOrder.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5">
                              <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200" />
                              <span className="font-medium text-slate-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-600">{item.size}</td>
                          <td className="py-2.5 px-3 tabular-nums">{currency}{item.price.toFixed(2)}</td>
                          <td className="py-2.5 px-3 font-bold text-slate-800 tabular-nums">{item.quantity}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 tabular-nums">
                            {currency}{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Calculation Breakdown */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{currency}{activeOrder.subtotal.toFixed(2)}</span>
                </div>
                {activeOrder.discount > 0 && (
                  <div className="flex justify-between text-indigo-700 font-semibold">
                    <span>Discount {activeOrder.coupon_code ? `(${activeOrder.coupon_code})` : ''}</span>
                    <span className="font-mono tabular-nums">-{currency}{activeOrder.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Standard Shipping</span>
                  <span className="font-mono tabular-nums">
                    {activeOrder.shipping_fee === 0 ? 'FREE' : `${currency}${activeOrder.shipping_fee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Tax</span>
                  <span className="font-mono tabular-nums">{currency}{activeOrder.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Amount</span>
                  <span className="font-mono tabular-nums text-base">{currency}{activeOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Printable Invoice Container (collapsible view) */}
              {showInvoice && (
                <div className="p-6 bg-white border border-slate-300 rounded-xl space-y-4 print:m-0 print:border-none shadow-sm">
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h4 className="text-xl font-extrabold text-slate-900">RNS SHOP</h4>
                      <p className="text-xs text-slate-500">Contemporary Fashion & Streetwear</p>
                      <p className="text-xs text-slate-500">108 Fashion Ave, NY 10018</p>
                    </div>
                    <div className="text-right">
                      <p className="text-base font-bold text-slate-900 font-mono">INVOICE #{activeOrder.id}</p>
                      <p className="text-xs text-slate-500">Date: {new Date(activeOrder.created_at).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500">Payment: {activeOrder.payment_status}</p>
                    </div>
                  </div>
                  <div className="text-center pt-2">
                    <button
                      onClick={() => window.print()}
                      className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                    >
                      Print Packing Slip
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  User, 
  ShoppingBag, 
  DollarSign, 
  MapPin, 
  Phone, 
  Mail, 
  ExternalLink, 
  X,
  Plus
} from 'lucide-react';
import { Customer, Order } from '../../types/index.ts';

interface CustomersViewProps {
  customers: Customer[];
  orders: Order[];
  currency?: string;
  onViewOrder: (order: Order) => void;
  onCreateCustomer: (cust: Partial<Customer>) => Promise<void>;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  orders,
  currency = '$',
  onViewOrder,
  onCreateCustomer
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [loading, setLoading] = useState(false);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return customers;
    const q = search.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  }, [customers, search]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(o => 
      o.customer_id === selectedCustomer.id || 
      o.customer_email.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [selectedCustomer, orders]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    setLoading(true);
    try {
      await onCreateCustomer({
        name,
        email,
        phone,
        address,
        city,
        state,
        zip
      });
      setIsAddModalOpen(false);
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setState('');
      setZip('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Search & Actions */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or city..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Total Spending</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="font-semibold text-slate-700">No customers match your search.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Customer */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-2 ring-white shadow-xs">
                          {customer.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{customer.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Member since {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3 px-4">
                      <p className="text-slate-800 font-medium">{customer.email}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{customer.phone || 'No phone recorded'}</p>
                    </td>

                    {/* Address */}
                    <td className="py-3 px-4 text-slate-600">
                      <p className="truncate max-w-[200px]">{customer.address}</p>
                      <p className="text-[11px] text-slate-400">{customer.city}, {customer.state} {customer.zip}</p>
                    </td>

                    {/* Orders */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs">
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{customer.total_orders} orders</span>
                      </span>
                    </td>

                    {/* Total Spending */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-extrabold text-slate-900 text-sm tabular-nums">
                        {currency}{customer.total_spending.toFixed(2)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedCustomer(customer)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors cursor-pointer"
                      >
                        <span>Order History</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-500">{selectedCustomer.email} · {selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-500">Total Orders Placed:</span>
                  <p className="text-base font-bold text-slate-900 tabular-nums">{selectedCustomer.total_orders}</p>
                </div>
                <div>
                  <span className="text-slate-500">Lifetime Spending:</span>
                  <p className="text-base font-bold text-slate-900 tabular-nums">{currency}{selectedCustomer.total_spending.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Order Timeline</h4>
                {customerOrders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">No orders recorded for this customer yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                    {customerOrders.map(order => (
                      <div key={order.id} className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 font-mono text-xs">{order.id}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700">
                              {order.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(order.created_at).toLocaleDateString()} · {order.items.length} items
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-bold text-slate-900 tabular-nums">
                            {currency}{order.total.toFixed(2)}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCustomer(null);
                              onViewOrder(order);
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                          >
                            View Order
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Customer</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="maya.lin@example.com"
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  placeholder="123 Fashion Street, Apt 5"
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="New York"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={state}
                    onChange={e => setState(e.target.value)}
                    placeholder="NY"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={zip}
                    onChange={e => setZip(e.target.value)}
                    placeholder="10001"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-white font-semibold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {loading ? 'Saving...' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

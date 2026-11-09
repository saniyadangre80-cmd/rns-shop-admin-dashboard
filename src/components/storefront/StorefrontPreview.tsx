import React, { useState } from 'react';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Search, 
  Tag, 
  Check, 
  X, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Product, Category, StoreSettings, Coupon } from '../../types/index.ts';
import { useToast } from '../../context/ToastContext.tsx';

interface StorefrontPreviewProps {
  products: Product[];
  categories: Category[];
  settings: StoreSettings | null;
  coupons: Coupon[];
  currency?: string;
  onBackToAdmin: () => void;
  onPlaceOrder: (orderData: any) => Promise<any>;
}

export const StorefrontPreview: React.FC<StorefrontPreviewProps> = ({
  products,
  categories,
  settings,
  coupons,
  currency = '$',
  onBackToAdmin,
  onPlaceOrder
}) => {
  const { showToast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<Array<{ product: Product; quantity: number; size: string }>>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('RNS20');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Checkout modal
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [custName, setCustName] = useState('Sara Jenkins');
  const [custEmail, setCustEmail] = useState('sara.j@example.com');
  const [custPhone, setCustPhone] = useState('+1 (212) 555-8392');
  const [custAddress, setCustAddress] = useState('420 Broadway, Loft 5');
  const [custCity, setCustCity] = useState('New York');
  const [custState, setCustState] = useState('NY');
  const [custZip, setCustZip] = useState('10013');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Visa •••• 4242)');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);

  const activeProducts = products.filter(p => p.status === 'active');
  const filteredProducts = activeProducts.filter(p => {
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    return true;
  });

  const addToCart = (product: Product) => {
    if (product.stock_quantity <= 0) {
      showToast('error', 'Out of Stock', 'This item is currently sold out.');
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock_quantity) {
          showToast('error', 'Stock Limit', `Only ${product.stock_quantity} available in stock.`);
          return prev;
        }
        return prev.map(item =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1, size: product.sizes?.[0] || 'M' }];
    });
    showToast('success', 'Added to Cart', `${product.name} added to your shopping bag.`);
  };

  const updateCartQty = (productId: number, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty > item.product.stock_quantity) {
              showToast('error', 'Stock Limit', `Cannot exceed available inventory (${item.product.stock_quantity}).`);
              return item;
            }
            return { ...item, quantity: nextQty };
          }
          return item;
        })
        .filter(item => item.quantity > 0)
    );
  };

  // Pricing calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedCoupon ? (subtotal * appliedCoupon.discount_percentage) / 100 : 0;
  const shippingFee = subtotal >= (settings?.free_shipping_threshold || 120) ? 0 : (settings?.shipping_fee || 9.99);
  const tax = Number(((subtotal - discountAmount) * ((settings?.tax_rate || 8.5) / 100)).toFixed(2));
  const finalTotal = Math.max(0, subtotal - discountAmount + (subtotal > 0 ? shippingFee : 0) + (subtotal > 0 ? tax : 0));

  const applyCouponHandler = () => {
    const found = coupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase() && c.status === 'active');
    if (!found) {
      showToast('error', 'Invalid Coupon', 'Coupon code not found or inactive.');
      return;
    }
    if (subtotal < found.min_order_amount) {
      showToast('error', 'Order Minimum', `Minimum order of ${currency}${found.min_order_amount} required.`);
      return;
    }
    setAppliedCoupon(found);
    showToast('success', 'Coupon Applied', `${found.discount_percentage}% discount successfully applied!`);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setOrderSubmitting(true);
    try {
      const orderPayload = {
        customer_name: custName,
        customer_email: custEmail,
        customer_phone: custPhone,
        shipping_address: {
          street: custAddress,
          city: custCity,
          state: custState,
          zip: custZip,
          country: 'United States'
        },
        items: cart.map(i => ({
          product_id: i.product.id,
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          image: i.product.image,
          size: i.size
        })),
        subtotal: Number(subtotal.toFixed(2)),
        discount: Number(discountAmount.toFixed(2)),
        coupon_code: appliedCoupon ? appliedCoupon.code : null,
        shipping_fee: Number(shippingFee.toFixed(2)),
        tax: Number(tax.toFixed(2)),
        total: Number(finalTotal.toFixed(2)),
        payment_method: paymentMethod,
        payment_status: 'Paid',
        status: 'Pending',
        notes: 'Placed via RNS SHOP Storefront checkout.'
      };

      const created = await onPlaceOrder(orderPayload);
      setOrderSuccessId(created.id);
      setCart([]);
      setAppliedCoupon(null);
      setCheckoutOpen(false);
      showToast('success', 'Order Confirmed', `Order ${created.id} was placed and inventory has been deducted!`);
    } catch (err: any) {
      showToast('error', 'Checkout Failed', err.message || 'Could not place order');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner indicating preview mode */}
      <div className="bg-slate-950 text-white px-4 py-2.5 text-xs flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-slate-300">
            RNS SHOP Customer Storefront (Live Database Integration)
          </span>
        </div>
        <button
          onClick={onBackToAdmin}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold text-white transition-colors cursor-pointer text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Admin Console</span>
        </button>
      </div>

      {/* Store Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl font-extrabold tracking-tight text-slate-900">
              {settings?.store_name || 'RNS SHOP'}
            </span>
            <span className="hidden sm:inline-block text-xs text-slate-400 font-medium">
              Contemporary Clothing
            </span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-sm hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search denim, hoodies, silk tops..."
              className="w-full bg-slate-100 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 focus:outline-none focus:bg-white focus:ring-1 focus:ring-indigo-600"
            />
          </div>

          {/* Cart Trigger */}
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer relative"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            <span className="bg-indigo-600 text-white text-[11px] font-bold px-1.5 py-0.2 rounded-full tabular-nums">
              {cart.reduce((s, i) => s + i.quantity, 0)}
            </span>
          </button>
        </div>
      </header>

      {/* Hero Announcement */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-200 mb-3 backdrop-blur-sm">
            {settings?.tagline || 'New Season Collection 2026'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Elevated Contemporary Wardrobe
          </h2>
          <p className="text-sm text-slate-300 mt-2">
            Selvedge denim jackets, heavyweight terry hoodies, and European flax linen tailoring.
          </p>
        </div>
      </div>

      {/* Main Store View */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Order success notification if placed */}
        {orderSuccessId && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-bold">Order #{orderSuccessId} Placed Successfully!</p>
                <p className="text-xs text-emerald-700">Inventory was deducted in real-time. Return to Admin to fulfill the order.</p>
              </div>
            </div>
            <button
              onClick={onBackToAdmin}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 cursor-pointer"
            >
              View in Admin
            </button>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategory === 'All' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            All Clothing ({activeProducts.length})
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.name)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedCategory === c.name ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product Catalog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isSoldOut = product.stock_quantity <= 0;
            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount > 0 && (
                      <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px]">
                        {product.discount}% OFF
                      </span>
                    )}
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
                        <span className="px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs uppercase">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-base font-extrabold text-slate-900 tabular-nums">
                        {currency}{product.price.toFixed(2)}
                      </span>
                      {product.original_price > product.price && (
                        <span className="text-xs line-through text-slate-400 tabular-nums">
                          {currency}{product.original_price.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => addToCart(product)}
                    disabled={isSoldOut}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-slate-900 hover:bg-indigo-600 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>{isSoldOut ? 'Sold Out' : 'Add to Bag'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Cart Drawer Modal */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-800" />
                <h3 className="font-bold text-slate-900 text-base">Your Shopping Bag</h3>
                <span className="text-xs text-slate-500">({cart.length} items)</span>
              </div>
              <button onClick={() => setCartOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-semibold">Your bag is empty.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="p-3 rounded-xl border border-slate-200 flex items-center gap-3">
                    <img src={item.product.image} alt={item.product.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{item.product.name}</p>
                      <p className="text-[11px] text-slate-400">Size: {item.size}</p>
                      <p className="text-xs font-extrabold text-slate-900 mt-1 tabular-nums">
                        {currency}{item.product.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold font-mono px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="p-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}

              {/* Coupon Box */}
              {cart.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Promotional Coupon</span>
                    </span>
                    <span className="text-[10px] text-indigo-600">Try "RNS20"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="ENTER CODE"
                      className="flex-1 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs uppercase font-mono font-bold"
                    />
                    <button
                      onClick={applyCouponHandler}
                      className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                  {appliedCoupon && (
                    <div className="flex items-center justify-between text-[11px] text-emerald-700 font-bold pt-1">
                      <span>✓ {appliedCoupon.code} applied ({appliedCoupon.discount_percentage}% OFF)</span>
                      <button onClick={() => setAppliedCoupon(null)} className="text-rose-500 hover:underline">Remove</button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer Summary */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-mono">{currency}{subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-indigo-700 font-semibold">
                    <span>Discount</span>
                    <span className="tabular-nums font-mono">-{currency}{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{shippingFee === 0 ? 'FREE' : `${currency}${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span className="tabular-nums font-mono text-base">{currency}{finalTotal.toFixed(2)}</span>
                </div>

                <button
                  onClick={() => {
                    setCartOpen(false);
                    setCheckoutOpen(true);
                  }}
                  className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md transition-all cursor-pointer mt-2"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Secure Store Checkout</h3>
              <button onClick={() => setCheckoutOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={e => setCustEmail(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={custAddress}
                    onChange={e => setCustAddress(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={e => setCustCity(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={custState}
                    onChange={e => setCustState(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ZIP</label>
                  <input
                    type="text"
                    value={custZip}
                    onChange={e => setCustZip(e.target.value)}
                    required
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                <span>Total Due:</span>
                <span className="font-extrabold text-base text-slate-900 tabular-nums">
                  {currency}{finalTotal.toFixed(2)}
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="px-5 py-2.5 rounded-xl text-white font-bold bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  {orderSubmitting ? 'Confirming Order...' : `Pay & Place Order (${currency}${finalTotal.toFixed(2)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

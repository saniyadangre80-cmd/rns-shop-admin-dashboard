import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Database, 
  Save, 
  RotateCcw, 
  Check, 
  Copy, 
  FileCode, 
  Download,
  AlertTriangle,
  Lock,
  ExternalLink
} from 'lucide-react';
import { StoreSettings } from '../../types/index.ts';
import { useToast } from '../../context/ToastContext.tsx';
import { api } from '../../services/api.ts';

interface SettingsViewProps {
  settings: StoreSettings | null;
  onUpdateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  onResetDatabase: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetDatabase
}) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'general' | 'rates' | 'mysql' | 'security'>('general');

  // Form states
  const [storeName, setStoreName] = useState(settings?.store_name || 'RNS SHOP');
  const [tagline, setTagline] = useState(settings?.tagline || '');
  const [email, setEmail] = useState(settings?.email || '');
  const [phone, setPhone] = useState(settings?.phone || '');
  const [address, setAddress] = useState(settings?.address || '');
  const [currency, setCurrency] = useState(settings?.currency || '$');
  const [taxRate, setTaxRate] = useState<number | string>(settings?.tax_rate || 8.5);
  const [shippingFee, setShippingFee] = useState<number | string>(settings?.shipping_fee || 9.99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | string>(settings?.free_shipping_threshold || 120);
  
  // Social
  const [instagram, setInstagram] = useState(settings?.social_links?.instagram || '');
  const [facebook, setFacebook] = useState(settings?.social_links?.facebook || '');
  const [twitter, setTwitter] = useState(settings?.social_links?.twitter || '');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [saving, setSaving] = useState(false);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setTagline(settings.tagline);
      setEmail(settings.email);
      setPhone(settings.phone);
      setAddress(settings.address);
      setCurrency(settings.currency);
      setTaxRate(settings.tax_rate);
      setShippingFee(settings.shipping_fee);
      setFreeShippingThreshold(settings.free_shipping_threshold);
      setInstagram(settings.social_links?.instagram || '');
      setFacebook(settings.social_links?.facebook || '');
      setTwitter(settings.social_links?.twitter || '');
    }
  }, [settings]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdateSettings({
        store_name: storeName,
        tagline,
        email,
        phone,
        address,
        currency,
        tax_rate: Number(taxRate),
        shipping_fee: Number(shippingFee),
        free_shipping_threshold: Number(freeShippingThreshold),
        social_links: {
          instagram,
          facebook,
          twitter,
          pinterest: settings?.social_links?.pinterest || ''
        }
      });
      showToast('success', 'Settings Saved', 'RNS SHOP store configuration successfully updated.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast('error', 'Error', 'Please fill in both current and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Mismatch', 'New password and confirmation do not match.');
      return;
    }

    setPasswordLoading(true);
    try {
      await api.changePassword({ currentPassword, newPassword });
      showToast('success', 'Password Changed', 'Admin password has been securely updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      showToast('error', 'Failed', err.message || 'Could not change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const sampleMySQLSchema = `-- RNS SHOP MySQL 8.0 Schema DDL
CREATE TABLE \`products\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(200) NOT NULL,
  \`slug\` VARCHAR(220) NOT NULL UNIQUE,
  \`description\` TEXT DEFAULT NULL,
  \`category_id\` INT UNSIGNED NOT NULL,
  \`category\` VARCHAR(100) NOT NULL,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`original_price\` DECIMAL(10,2) NOT NULL,
  \`discount\` INT UNSIGNED DEFAULT 0,
  \`image\` VARCHAR(255) NOT NULL,
  \`stock_quantity\` INT NOT NULL DEFAULT 0,
  \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  \`sku\` VARCHAR(50) NOT NULL UNIQUE,
  \`sizes\` VARCHAR(100) DEFAULT 'S,M,L,XL',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_product_category\` (\`category_id\`),
  INDEX \`idx_product_status\` (\`status\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;

  const copySQL = () => {
    navigator.clipboard.writeText(sampleMySQLSchema);
    setCopiedSQL(true);
    showToast('info', 'SQL Copied', 'MySQL table DDL copied to clipboard.');
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'general' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Store Profile & Contact
        </button>
        <button
          onClick={() => setActiveTab('rates')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'rates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pricing & Tax Rates
        </button>
        <button
          onClick={() => setActiveTab('mysql')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'mysql' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          MySQL Database & Queries
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Admin Security
        </button>
      </div>

      {/* Tab 1: General Store Settings */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">RNS SHOP Store Information</h3>
            <p className="text-xs text-slate-500">Public store name, customer support contact, and headquarters location</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Name *</label>
              <input
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="Contemporary Everyday Fashion & Streetwear"
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Email *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Support Phone *</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">Headquarters & Store Address *</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              required
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Official Social Media Accounts</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={facebook}
                  onChange={e => setFacebook(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">Twitter / X URL</label>
                <input
                  type="text"
                  value={twitter}
                  onChange={e => setTwitter(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 2: Pricing & Rates */}
      {activeTab === 'rates' && (
        <form onSubmit={handleSaveSettings} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Currency & Shipping Calculations</h3>
            <p className="text-xs text-slate-500">Configure global sales tax and automated shipping thresholds</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Store Currency Symbol *</label>
              <input
                type="text"
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Sales Tax Rate (%) *</label>
              <input
                type="number"
                step="0.01"
                value={taxRate}
                onChange={e => setTaxRate(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Standard Shipping Fee ({currency}) *</label>
              <input
                type="number"
                step="0.01"
                value={shippingFee}
                onChange={e => setShippingFee(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Free Shipping Threshold ({currency}) *</label>
              <input
                type="number"
                step="1"
                value={freeShippingThreshold}
                onChange={e => setFreeShippingThreshold(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Rates'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 3: MySQL Database & Queries */}
      {activeTab === 'mysql' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">MySQL Database Architecture & Queries</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Target Database: <span className="font-mono text-slate-800 font-semibold">rns_shop_db</span> (MySQL 8.0+)
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={copySQL}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {copiedSQL ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy DDL SQL</span>
              </button>
            </div>
          </div>

          {/* Database Tables Schema Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono font-bold text-indigo-700">products</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Catalog items, SKU, category_id, prices, selvedge denim & outerwear items.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono font-bold text-indigo-700">orders & order_items</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Fulfillment statuses, customer foreign key, tracking numbers, line item prices.
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="font-mono font-bold text-indigo-700">coupons & inventory_logs</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Promotional discounts, restock history, stock movement audit trail.
              </p>
            </div>
          </div>

          {/* MySQL Queries Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Production MySQL Script: /database/schema.sql
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Character Set: utf8mb4</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-[11px] overflow-x-auto max-h-56 custom-scrollbar leading-relaxed">
              <pre>{`-- RNS SHOP Core Table Queries
CREATE DATABASE IF NOT EXISTS \`rns_shop_db\` CHARACTER SET utf8mb4;
USE \`rns_shop_db\`;

-- 1. Admins Table
CREATE TABLE \`admins\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(150) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` VARCHAR(50) NOT NULL DEFAULT 'Admin'
);

-- 2. Products Table
CREATE TABLE \`products\` (
  \`id\` INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  \`name\` VARCHAR(200) NOT NULL,
  \`sku\` VARCHAR(50) NOT NULL UNIQUE,
  \`price\` DECIMAL(10,2) NOT NULL,
  \`original_price\` DECIMAL(10,2) NOT NULL,
  \`stock_quantity\` INT NOT NULL DEFAULT 0,
  \`status\` ENUM('active', 'inactive') NOT NULL DEFAULT 'active'
);

-- 3. Orders Table
CREATE TABLE \`orders\` (
  \`id\` VARCHAR(30) PRIMARY KEY,
  \`customer_name\` VARCHAR(120) NOT NULL,
  \`total\` DECIMAL(10,2) NOT NULL,
  \`status\` ENUM('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled') NOT NULL
);`}</pre>
            </div>
          </div>

          {/* VS Code Setup Instructions */}
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-950 space-y-2">
            <h4 className="font-bold text-indigo-900 flex items-center gap-1.5">
              <FileCode className="w-4 h-4 text-indigo-700" />
              <span>VS Code & MySQL Execution Instructions:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-indigo-900/90 leading-relaxed">
              <li>Open this project in <strong>VS Code</strong>.</li>
              <li>To import the complete database schema into your MySQL server, run: <code className="bg-indigo-100/80 px-1 py-0.5 rounded font-mono font-bold">mysql -u root -p &lt; database/schema.sql</code>.</li>
              <li>Start the full-stack server with: <code className="bg-indigo-100/80 px-1 py-0.5 rounded font-mono font-bold">npm run dev</code>.</li>
              <li>Navigate to <code className="bg-indigo-100/80 px-1 py-0.5 rounded font-mono font-bold">http://localhost:3000</code> to access the live dashboard!</li>
            </ol>
          </div>

          {/* Reset Database Section */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-800">Reset Demo Database</p>
              <p className="text-[11px] text-slate-400">Restore default RNS SHOP apparel items, seed orders, and categories</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Database</span>
            </button>
          </div>

          {showResetConfirm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
              <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-slate-200 shadow-2xl animate-in fade-in zoom-in-95">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-slate-900">Reset Entire Database?</h4>
                <p className="text-xs text-slate-500 mt-1">
                  This will reload initial high-fidelity seed products, orders, and reset all counts.
                </p>
                <div className="mt-5 flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      await onResetDatabase();
                      setShowResetConfirm(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20"
                  >
                    Confirm Reset
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Security */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Admin Password & Security</h3>
            <p className="text-xs text-slate-500">Update Super Admin credentials and hashed authorization token</p>
          </div>

          <div className="space-y-3.5 max-w-md text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Current Password *</label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="Current password (default: admin123)"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">New Password *</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new strong password"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Confirm New Password *</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{passwordLoading ? 'Updating Password...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

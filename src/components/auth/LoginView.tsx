import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../../context/ToastContext.tsx';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  KeyRound, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../../services/api.ts';

export const LoginView: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useToast();

  const [authorizedEmail, setAuthorizedEmail] = useState('saniyadangre80@gmail.com');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [loginSuccessMessage, setLoginSuccessMessage] = useState<string | null>(null);

  // View state: 'login' | 'forgot' | 'reset'
  const [viewMode, setViewMode] = useState<'login' | 'forgot' | 'reset'>('login');

  // Forgot password & Reset states
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Fetch authorized admin email from backend config
  useEffect(() => {
    api.getAuthConfig()
      .then(res => {
        if (res.authorizedAdminEmail) {
          setAuthorizedEmail(res.authorizedAdminEmail);
          setEmail(res.authorizedAdminEmail);
          setResetEmail(res.authorizedAdminEmail);
        }
      })
      .catch(() => {
        setEmail('saniyadangre80@gmail.com');
        setResetEmail('saniyadangre80@gmail.com');
      });
  }, []);

  // Handle standard Admin Login
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setLoginSuccessMessage(null);

    // Read form values with fallback to state (handling browser autofill / password managers)
    const formData = new FormData(e.currentTarget);
    const formEmail = ((formData.get('email') as string) || email || '').trim();
    const formPassword = (formData.get('password') as string) || password || '';

    // Validate password presence first
    if (!formPassword || !formPassword.trim()) {
      setFormError('Password required.');
      showToast('error', 'Authentication Failed', 'Password required.');
      return;
    }

    // Validate email presence
    if (!formEmail) {
      setFormError('Invalid email or password.');
      showToast('error', 'Authentication Failed', 'Invalid email or password.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: formEmail, password: formPassword });
      setFormError(null);
      setLoginSuccessMessage('Login successful.');
      showToast('success', 'Authentication Successful', 'Login successful.');
    } catch (err: any) {
      const errText = (err.message || '').toLowerCase();
      const message = errText.includes('password required') 
        ? 'Password required.' 
        : 'Invalid email or password.';
      setFormError(message);
      showToast('error', 'Authentication Failed', message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Requesting Password Reset Token
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) {
      showToast('error', 'Email Required', 'Please provide your registered admin email.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.forgotPassword(resetEmail.trim());
      showToast('success', 'Reset Token Sent', res.message);
      if (res.token) {
        setResetToken(res.token);
      }
      setViewMode('reset');
    } catch (err: any) {
      showToast('error', 'Reset Request Failed', err.message || 'Could not dispatch reset email.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Submitting New Password with Token
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetToken || !newPassword) {
      showToast('error', 'Missing Fields', 'Please enter your verification token and new password.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('error', 'Password Mismatch', 'New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 6) {
      showToast('error', 'Password Too Weak', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.resetPassword({
        token: resetToken.trim(),
        newPassword
      });
      showToast('success', 'Password Updated', res.message);
      setResetSuccessMessage('Your password has been reset with bcrypt encryption. You can now log in.');
      setPassword(newPassword);
      setViewMode('login');
    } catch (err: any) {
      showToast('error', 'Reset Failed', err.message || 'Invalid or expired reset token.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-xl shadow-indigo-600/30 mb-4 ring-1 ring-white/20">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            RNS <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">SHOP</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">Administrator Security Console</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          {/* Mode 1: Standard Admin Login */}
          {viewMode === 'login' && (
            <div>
              <div className="pb-5 mb-6 border-b border-slate-800">
                <h2 className="text-lg font-semibold text-white">Admin Authentication</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access restricted to registered administrator: <span className="text-indigo-400 font-mono font-semibold">{authorizedEmail}</span>
                </p>
              </div>

              {/* Status and Error Banners */}
              {formError && (
                <div 
                  id="admin-login-error"
                  role="alert"
                  className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2.5 animate-fadeIn shadow-lg shadow-rose-950/40"
                >
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span className="font-semibold tracking-wide">{formError}</span>
                </div>
              )}

              {loginSuccessMessage && (
                <div 
                  id="admin-login-success"
                  role="status"
                  className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2.5 animate-fadeIn shadow-lg shadow-emerald-950/40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold tracking-wide">{loginSuccessMessage}</span>
                </div>
              )}

              {resetSuccessMessage && !formError && (
                <div className="mb-5 p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{resetSuccessMessage}</span>
                </div>
              )}

              <form 
                id="admin-login-form"
                onSubmit={handleLoginSubmit} 
                noValidate 
                className="space-y-4"
              >
                <div>
                  <label 
                    htmlFor="admin-email"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Authorized Admin Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-email"
                      name="email"
                      type="email"
                      autoComplete="username"
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      onInput={e => {
                        setEmail((e.target as HTMLInputElement).value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="saniyadangre80@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label 
                      htmlFor="admin-password"
                      className="block text-xs font-semibold text-slate-300 uppercase tracking-wider"
                    >
                      Admin Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setFormError(null);
                        setViewMode('forgot');
                      }}
                      className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="admin-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={e => {
                        setPassword(e.target.value);
                        if (formError) setFormError(null);
                      }}
                      onInput={e => {
                        setPassword((e.target as HTMLInputElement).value);
                        if (formError) setFormError(null);
                      }}
                      placeholder="Enter secure password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 cursor-pointer"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  id="admin-login-submit"
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Secure Admin Login</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Mode 2: Forgot Password Request */}
          {viewMode === 'forgot' && (
            <div>
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-800">
                <button
                  onClick={() => setViewMode('login')}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-white">Reset Admin Password</h2>
                  <p className="text-xs text-slate-400">Dispatch a verification token to your registered email</p>
                </div>
              </div>

              <form onSubmit={handleForgotSubmit} noValidate className="space-y-4">
                <div>
                  <label 
                    htmlFor="reset-email"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Registered Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-email"
                      name="resetEmail"
                      type="email"
                      autoComplete="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="saniyadangre80@gmail.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Token</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setViewMode('reset')}
                    className="text-xs text-slate-400 hover:text-indigo-400 transition-colors"
                  >
                    Already have a verification token? Enter it here
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mode 3: Set New Password */}
          {viewMode === 'reset' && (
            <div>
              <div className="flex items-center gap-2 pb-4 mb-5 border-b border-slate-800">
                <button
                  onClick={() => setViewMode('login')}
                  className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg font-semibold text-white">Enter Verification Token</h2>
                  <p className="text-xs text-slate-400">Token dispatched to {resetEmail || authorizedEmail}</p>
                </div>
              </div>

              <form onSubmit={handleResetSubmit} noValidate className="space-y-4">
                <div>
                  <label 
                    htmlFor="reset-token"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Security Token
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-token"
                      name="token"
                      type="text"
                      value={resetToken}
                      onChange={e => setResetToken(e.target.value.toUpperCase())}
                      placeholder="e.g. 8F2A9C..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono uppercase font-bold tracking-wider"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="reset-new-password"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    New Secure Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-new-password"
                      name="newPassword"
                      type="password"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label 
                    htmlFor="reset-confirm-password"
                    className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="reset-confirm-password"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Save New Password & Log In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Footer note */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Encrypted with Bcrypt · JWT Bearer Session Security
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

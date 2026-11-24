import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  Phone,
  ShieldCheck,
  Smartphone,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COUNTRY_CODES = [
  { code: '+91', label: 'India (+91)' },
  { code: '+1', label: 'US / Canada (+1)' },
  { code: '+44', label: 'UK (+44)' },
  { code: '+971', label: 'UAE (+971)' },
  { code: '+65', label: 'Singapore (+65)' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    authLoading,
    authError,
    phoneNeedsConsoleEnable,
    pendingPhoneNumber,
    clearAuthError,
    loginWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
    resetPhoneFlow,
  } = useAuth();

  const [tab, setTab] = useState<'gmail' | 'phone'>('gmail');
  const [countryCode, setCountryCode] = useState('+91');
  const [localPhone, setLocalPhone] = useState('');
  const [otpCode, setOtpCode] = useState('');

  useEffect(() => {
    if (!isOpen) {
      clearAuthError();
    }
  }, [isOpen, clearAuthError]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    const ok = await loginWithGoogle();
    if (ok) onClose();
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const digitsOnly = localPhone.replace(/\D/g, '');
    if (digitsOnly.length < 7) return;
    const e164 = `${countryCode}${digitsOnly}`;
    await sendPhoneOtp(e164, 'sankalp-recaptcha-container');
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim().length < 4) return;
    const ok = await verifyPhoneOtp(otpCode);
    if (ok) {
      setOtpCode('');
      setLocalPhone('');
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Login to SankalpPrep"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Sign In to SankalpPrep · लॉगिन करें
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Sync streaks, test scores, mistakes & bookmarks across devices
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Close login dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Method Switcher */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setTab('gmail');
                clearAuthError();
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                tab === 'gmail'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-blue-700" />
              Gmail / Google
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('phone');
                clearAuthError();
              }}
              className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-colors ${
                tab === 'phone'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              Phone OTP
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {authError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-900 space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
              {phoneNeedsConsoleEnable && (
                <div className="pl-6 space-y-1.5 text-[11px] text-rose-800">
                  <div>
                    1. Open Firebase Console Authentication Providers for this project and enable{' '}
                    <strong>Phone</strong>.
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <a
                      href="https://console.firebase.google.com/project/maximal-hexagon-xpjks/authentication/providers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline"
                    >
                      Firebase Auth Providers <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setTab('gmail');
                        clearAuthError();
                      }}
                      className="font-semibold text-slate-900 underline"
                    >
                      Use Gmail Login Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'gmail' ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2 font-semibold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Instant Verified Google / Gmail Sign-In
                </div>
                <p>
                  Sign in with one click using your Gmail account. Your exam progress, daily 9 AM digest preferences, mistake notebook, and CBT mock scores sync automatically.
                </p>
                <p className="text-slate-500">
                  अपने Gmail खाते से तुरंत लॉगिन करें और सभी डिवाइस पर अपनी तैयारी और स्कोर सुरक्षित रखें।
                </p>
              </div>

              <button
                type="button"
                disabled={authLoading}
                onClick={handleGoogleSignIn}
                className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2.5"
              >
                <Mail className="w-4 h-4" />
                {authLoading ? 'Signing in...' : 'Continue with Gmail / Google'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {!pendingPhoneNumber ? (
                <form onSubmit={handleSendOtp} className="space-y-3.5">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Mobile Number · मोबाइल नंबर
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-blue-600"
                        aria-label="Country code"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="9876543210"
                        value={localPhone}
                        onChange={(e) => setLocalPhone(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      We will send a 6-digit SMS OTP to verify your mobile number.
                    </p>
                  </div>

                  <div id="sankalp-recaptcha-container" className="min-h-[1px]" />

                  <button
                    type="submit"
                    disabled={authLoading || localPhone.replace(/\D/g, '').length < 7}
                    className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Smartphone className="w-4 h-4" />
                    {authLoading ? 'Sending OTP...' : 'Send 6-Digit OTP · OTP भेजें'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-3.5">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      OTP sent to <strong className="font-mono">{pendingPhoneNumber}</strong>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-700">
                      Enter 6-Digit OTP · 6 अंकों का OTP दर्ज करें
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      required
                      placeholder="123456"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2.5 text-center text-lg tracking-widest font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading || otpCode.length < 6}
                    className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    {authLoading ? 'Verifying...' : 'Verify OTP & Sign In'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      resetPhoneFlow();
                      setOtpCode('');
                    }}
                    className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    Change mobile number / Resend OTP
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

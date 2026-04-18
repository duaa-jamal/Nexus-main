import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, CircleDollarSign, Building2, LogIn, AlertCircle, Shield, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { UserRole } from '../../types';

// ── OTP Input ──────────────────────────────────────────────────────────────
const OTPInput: React.FC<{ value: string[]; onChange: (val: string[]) => void }> = ({ value, onChange }) => {
  const inputRefs = Array.from({ length: 6 }, () => React.useRef<HTMLInputElement>(null));

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...value];
    next[i] = val.slice(-1);
    onChange(next);
    if (val && i < 5) inputRefs[i + 1].current?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[i] && i > 0) inputRefs[i - 1].current?.focus();
  };

  return (
    <div className="flex gap-3 justify-center">
      {value.map((digit, i) => (
        <input
          key={i}
          ref={inputRefs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all"
        />
      ))}
    </div>
  );
};

// ── Step indicator ─────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ current: number; total: number }> = ({ current, total }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {Array.from({ length: total }).map((_, i) => (
      <React.Fragment key={i}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
          i + 1 < current  ? 'bg-primary-600 text-white' :
          i + 1 === current ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                              'bg-gray-200 text-gray-500'
        }`}>
          {i + 1 < current ? '✓' : i + 1}
        </div>
        {i < total - 1 && (
          <div className={`flex-1 h-0.5 w-8 ${i + 1 < current ? 'bg-primary-400' : 'bg-gray-200'}`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
export const LoginPage: React.FC = () => {
  const [step, setStep]         = useState(1); // 1: role+creds, 2: 2FA
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]         = useState<UserRole>('entrepreneur');
  const [otp, setOtp]           = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  // Step 1 → go to 2FA step
  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    // Simulate credential check delay
    await new Promise(r => setTimeout(r, 800));
    setIsLoading(false);
    setStep(2);
  };

  // Step 2 → verify OTP (mock: 123456)
  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code !== '123456') {
      setOtpError('Invalid code. Use 123456 for demo.');
      return;
    }
    setOtpError('');
    setIsLoading(true);
    try {
      await login(email, password, role);
      navigate(role === 'entrepreneur' ? '/dashboard/entrepreneur' : '/dashboard/investor');
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
      setStep(1);
    }
  };

  const fillDemoCredentials = (userRole: UserRole) => {
    if (userRole === 'entrepreneur') {
      setEmail('sarah@techwave.io');
      setPassword('password123');
    } else {
      setEmail('michael@vcinnovate.com');
      setPassword('password123');
    }
    setRole(userRole);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-primary-600 rounded-md flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
              <path d="M20 7H4C2.89543 7 2 7.89543 2 9V19C2 20.1046 2.89543 21 4 21H20C21.1046 21 22 20.1046 22 19V9C22 7.89543 21.1046 7 20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to Business Nexus
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Connect with investors and entrepreneurs
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <StepIndicator current={step} total={2} />

          {error && (
            <div className="mb-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle size={18} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Step 1: Credentials ── */}
          {step === 1 && (
            <form className="space-y-6" onSubmit={handleStep1}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${role === 'entrepreneur' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setRole('entrepreneur')}>
                    <Building2 size={18} className="mr-2" /> Entrepreneur
                  </button>
                  <button type="button"
                    className={`py-3 px-4 border rounded-md flex items-center justify-center transition-colors ${role === 'investor' ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => setRole('investor')}>
                    <CircleDollarSign size={18} className="mr-2" /> Investor
                  </button>
                </div>
              </div>

              <Input label="Email address" type="email" value={email}
                onChange={e => setEmail(e.target.value)} required fullWidth
                startAdornment={<User size={18} />} />

              <Input label="Password" type="password" value={password}
                onChange={e => setPassword(e.target.value)} required fullWidth />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input id="remember-me" type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">Remember me</label>
                </div>
                <a href="#" className="text-sm font-medium text-primary-600 hover:text-primary-500">Forgot password?</a>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<LogIn size={18} />}>
                Continue
              </Button>

              {/* Demo buttons */}
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">Demo Accounts</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" onClick={() => fillDemoCredentials('entrepreneur')} leftIcon={<Building2 size={16} />}>
                  Entrepreneur
                </Button>
                <Button variant="outline" onClick={() => fillDemoCredentials('investor')} leftIcon={<CircleDollarSign size={16} />}>
                  Investor
                </Button>
              </div>

              <p className="text-center text-sm text-gray-600 mt-2">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">Sign up</Link>
              </p>
            </form>
          )}

          {/* ── Step 2: 2FA OTP ── */}
          {step === 2 && (
            <form className="space-y-6" onSubmit={handleStep2}>
              <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 rounded-full mb-2">
                  <Shield size={28} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-500">
                  Enter the 6-digit code sent to <span className="font-medium text-gray-700">{email}</span>
                </p>
                <p className="text-xs text-primary-600 font-medium bg-primary-50 rounded-lg py-2 px-3">
                  Demo code: <strong>1 2 3 4 5 6</strong>
                </p>
              </div>

              <OTPInput value={otp} onChange={setOtp} />

              {otpError && (
                <p className="text-center text-sm text-red-600 flex items-center justify-center gap-1">
                  <AlertCircle size={14} /> {otpError}
                </p>
              )}

              <Button type="submit" fullWidth isLoading={isLoading} leftIcon={<Shield size={18} />}>
                Verify & Sign In
              </Button>

              <button type="button" onClick={() => { setStep(1); setOtp(['','','','','','']); setOtpError(''); }}
                className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <ArrowLeft size={14} /> Back to login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
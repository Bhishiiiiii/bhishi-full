import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  Phone, 
  CheckCircle2, 
  Sparkles, 
  ArrowLeft, 
  Loader2,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, registerUser, isAuthenticated, currentUser } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('ananya.d@sunrise-circle.in');
  const [password, setPassword] = useState('password123');

  // Register Form State
  const [name, setName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<'member' | 'organizer'>('member');

  const [isLoading, setIsLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle standard email/password login
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      await login(email.trim(), password);
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle standard registration (Roles: member or organizer only)
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please fill in name, email, and password.');
      return;
    }
    if (regPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }
    setErrorMsg('');
    setIsLoading(true);

    try {
      await registerUser({
        name: name.trim(),
        email: regEmail.trim(),
        phone: phone.trim() || '+91 98000 00000',
        password: regPassword,
        role: regRole
      });
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-click Demo Login for Judges (Authenticates against real backend endpoints)
  const handleQuickDemo = async (roleKey: 'organizer' | 'member' | 'auditor') => {
    setErrorMsg('');
    setDemoLoadingRole(roleKey);

    let demoEmail = 'ananya.d@sunrise-circle.in';
    if (roleKey === 'member') demoEmail = 'meera.joshi@pune-ventures.com';
    if (roleKey === 'auditor') demoEmail = 'raman.audits@consortium-verify.in';

    try {
      await login(demoEmail, 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo authentication failed.');
    } finally {
      setDemoLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-bone-300 text-bottle-950 font-sans flex flex-col justify-between selection:bg-bottle-800 selection:text-bone-200">
      {/* Top Header Bar */}
      <header className="px-6 lg:px-12 py-5 border-b border-bottle-800/10 bg-bone-300/80 backdrop-blur-md flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-bottle-800 flex items-center justify-center text-bone-200 font-serif font-black text-xl shadow-md group-hover:scale-105 transition-transform">
            B
          </div>
          <div>
            <span className="font-serif font-bold text-xl tracking-wider text-bottle-900 block leading-tight">
              BISHI
            </span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-bottle-700/80">
              Community Trust
            </span>
          </div>
        </Link>

        <Link
          to="/"
          className="text-xs font-semibold text-bottle-800 hover:text-bottle-950 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Authentication Section */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Editorial Branding Hero */}
        <div className="lg:col-span-5 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-bottle-900 text-bone-200 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Ethereum Sepolia Testnet Notary</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-bottle-950 leading-tight">
            Traditional Bishi.
            <br />
            <span className="italic font-normal text-bottle-800">A New Standard of Trust.</span>
          </h1>

          <p className="text-xs sm:text-sm text-bottle-800/80 leading-relaxed font-light">
            Centralized community circle management for families, women's self-help groups, and commercial trade networks — anchored with cryptographic SHA-256 state proofs on Ethereum Sepolia.
          </p>

          {/* Value Props Pills */}
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center gap-3 text-bottle-900">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Real UPI, NEFT, and Cash payments tracked with verifiable receipts</span>
            </div>

            <div className="flex items-center gap-3 text-bottle-900">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Zero gas fees & zero MetaMask friction for end-users</span>
            </div>

            <div className="flex items-center gap-3 text-bottle-900">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Immutable non-auction rotation charters verified by independent auditors</span>
            </div>
          </div>
        </div>

        {/* Right Authentication & Hackathon Demo Cards */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Quick Hackathon Demo Login Card (Judges 1-Click Access) — only visible on Sign In tab */}
          <div className={`p-6 rounded-3xl bg-bottle-900 text-bone-200 border border-bottle-800 shadow-premium space-y-4 ${mode === 'signup' ? 'hidden' : ''}`}>
            <div className="flex items-center justify-between pb-3 border-b border-bone-500/15">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-bone-100">
                  Quick Hackathon Demo Login
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bottle-950 text-gold-400 font-mono border border-bone-500/20">
                1-Click JWT Auth
              </span>
            </div>

            <p className="text-xs text-bone-300/80 leading-relaxed">
              Select any pre-seeded persona to authenticate instantly with real credentials and explore role-based permissions:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {/* Persona 1: Ananya (Organizer) */}
              <button
                type="button"
                onClick={() => handleQuickDemo('organizer')}
                disabled={demoLoadingRole !== null || isLoading}
                className="p-3.5 rounded-2xl bg-bottle-800/80 hover:bg-bottle-800 border border-bone-500/15 hover:border-gold-400/50 text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 font-semibold">
                      Organizer
                    </span>
                    <span className="text-gold-400 text-xs group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <div className="font-serif font-bold text-bone-100 text-sm">Ananya Deshmukh</div>
                  <div className="text-[10px] text-bone-300/70 font-mono truncate">ananya.d@sunrise-circle.in</div>
                </div>
                <div className="mt-3 text-[10px] text-bone-400 border-t border-bone-500/10 pt-1.5">
                  Full circle management, record payments & disburse payouts
                </div>
              </button>

              {/* Persona 2: Meera (Member) */}
              <button
                type="button"
                onClick={() => handleQuickDemo('member')}
                disabled={demoLoadingRole !== null || isLoading}
                className="p-3.5 rounded-2xl bg-bottle-800/80 hover:bg-bottle-800 border border-bone-500/15 hover:border-gold-400/50 text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 font-semibold">
                      Member
                    </span>
                    <span className="text-gold-400 text-xs group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <div className="font-serif font-bold text-bone-100 text-sm">Meera Joshi</div>
                  <div className="text-[10px] text-bone-300/70 font-mono truncate">meera.joshi@pune-ventures.com</div>
                </div>
                <div className="mt-3 text-[10px] text-bone-400 border-t border-bone-500/10 pt-1.5">
                  Confirm disbursements, review turns & personal ledger
                </div>
              </button>

              {/* Persona 3: Dr. Raman (Auditor) */}
              <button
                type="button"
                onClick={() => handleQuickDemo('auditor')}
                disabled={demoLoadingRole !== null || isLoading}
                className="p-3.5 rounded-2xl bg-bottle-800/80 hover:bg-bottle-800 border border-bone-500/15 hover:border-gold-400/50 text-left transition-all group cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-semibold">
                      Auditor
                    </span>
                    <span className="text-gold-400 text-xs group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                  <div className="font-serif font-bold text-bone-100 text-sm">Dr. K. R. Raman</div>
                  <div className="text-[10px] text-bone-300/70 font-mono truncate">raman.audits@consortium-verify.in</div>
                </div>
                <div className="mt-3 text-[10px] text-bone-400 border-t border-bone-500/10 pt-1.5">
                  Independent notary audits & read-only verification
                </div>
              </button>
            </div>
          </div>

          {/* 2. Standard Form Card (Sign In / Sign Up) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-bottle-800/10 shadow-elevated space-y-6">
            {/* Tab Switcher */}
            <div className="flex border-b border-bone-600 pb-2">
              <button
                type="button"
                onClick={() => { setMode('signin'); setErrorMsg(''); }}
                className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  mode === 'signin'
                    ? 'border-bottle-900 text-bottle-950'
                    : 'border-transparent text-bottle-800/50 hover:text-bottle-800'
                }`}
              >
                Sign In With Existing Account
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setErrorMsg(''); }}
                className={`flex-1 pb-2 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  mode === 'signup'
                    ? 'border-bottle-900 text-bottle-950'
                    : 'border-transparent text-bottle-800/50 hover:text-bottle-800'
                }`}
              >
                Create New Account
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-crimson-50 border border-crimson-200 text-crimson-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-crimson-600 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Mode A: Sign In Form */}
            {mode === 'signin' ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-bottle-900 block mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. ananya.d@sunrise-circle.in"
                      className="w-full text-xs bg-bone-300 border border-bottle-800/20 rounded-xl pl-9 pr-3 py-2.5 text-bottle-950 outline-none focus:border-bottle-800"
                      required
                    />
                    <Mail className="w-4 h-4 text-bottle-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-bottle-900">
                      Password
                    </label>
                    <span className="text-[11px] text-bottle-800/60">Demo: password123</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full text-xs bg-bone-300 border border-bottle-800/20 rounded-xl pl-9 pr-3 py-2.5 text-bottle-950 outline-none focus:border-bottle-800"
                      required
                    />
                    <Lock className="w-4 h-4 text-bottle-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-bone-200" />
                      <span>Authenticating with Bishi Node...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Bishi App</span>
                      <ArrowRight className="w-4 h-4 text-crimson-400" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* Mode B: Sign Up Form */
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-bottle-900 block mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="Snehal Deshpande"
                        className="w-full text-xs bg-bone-300 border border-bottle-800/20 rounded-xl pl-9 pr-3 py-2.5 text-bottle-950 outline-none focus:border-bottle-800"
                        required
                      />
                      <User className="w-4 h-4 text-bottle-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-bottle-900 block mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+91 98230 11223"
                        className="w-full text-xs bg-bone-300 border border-bottle-800/20 rounded-xl pl-9 pr-3 py-2.5 text-bottle-950 outline-none focus:border-bottle-800"
                        required
                      />
                      <Phone className="w-4 h-4 text-bottle-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-bottle-900 block mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="snehal@example.com"
                        className="w-full text-xs bg-bone-300 border border-bottle-800/20 rounded-xl pl-9 pr-3 py-2.5 text-bottle-950 outline-none focus:border-bottle-800"
                        required
                      />
                      <Mail className="w-4 h-4 text-bottle-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-bottle-900 block mb-1">
                      Account Role
                    </label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value as 'member' | 'organizer')}
                      className="w-full text-xs font-semibold bg-bone-300 border border-bottle-800/20 rounded-xl px-3 py-2.5 text-bottle-950 outline-none focus:border-bottle-800 cursor-pointer"
                    >
                      <option value="member">Member (Participant)</option>
                      <option value="organizer">Organizer (Manage Circles)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-bottle-900">
                      Set Password
                    </label>
                    <span className="text-[11px] text-bottle-800/60">Minimum 8 characters</span>
                  </div>
                  <div className="relative">
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      minLength={8}
                      className="w-full text-xs bg-bone-300 border border-bottle-800/20 rounded-xl pl-9 pr-3 py-2.5 text-bottle-950 outline-none focus:border-bottle-800"
                      required
                    />
                    <Lock className="w-4 h-4 text-bottle-700/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-bottle-800 hover:bg-bottle-900 text-bone-200 text-xs font-bold shadow-subtle flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-bone-200" />
                      <span>Creating Account in MongoDB...</span>
                    </>
                  ) : (
                    <>
                      <span>Join Bishi Trust Consortium</span>
                      <ArrowRight className="w-4 h-4 text-crimson-400" />
                    </>
                  )}
                </button>
              </form>
            )}

            {isAuthenticated && currentUser && (
              <div className="p-3 rounded-xl bg-bone-400/50 border border-bottle-800/10 flex items-center justify-between text-xs">
                <span className="text-bottle-800/80">
                  Currently signed in as: <strong>{currentUser.name}</strong> ({currentUser.displayRole || currentUser.role})
                </span>
                <Link
                  to="/dashboard"
                  className="font-bold text-bottle-900 hover:text-crimson-700 underline"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 lg:px-12 py-4 border-t border-bottle-800/10 text-center text-[11px] text-bottle-800/70">
        © 2026 Bishi Trust Protocol — Hybrid Centralized Savings with Ethereum Sepolia Relayer Proofs.
      </footer>
    </div>
  );
};

export default LoginPage;

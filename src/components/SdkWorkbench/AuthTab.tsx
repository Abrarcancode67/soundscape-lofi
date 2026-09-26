import React, { useState, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { FasUser, AuthProvider } from '../../types/fas';
import { User, LogIn, LogOut, Calendar, ShieldCheck, Key, RefreshCw, Mail, Github } from 'lucide-react';

export const AuthTab: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<FasUser | null>(fasSdk.getUser());
  const [provider, setProvider] = useState<AuthProvider>('github');
  const [customLogin, setCustomLogin] = useState('');
  const [dob, setDob] = useState(currentUser?.dateOfBirth || '2000-01-15');
  const [copiedToken, setCopiedToken] = useState(false);

  useEffect(() => {
    return fasSdk.onAuthChange(user => {
      setCurrentUser(user);
      if (user?.dateOfBirth) setDob(user.dateOfBirth);
    });
  }, []);

  const handleSignIn = () => {
    fasSdk.signIn(provider, customLogin.trim() || undefined);
    setCustomLogin('');
  };

  const handleSignOut = () => {
    fasSdk.signOut();
  };

  const handleSaveDob = () => {
    if (!dob) return;
    fasSdk.setDateOfBirth(dob);
  };

  const copyToken = () => {
    if (currentUser?.token) {
      navigator.clipboard.writeText(currentUser.token);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview callout */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.auth (Platform Identity & OAuth Engine)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-1">
              Supports GitHub, Google, Apple, and Email magic link. 30-day HMAC-signed session persists in localStorage.
            </p>
          </div>
          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)]">
            fas.auth.init()
          </span>
        </div>

        {/* Current State Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Active Profile Box */}
          <div className="p-5 rounded-xl bg-[var(--panel-secondary)] border border-[var(--line)] space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono-code uppercase font-semibold text-[var(--muted)]">
                Active Session State
              </span>
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                currentUser ? 'text-emerald-500' : 'text-slate-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${currentUser ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {currentUser ? 'Authenticated' : 'Signed Out'}
              </span>
            </div>

            {currentUser ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)] text-white font-bold text-lg flex items-center justify-center border-2 border-white/20 shadow-xs">
                    {currentUser.login.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-[var(--ink-strong)]">
                      {currentUser.login}
                    </div>
                    <div className="text-xs text-[var(--muted)] font-mono-code">
                      ID: {currentUser.id}
                    </div>
                    <div className="text-xs text-[var(--muted)]">
                      Provider: <span className="font-semibold capitalize text-[var(--ink)]">{currentUser.provider}</span>
                    </div>
                  </div>
                </div>

                {/* Token row */}
                <div className="p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--line)] text-xs space-y-1">
                  <div className="flex items-center justify-between text-[var(--muted)]">
                    <span className="font-mono-code text-[11px]">HMAC Session Token:</span>
                    <button
                      onClick={copyToken}
                      className="text-[11px] font-semibold text-[var(--accent)] hover:underline"
                    >
                      {copiedToken ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <div className="font-mono-code text-[11px] text-[var(--ink)] truncate">
                    {currentUser.token}
                  </div>
                </div>

                {/* Date of Birth */}
                <div className="pt-2 border-t border-[var(--line)] flex items-center justify-between gap-2">
                  <div className="text-xs text-[var(--muted)]">
                    Date of Birth: <span className="font-semibold text-[var(--ink)]">{currentUser.dateOfBirth || 'Not set'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="date"
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      className="text-xs px-2 py-1 bg-[var(--panel)] border border-[var(--line)] rounded-md text-[var(--ink)]"
                    />
                    <button
                      onClick={handleSaveDob}
                      className="text-xs px-2 py-1 bg-[var(--ink-strong)] text-[var(--panel)] rounded-md font-semibold hover:opacity-90"
                    >
                      Update
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSignOut}
                  className="w-full mt-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>fas.auth.signOut()</span>
                </button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-3">
                <User className="w-8 h-8 text-[var(--muted)] mx-auto opacity-50" />
                <p className="text-xs text-[var(--muted)]">
                  No active session in localStorage. Sign in below using any supported provider.
                </p>
              </div>
            )}
          </div>

          {/* Sign In Controls */}
          <div className="p-5 rounded-xl bg-[var(--panel-secondary)] border border-[var(--line)] space-y-4">
            <span className="text-xs font-mono-code uppercase font-semibold text-[var(--muted)]">
              Simulate Provider OAuth Login
            </span>

            <div className="grid grid-cols-2 gap-2">
              {(['github', 'google', 'apple', 'email'] as AuthProvider[]).map(p => (
                <button
                  key={p}
                  onClick={() => setProvider(p)}
                  className={`p-2.5 rounded-lg border text-xs font-semibold capitalize transition flex items-center justify-center gap-2 ${
                    provider === p
                      ? 'bg-[var(--accent)] text-white border-[var(--accent)]'
                      : 'bg-[var(--panel)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--accent)]/50'
                  }`}
                >
                  {p === 'github' && <Github className="w-3.5 h-3.5" />}
                  {p === 'email' && <Mail className="w-3.5 h-3.5" />}
                  <span>{p}</span>
                </button>
              ))}
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[var(--muted)]">
                Custom Username / Email (optional)
              </label>
              <input
                type="text"
                placeholder={provider === 'email' ? 'developer@freeappstore.online' : 'octocat-engineer'}
                value={customLogin}
                onChange={e => setCustomLogin(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[var(--ink)] outline-none"
              />
            </div>

            <button
              onClick={handleSignIn}
              className="w-full py-2.5 bg-[var(--accent)] hover:opacity-95 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign in with {provider}</span>
            </button>

            <div className="text-[11px] text-[var(--muted)] leading-relaxed border-t border-[var(--line)] pt-3">
              <code>fas.auth.signIn('{provider}')</code> triggers the OAuth redirect loop on production and saves session HMAC token to localStorage.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

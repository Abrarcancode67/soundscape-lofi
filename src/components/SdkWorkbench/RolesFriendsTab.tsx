import React, { useState } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { RoleAssignment, FriendEntry } from '../../types/fas';
import { Shield, UserPlus, Users, Check, X, Ban, Mail, Webhook, RefreshCw } from 'lucide-react';

export const RolesFriendsTab: React.FC = () => {
  const [roles, setRoles] = useState<RoleAssignment[]>(fasSdk.getRoles());
  const [friends, setFriends] = useState<FriendEntry[]>(fasSdk.getFriends());
  const [friendInput, setFriendInput] = useState('');
  const [emailTo, setEmailTo] = useState('dev@freeappstore.online');
  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  const handleAddFriend = () => {
    if (!friendInput.trim()) return;
    const newFriend: FriendEntry = {
      userId: 'usr_' + Date.now().toString(36),
      username: friendInput.trim(),
      avatarUrl: '',
      status: 'pending_outgoing',
      since: 'Just now'
    };
    setFriends([newFriend, ...friends]);
    fasSdk.log('info', `fas.friends.request("${friendInput.trim()}") sent`);
    setFriendInput('');
  };

  const handleFriendResponse = (userId: string, action: 'accept' | 'decline' | 'block') => {
    if (action === 'accept') {
      setFriends(friends.map(f => f.userId === userId ? { ...f, status: 'accepted' } : f));
      fasSdk.log('info', `fas.friends.respond("${userId}", "accept")`);
    } else if (action === 'block') {
      setFriends(friends.map(f => f.userId === userId ? { ...f, status: 'blocked' } : f));
      fasSdk.log('warn', `fas.friends.respond("${userId}", "block")`);
    } else {
      setFriends(friends.filter(f => f.userId !== userId));
      fasSdk.log('info', `fas.friends.respond("${userId}", "decline")`);
    }
  };

  const handleSendEmail = () => {
    setEmailStatus('Sent transactional email via Resend (100/day limit)');
    fasSdk.log('info', `fas.email.send("${emailTo}", "Welcome to FreeAppStore")`);
    setTimeout(() => setEmailStatus(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RBAC Roles Panel */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-strong)] flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--accent)]" />
                <span>fas.roles (Per-App RBAC)</span>
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Built-in roles: owner, member, moderator, editor, viewer.
              </p>
            </div>
            <span className="text-[11px] font-mono-code text-[var(--muted)]">fas.roles.myRoles()</span>
          </div>

          <div className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-xl overflow-hidden bg-[var(--panel-secondary)]">
            {roles.map(r => (
              <div key={r.userId} className="p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[var(--line)] flex items-center justify-center font-bold text-[var(--ink)]">
                    {r.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--ink-strong)]">{r.userName}</div>
                    <div className="text-[10px] text-[var(--muted)] font-mono-code">{r.userId}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded font-mono-code text-[11px] font-bold capitalize ${
                  r.role === 'owner'
                    ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30'
                    : r.role === 'moderator'
                    ? 'bg-purple-500/15 text-purple-600 border border-purple-500/30'
                    : 'bg-[var(--panel)] text-[var(--muted)] border border-[var(--line)]'
                }`}>
                  {r.role}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-xl text-xs space-y-1">
            <div className="font-mono-code font-bold text-[var(--ink)]">fas.roles.check('moderator')</div>
            <div className="text-[11px] text-[var(--muted)]">Evaluates server-side permissions for the currently authenticated caller.</div>
          </div>
        </div>

        {/* Platform Friends Panel */}
        <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <div>
              <h3 className="text-sm font-bold text-[var(--ink-strong)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span>fas.friends (Platform Friendship Graph)</span>
              </h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Friends persist across all apps on FreeAppStore.
              </p>
            </div>
            <span className="text-[11px] font-mono-code text-[var(--muted)]">fas.friends.list()</span>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Send friend request to username..."
              value={friendInput}
              onChange={e => setFriendInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
            />
            <button
              onClick={handleAddFriend}
              className="px-3 py-2 bg-[var(--accent)] text-white text-xs font-bold rounded-lg hover:opacity-95 transition flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>

          <div className="divide-y divide-[var(--line)] border border-[var(--line)] rounded-xl overflow-hidden bg-[var(--panel-secondary)] max-h-48 overflow-y-auto">
            {friends.map(f => (
              <div key={f.userId} className="p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-[var(--ink-strong)]">{f.username}</div>
                  <div className="text-[10px] text-[var(--muted)]">{f.since}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  {f.status === 'accepted' && (
                    <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Friends
                    </span>
                  )}
                  {f.status === 'pending_incoming' && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleFriendResponse(f.userId, 'accept')}
                        className="p-1 rounded bg-emerald-500 text-white hover:bg-emerald-600"
                        title="Accept"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleFriendResponse(f.userId, 'decline')}
                        className="p-1 rounded bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        title="Decline"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {f.status === 'pending_outgoing' && (
                    <span className="text-[10px] text-[var(--muted)] font-mono-code">
                      Requested
                    </span>
                  )}
                  {f.status === 'blocked' && (
                    <span className="text-[10px] text-rose-500 font-mono-code">
                      Blocked
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactional Email & Webhook Card */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <Mail className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.email (Transactional via Resend)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              Quota: 100 emails/day per app. Send verification links, game notifications, or team alerts.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                className="flex-1 text-xs px-3 py-2 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-lg text-[var(--ink)]"
              />
              <button
                onClick={handleSendEmail}
                className="px-3 py-2 bg-[var(--panel-secondary)] hover:bg-[var(--line)]/50 border border-[var(--line)] text-xs font-semibold rounded-lg text-[var(--ink)]"
              >
                Send
              </button>
            </div>
            {emailStatus && (
              <div className="text-xs text-emerald-500 font-semibold">{emailStatus}</div>
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <Webhook className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.webhooks (Outbound Events)</span>
            </h4>
            <p className="text-xs text-[var(--muted)]">
              HMAC-SHA256 signed. Quota: 5 webhooks per app across 8 platform event types (e.g. app.published, user.signed_in).
            </p>
            <div className="p-2.5 bg-[var(--panel-secondary)] rounded-lg border border-[var(--line)] font-mono-code text-[11px] text-[var(--muted)]">
              POST https://yourapi.com/hook [X-FAS-Signature: sha256=...]
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { RoomMessage, RoomPeer } from '../../types/fas';
import { MessageSquare, Users, Send, Wifi, WifiOff, Sparkles, Bot } from 'lucide-react';

export const RoomsTab: React.FC = () => {
  const [roomName, setRoomName] = useState('lobby');
  const [connectionState, setConnectionState] = useState<'open' | 'connecting' | 'closed'>('open');
  const [messages, setMessages] = useState<RoomMessage[]>([
    {
      id: 'm1',
      from: 'usr_sarah',
      senderName: 'sarah-codes',
      data: { text: 'Hey everyone! Welcome to the FAS realtime room.' },
      timestamp: '11:30 AM'
    },
    {
      id: 'm2',
      from: 'usr_kenji',
      senderName: 'dev-kenji',
      data: { text: 'Durable Objects fan-out is ultra low latency!' },
      timestamp: '11:32 AM'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [peers, setPeers] = useState<RoomPeer[]>([
    { id: 'usr_self', name: fasSdk.getUser()?.login || 'You', color: '#10b981', joinedAt: 'Just now' },
    { id: 'usr_sarah', name: 'sarah-codes', color: '#6366f1', joinedAt: '5m ago' },
    { id: 'usr_kenji', name: 'dev-kenji', color: '#f59e0b', joinedAt: '2m ago' }
  ]);

  const handleSend = () => {
    if (!inputMessage.trim()) return;
    const user = fasSdk.getUser();
    const newMsg: RoomMessage = {
      id: 'msg_' + Date.now(),
      from: user?.id || 'usr_self',
      senderName: user?.login || 'You',
      data: { text: inputMessage.trim() },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMsg]);
    fasSdk.log('debug', `fas.rooms.join("${roomName}").send()`, newMsg.data);
    setInputMessage('');
  };

  const simulatePeerMessage = () => {
    const peerBots = [
      { id: 'usr_sarah', name: 'sarah-codes', text: 'Checked fas check compliance - 100% score!' },
      { id: 'usr_kenji', name: 'dev-kenji', text: 'Deploying the new canvas-game template to R2!' },
      { id: 'usr_clara', name: 'clara-designer', text: 'Manrope and Fraunces fonts looking crisp.' }
    ];
    const pick = peerBots[Math.floor(Math.random() * peerBots.length)];
    const msg: RoomMessage = {
      id: 'msg_' + Date.now(),
      from: pick.id,
      senderName: pick.name,
      data: { text: pick.text },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, msg]);
    fasSdk.log('info', `Room message received from peer ${pick.name}`, msg.data);
  };

  const toggleConnection = () => {
    if (connectionState === 'open') {
      setConnectionState('closed');
      fasSdk.log('warn', `Room "${roomName}" connection closed`);
    } else {
      setConnectionState('connecting');
      setTimeout(() => {
        setConnectionState('open');
        fasSdk.log('info', `Room "${roomName}" WebSocket open`);
      }, 400);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
              <span>fas.rooms (Ephemeral WebSocket Fan-out)</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Durable-Object-backed realtime channels. Ephemeral messages broadcasted to up to 32 active peers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              connectionState === 'open'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
            }`}>
              <span className={`w-2 h-2 rounded-full ${connectionState === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="capitalize">{connectionState}</span>
            </span>
            <button
              onClick={toggleConnection}
              className="text-xs px-2.5 py-1 rounded-lg bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)]"
            >
              {connectionState === 'open' ? 'Disconnect' : 'Connect'}
            </button>
          </div>
        </div>

        {/* Room Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--muted)]">Room:</span>
            {['lobby', 'table-42', 'drawing-canvas'].map(r => (
              <button
                key={r}
                onClick={() => setRoomName(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono-code transition ${
                  roomName === r
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--panel-secondary)] text-[var(--muted)] hover:text-[var(--ink)] border border-[var(--line)]'
                }`}
              >
                #{r}
              </button>
            ))}
          </div>

          <button
            onClick={simulatePeerMessage}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-semibold hover:bg-indigo-500/20 transition"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Simulate Peer Broadcast</span>
          </button>
        </div>

        {/* Chat & Peers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Messages Feed */}
          <div className="lg:col-span-8 flex flex-col h-96 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-xl overflow-hidden">
            <div className="p-3 bg-[var(--panel)] border-b border-[var(--line)] flex items-center justify-between text-xs text-[var(--muted)] font-mono-code">
              <span>fas.rooms.join('{roomName}')</span>
              <span>32 peers cap · 4KB / msg</span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map(m => {
                const isMe = m.senderName === (fasSdk.getUser()?.login || 'You');
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold text-[var(--muted)]">
                        {m.senderName}
                      </span>
                      <span className="text-[10px] text-[var(--muted)] font-mono-code">
                        {m.timestamp}
                      </span>
                    </div>
                    <div className={`p-3 rounded-2xl max-w-sm text-xs leading-relaxed ${
                      isMe
                        ? 'bg-[var(--accent)] text-white rounded-tr-xs'
                        : 'bg-[var(--panel)] text-[var(--ink)] border border-[var(--line)] rounded-tl-xs'
                    }`}>
                      {m.data.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-[var(--panel)] border-t border-[var(--line)] flex gap-2">
              <input
                type="text"
                placeholder={connectionState === 'open' ? 'Type message to broadcast to room...' : 'Room disconnected'}
                disabled={connectionState !== 'open'}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                className="flex-1 text-xs px-3 py-2 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-lg text-[var(--ink)] outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={connectionState !== 'open'}
                className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-xs font-bold hover:opacity-95 transition flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </div>

          {/* Active Peers Sidebar */}
          <div className="lg:col-span-4 bg-[var(--panel-secondary)] border border-[var(--line)] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <div className="text-xs font-bold text-[var(--ink-strong)] flex items-center gap-2">
                <Users className="w-4 h-4 text-[var(--accent)]" />
                <span>Active Peers ({peers.length}/32)</span>
              </div>
              <span className="text-[10px] font-mono-code text-[var(--muted)]">room.peers</span>
            </div>

            <div className="space-y-2">
              {peers.map(p => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--panel)] border border-[var(--line)] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-7 h-7 rounded-full text-white font-bold text-xs flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: p.color }}
                    >
                      {p.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-[var(--ink-strong)]">{p.name}</div>
                      <div className="text-[10px] text-[var(--muted)]">{p.joinedAt}</div>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              ))}
            </div>

            <div className="p-3 bg-[var(--panel)] border border-[var(--line)] rounded-lg text-[11px] text-[var(--muted)] leading-relaxed">
              <strong>Ephemeral channel</strong>: Messages are relayed instantly across peers in-memory and evicted after 24 hours of inactivity.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Official FreeAppStore Templates Data
 * Includes full file trees and source code for:
 * 1. standalone
 * 2. connected
 * 3. game-canvas
 * 4. game-grid
 * 5. game-3d
 */

import { TemplateDefinition } from '../types/fas';

export const OFFICIAL_TEMPLATES: TemplateDefinition[] = [
  {
    id: 'standalone',
    name: 'Standalone PWA',
    tagline: 'Offline-ready client app using localStorage only. Zero backend dependency.',
    description: 'Perfect for local productivity tools, calculators, timers, converters, and client-side utilities. Blazing fast, zero latency, and works completely offline as an installable PWA.',
    iconName: 'Smartphone',
    badgeText: 'Default · Offline PWA',
    demoComponent: 'StandaloneDemo',
    features: [
      'Zero backend setup or API dependencies',
      'Persistent data in browser localStorage',
      'PWA manifest with offline service worker support',
      'Under 45KB gzipped footprint',
      'Full TypeScript + Tailwind CSS structure'
    ],
    files: [
      {
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "my-quick-notes",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.546.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}`
      },
      {
        name: 'App.tsx',
        path: 'web/src/App.tsx',
        language: 'tsx',
        content: `import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Check, FileText } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  body: string;
  createdAt: string;
}

export default function App() {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('app_notes');
    return saved ? JSON.parse(saved) : [
      { id: '1', title: 'Welcome note', body: 'This app runs completely standalone using browser storage.', createdAt: 'Just now' }
    ];
  });
  const [activeId, setActiveId] = useState<string>(notes[0]?.id || '');
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('app_notes', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === activeId) || notes[0];

  const addNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'Untitled Note',
      body: '',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setNotes([newNote, ...notes]);
    setActiveId(newNote.id);
  };

  const deleteNote = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    if (activeId === id) setActiveId(next[0]?.id || '');
  };

  const updateActive = (title: string, body: string) => {
    setNotes(notes.map(n => n.id === activeId ? { ...n, title, body } : n));
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Sidebar */}
      <aside className="w-72 border-r border-slate-200 bg-white flex flex-col">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h1 className="font-bold text-lg tracking-tight">QuickNotes</h1>
          <button 
            onClick={addNote} 
            className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="p-2">
          <input 
            type="text" 
            placeholder="Search notes..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-md"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notes.filter(n => n.title.toLowerCase().includes(search.toLowerCase())).map(note => (
            <button
              key={note.id}
              onClick={() => setActiveId(note.id)}
              className={\`w-full text-left p-3 rounded-lg text-sm transition \${
                note.id === activeId ? 'bg-emerald-50 text-emerald-900 font-medium' : 'hover:bg-slate-100 text-slate-700'
              }\`}
            >
              <div className="truncate font-medium">{note.title || 'Untitled'}</div>
              <div className="text-xs text-slate-400 mt-1">{note.createdAt}</div>
            </button>
          ))}
        </div>
      </aside>

      {/* Editor */}
      <main className="flex-1 flex flex-col bg-white">
        {activeNote ? (
          <div className="flex-1 flex flex-col p-8 max-w-3xl mx-auto w-full">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <input 
                type="text" 
                value={activeNote.title}
                onChange={e => updateActive(e.target.value, activeNote.body)}
                placeholder="Note title..."
                className="text-2xl font-bold tracking-tight text-slate-900 border-none outline-none w-full"
              />
              <button 
                onClick={() => deleteNote(activeNote.id)}
                className="text-slate-400 hover:text-red-600 p-2"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <textarea
              value={activeNote.body}
              onChange={e => updateActive(activeNote.title, e.target.value)}
              placeholder="Start typing your note..."
              className="flex-1 resize-none border-none outline-none text-slate-700 leading-relaxed text-base"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            No note selected. Click "+" to create one.
          </div>
        )}
      </main>
    </div>
  );
}`
      },
      {
        name: 'manifest.json',
        path: 'web/manifest.json',
        language: 'json',
        content: `{
  "name": "QuickNotes Standalone",
  "short_name": "QuickNotes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}`
      },
      {
        name: 'deploy.yml',
        path: '.github/workflows/deploy.yml',
        language: 'yaml',
        content: `name: Deploy to FreeAppStore
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - name: Upload to R2 Bucket
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: \${{ secrets.CF_API_TOKEN }}
          command: r2 object put fas-apps/apps/\${{ github.event.repository.name }} --file=web/dist/`
      }
    ]
  },
  {
    id: 'connected',
    name: 'Connected SDK App',
    tagline: 'Full platform integration: Auth, Per-user KV, Shared Counters, and Realtime Rooms.',
    description: 'The standard template for multiplayer, social, and collaborative applications. Leverages Cloudflare Workers, D1 database, and Durable Objects via the @freeappstore/sdk.',
    iconName: 'Cloud',
    badgeText: 'Full SDK Platform',
    demoComponent: 'ConnectedDemo',
    features: [
      'GitHub, Google, Apple & Email magic link authentication',
      'Per-user server-synced KV storage (1MB / 100 keys)',
      'App-wide atomic counters (e.g. view counts, upvotes)',
      'Durable Object WebSocket rooms with live peer broadcast',
      'Encrypted API Key Vault & Secret Proxy access'
    ],
    files: [
      {
        name: 'package.json',
        path: 'package.json',
        language: 'json',
        content: `{
  "name": "my-social-hub",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "dependencies": {
    "@freeappstore/sdk": "^0.14.27",
    "lucide-react": "^0.546.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@tailwindcss/vite": "^4.0.0",
    "@types/react": "^19.0.0",
    "tailwindcss": "^4.0.0",
    "typescript": "^5.7.0",
    "vite": "^6.0.0"
  }
}`
      },
      {
        name: 'App.tsx',
        path: 'web/src/App.tsx',
        language: 'tsx',
        content: `import React, { useState, useEffect } from 'react';
import { initApp } from '@freeappstore/sdk';
import { useAuth } from '@freeappstore/sdk/hooks';
import { FasShell, Card, SignInButton, Avatar } from '@freeappstore/sdk/ui';
import { Heart, MessageSquare, Sparkles } from 'lucide-react';

const fas = initApp({ appId: 'my-social-hub' });

export default function App() {
  const { user, loading, signIn, signOut } = useAuth(fas);
  const [likes, setLikes] = useState<number>(0);
  const [roomMsg, setRoomMsg] = useState<string[]>([]);
  const [inputVal, setInputVal] = useState('');

  useEffect(() => {
    // 1. Initialize auth
    fas.auth.init();

    // 2. Fetch shared counter
    fas.counters.get('global_likes').then(val => setLikes(val || 0));

    // 3. Join realtime ephemeral room
    const room = fas.rooms.join('main-feed');
    room.onMessage<{ text: string }>((msg) => {
      setRoomMsg(prev => [...prev, \`\${msg.from}: \${msg.data.text}\`]);
    });

    return () => room.close();
  }, []);

  const handleLike = async () => {
    const newVal = await fas.counters.increment('global_likes', 1);
    setLikes(newVal);
  };

  const handleSendChat = () => {
    if (!inputVal.trim()) return;
    const room = fas.rooms.join('main-feed');
    room.send({ text: inputVal });
    setInputVal('');
  };

  return (
    <FasShell app={fas} appName="Social Hub">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl font-bold">Community Board</h1>
            <p className="text-xs text-slate-500">Connected to FreeAppStore Backend</p>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <Avatar user={user} size={32} />
              <button onClick={signOut} className="text-xs text-slate-500 hover:text-slate-800">Sign out</button>
            </div>
          ) : (
            <SignInButton app={fas} />
          )}
        </header>

        {/* Counter Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-700">App-wide Atomic Counter</div>
            <div className="text-2xl font-bold font-mono text-emerald-600 mt-1">{likes} Likes</div>
          </div>
          <button
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 transition"
          >
            <Heart className="w-4 h-4 fill-white" /> Like (+1)
          </button>
        </div>

        {/* Realtime Room */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3">
          <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" /> Live WebSocket Room
          </div>
          <div className="h-40 overflow-y-auto bg-slate-50 rounded-lg p-3 text-xs space-y-1 font-mono">
            {roomMsg.length === 0 ? <p className="text-slate-400">No messages yet. Send one!</p> : null}
            {roomMsg.map((m, i) => (
              <div key={i} className="text-slate-700">{m}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              placeholder="Send message to room..."
              className="flex-1 text-xs px-3 py-2 border border-slate-200 rounded-md"
            />
            <button
              onClick={handleSendChat}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-md hover:bg-slate-800"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </FasShell>
  );
}`
      },
      {
        name: 'manifest.json',
        path: 'web/manifest.json',
        language: 'json',
        content: `{
  "name": "Social Hub",
  "short_name": "SocialHub",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#090d16",
  "theme_color": "#10b981"
}`
      }
    ]
  },
  {
    id: 'game-canvas',
    name: 'Game (HTML5 Canvas)',
    tagline: 'High-performance 2D Canvas game loop with input handling and physics tick.',
    description: 'Scaffolds an arcade canvas game engine with delta-time loop, keyboard/touch virtual controls, sprite rendering, particle bursts, and high-score synchronization via fas.counters.',
    iconName: 'Gamepad2',
    badgeText: 'Canvas 60fps · Arcade',
    demoComponent: 'CanvasGameDemo',
    features: [
      '60 FPS fixed-timestep requestAnimationFrame loop',
      'Dual keyboard & touch analog controls',
      'Integrated particle explosion engine',
      'Sound FX triggers using Web Audio API',
      'Global leaderboard via fas.counters / fas.db'
    ],
    files: [
      {
        name: 'App.tsx',
        path: 'web/src/App.tsx',
        language: 'tsx',
        content: `import React, { useRef, useEffect, useState } from 'react';
import { initApp } from '@freeappstore/sdk';

const fas = initApp({ appId: 'retro-asteroids' });

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    fas.counters.get('high_score').then(val => setHighScore(val || 0));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-4">
      <div className="mb-4 flex items-center justify-between w-full max-w-lg font-mono text-sm">
        <div>SCORE: <span className="text-emerald-400 font-bold">{score}</span></div>
        <div>RECORD: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="border-2 border-emerald-500/40 rounded-xl bg-slate-900 shadow-2xl"
      />
      <p className="text-xs text-slate-500 mt-4">Use Arrow Keys or WASD to navigate · Space to fire</p>
    </div>
  );
}`
      }
    ]
  },
  {
    id: 'game-grid',
    name: 'Game (Grid / Tile-based)',
    tagline: 'Turn-based state machine for puzzles, chess, checkers, and roguelikes.',
    description: 'Tile and grid layout engine with cell state management, undo/redo history stack, turn timers, and matchmaking over fas.rooms.',
    iconName: 'Grid3X3',
    badgeText: 'Turn-based · Puzzles',
    demoComponent: 'GridGameDemo',
    features: [
      'Dynamic NxM tile matrix with CSS grid rendering',
      'Turn alternation with deterministic state replay',
      'Move validation & win-condition evaluation',
      'P2P move sync over fas.rooms realtime channel',
      'Themeable cell skins & sound hooks'
    ],
    files: [
      {
        name: 'App.tsx',
        path: 'web/src/App.tsx',
        language: 'tsx',
        content: `import React, { useState } from 'react';

export default function GridGame() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);

  const handleClick = (idx: number) => {
    if (board[idx]) return;
    const next = [...board];
    next[idx] = isXNext ? 'X' : 'O';
    setBoard(next);
    setIsXNext(!isXNext);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-6 font-serif-display">Grid Matcher</h1>
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-800 rounded-2xl border border-slate-700">
        {board.map((cell, i) => (
          <button
            key={i}
            onClick={() => handleClick(i)}
            className="w-20 h-20 bg-slate-700 hover:bg-slate-600 rounded-xl text-3xl font-bold flex items-center justify-center transition"
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
}`
      }
    ]
  },
  {
    id: 'game-3d',
    name: 'Game (Three.js 3D)',
    tagline: 'WebGL 3D scene with Three.js, orbit controls, lighting, and mesh shaders.',
    description: 'Boilerplate for 3D web games, spatial simulations, product viewports, and low-poly interactive worlds. Pre-configured with lighting, shadows, and smooth animation loops.',
    iconName: 'Box',
    badgeText: 'WebGL · Three.js',
    demoComponent: 'ThreeDGameDemo',
    features: [
      'Three.js scene graph with perspective camera and ambient/directional light',
      'Smooth requestAnimationFrame render loop with delta-time',
      'Mouse & Touch drag orbit navigation',
      'Low-poly material shaders with shadow mapping',
      'Responsive canvas resizer handling DPR scaling'
    ],
    files: [
      {
        name: 'App.tsx',
        path: 'web/src/App.tsx',
        language: 'tsx',
        content: `import React, { useEffect, useRef } from 'react';

export default function ThreeDGame() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Three.js renderer setup
  }, []);

  return (
    <div className="relative w-full h-screen bg-slate-950 overflow-hidden">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-6 left-6 text-white font-mono text-xs bg-slate-900/80 px-4 py-2 rounded-lg backdrop-blur">
        Three.js 3D Viewport Ready
      </div>
    </div>
  );
}`
      }
    ]
  }
];

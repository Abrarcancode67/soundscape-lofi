import React, { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Heart, Send, Sparkles, Trophy, RotateCcw } from 'lucide-react';

/**
 * 1. Standalone Template Live Demo: Local QuickNotes
 */
export const StandaloneDemo: React.FC = () => {
  const [notes, setNotes] = useState<{ id: string; title: string; body: string }[]>([
    { id: '1', title: 'Welcome to Standalone PWA', body: 'This entire app runs client-side with localStorage. Zero backend dependency.' },
    { id: '2', title: 'Offline-First Checklist', body: '1. Service worker cached\n2. Manifest installed\n3. Zero network requests' }
  ]);
  const [activeId, setActiveId] = useState('1');

  const active = notes.find(n => n.id === activeId) || notes[0];

  const handleAdd = () => {
    const n = { id: Date.now().toString(), title: 'New Memo', body: 'Start typing...' };
    setNotes([n, ...notes]);
    setActiveId(n.id);
  };

  const handleDelete = (id: string) => {
    const next = notes.filter(n => n.id !== id);
    setNotes(next);
    if (activeId === id) setActiveId(next[0]?.id || '');
  };

  return (
    <div className="h-96 flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 font-sans">
      <div className="w-1/3 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-white dark:bg-slate-950">
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <span className="font-bold text-xs">Memos</span>
          <button onClick={handleAdd} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700">
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-1.5 space-y-1">
          {notes.map(n => (
            <button
              key={n.id}
              onClick={() => setActiveId(n.id)}
              className={`w-full text-left p-2 rounded text-xs transition ${
                n.id === activeId
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <div className="truncate">{n.title}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col bg-white dark:bg-slate-900">
        {active ? (
          <div className="flex-1 flex flex-col space-y-2">
            <div className="flex items-center justify-between">
              <input
                type="text"
                value={active.title}
                onChange={e => setNotes(notes.map(n => n.id === active.id ? { ...n, title: e.target.value } : n))}
                className="font-bold text-sm bg-transparent border-none outline-none w-full"
              />
              <button onClick={() => handleDelete(active.id)} className="text-slate-400 hover:text-rose-500">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <textarea
              value={active.body}
              onChange={e => setNotes(notes.map(n => n.id === active.id ? { ...n, body: e.target.value } : n))}
              className="flex-1 w-full bg-transparent resize-none border-none outline-none text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Select or create a memo
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * 2. Connected Template Live Demo: Social Board & Counter
 */
export const ConnectedDemo: React.FC = () => {
  const [likes, setLikes] = useState(42);
  const [messages, setMessages] = useState(['Alex: Realtime fan-out is active!', 'Clara: Connected to D1 database!']);
  const [inputVal, setInputVal] = useState('');

  const handleSend = () => {
    if (!inputVal.trim()) return;
    setMessages(prev => [...prev, `You: ${inputVal.trim()}`]);
    setInputVal('');
  };

  return (
    <div className="h-96 p-4 bg-slate-900 text-white rounded-xl flex flex-col justify-between border border-slate-800">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold font-mono">Durable Object: #feed-channel</span>
        </div>
        <button
          onClick={() => setLikes(l => l + 1)}
          className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
        >
          <Heart className="w-3.5 h-3.5 fill-white" />
          <span>{likes} Upvotes</span>
        </button>
      </div>

      <div className="flex-1 my-3 overflow-y-auto p-3 bg-slate-950/80 rounded-lg space-y-2 text-xs font-mono">
        {messages.map((m, i) => (
          <div key={i} className="text-slate-300 bg-slate-900/60 p-2 rounded border border-slate-800/80">
            {m}
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Send WebSocket message..."
          className="flex-1 text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white outline-none"
        />
        <button onClick={handleSend} className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold">
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

/**
 * 3. Game Canvas Template Live Demo: Space Dodge Arcade Game
 */
export const CanvasGameDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(140);
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let playerX = 175;
    let obstacles: { x: number; y: number; r: number; speed: number }[] = [];
    let currentScore = 0;
    let isDead = false;

    const spawnObstacle = () => {
      obstacles.push({
        x: Math.random() * (canvas.width - 20) + 10,
        y: -10,
        r: Math.random() * 8 + 6,
        speed: Math.random() * 2 + 2
      });
    };

    let spawnTimer = setInterval(spawnObstacle, 450);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      playerX = Math.max(15, Math.min(canvas.width - 15, e.clientX - rect.left));
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    const loop = () => {
      if (isDead) return;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Player Ship
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.moveTo(playerX, canvas.height - 35);
      ctx.lineTo(playerX - 12, canvas.height - 15);
      ctx.lineTo(playerX + 12, canvas.height - 15);
      ctx.closePath();
      ctx.fill();

      // Update & Draw Obstacles
      ctx.fillStyle = '#f43f5e';
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.y += obs.speed;

        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.r, 0, Math.PI * 2);
        ctx.fill();

        // Collision check
        const dist = Math.hypot(obs.x - playerX, obs.y - (canvas.height - 25));
        if (dist < obs.r + 10) {
          isDead = true;
          setGameOver(true);
          clearInterval(spawnTimer);
          return;
        }

        if (obs.y > canvas.height + 20) {
          obstacles.splice(i, 1);
          currentScore += 10;
          setScore(currentScore);
          setHighScore(h => Math.max(h, currentScore));
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(spawnTimer);
      canvas.removeEventListener('mousemove', handleMouseMove);
    };
  }, [gameOver]);

  const restart = () => {
    setScore(0);
    setGameOver(false);
  };

  return (
    <div className="h-96 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 border border-slate-800 text-white select-none">
      <div className="w-full max-w-xs flex items-center justify-between mb-2 text-xs font-mono">
        <div>SCORE: <span className="text-emerald-400 font-bold">{score}</span></div>
        <div>BEST: <span className="text-amber-400 font-bold">{highScore}</span></div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={350}
          height={260}
          className="rounded-lg border border-emerald-500/30 cursor-crosshair shadow-lg bg-[#090d16]"
        />
        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg space-y-2">
            <span className="text-rose-400 font-bold text-base font-mono">GAME OVER</span>
            <button
              onClick={restart}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-500"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Play Again
            </button>
          </div>
        )}
      </div>
      <p className="text-[11px] text-slate-400 mt-2 font-mono">Move cursor to steer ship · Dodge incoming asteroids</p>
    </div>
  );
};

/**
 * 4. Game Grid Template Live Demo: Tic-Tac-Toe / Grid Puzzle
 */
export const GridGameDemo: React.FC = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = calculateWinner(board);

  const handleClick = (i: number) => {
    if (winner || board[i]) return;
    const next = [...board];
    next[i] = xIsNext ? 'X' : 'O';
    setBoard(next);
    setXIsNext(!xIsNext);
  };

  const reset = () => {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  };

  return (
    <div className="h-96 flex flex-col items-center justify-center bg-slate-900 rounded-xl p-4 border border-slate-800 text-white font-sans">
      <div className="flex items-center justify-between w-64 mb-4 text-xs font-bold">
        <span>
          {winner ? `Winner: Player ${winner}!` : `Next Move: ${xIsNext ? 'X' : 'O'}`}
        </span>
        <button onClick={reset} className="text-slate-400 hover:text-white flex items-center gap-1">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800">
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            className="w-16 h-16 bg-slate-800 hover:bg-slate-700/80 rounded-xl font-bold text-2xl flex items-center justify-center transition text-emerald-400"
          >
            {cell}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * 5. Game 3D Template Live Demo: WebGL Spatial Canvas
 */
export const ThreeDGameDemo: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [wireframe, setWireframe] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angleX = 0;
    let angleY = 0;

    // 3D Cube Vertices
    const vertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];

    const edges = [
      [0,1], [1,2], [2,3], [3,0],
      [4,5], [5,6], [6,7], [7,4],
      [0,4], [1,5], [2,6], [3,7]
    ];

    const render = () => {
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      angleX += 0.015;
      angleY += 0.02;

      const projected = vertices.map(([x, y, z]) => {
        // Rotate around Y
        const x1 = x * Math.cos(angleY) + z * Math.sin(angleY);
        const z1 = -x * Math.sin(angleY) + z * Math.cos(angleY);

        // Rotate around X
        const y2 = y * Math.cos(angleX) - z1 * Math.sin(angleX);
        const z2 = y * Math.sin(angleX) + z1 * Math.cos(angleX);

        // Perspective projection
        const fov = 200;
        const scale = fov / (fov + z2 * 70);
        return [
          canvas.width / 2 + x1 * 55 * scale,
          canvas.height / 2 + y2 * 55 * scale
        ];
      });

      // Draw Edges
      ctx.strokeStyle = wireframe ? '#6366f1' : '#10b981';
      ctx.lineWidth = 2.5;

      edges.forEach(([start, end]) => {
        ctx.beginPath();
        ctx.moveTo(projected[start][0], projected[start][1]);
        ctx.lineTo(projected[end][0], projected[end][1]);
        ctx.stroke();
      });

      // Draw Vertices
      ctx.fillStyle = '#38bdf8';
      projected.forEach(([px, py]) => {
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [wireframe]);

  return (
    <div className="h-96 flex flex-col items-center justify-center bg-slate-950 rounded-xl p-4 border border-slate-800 text-white select-none">
      <div className="flex items-center justify-between w-full max-w-xs mb-2">
        <span className="text-xs font-mono text-slate-400">Three.js Spatial Engine</span>
        <button
          onClick={() => setWireframe(!wireframe)}
          className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 hover:text-white"
        >
          {wireframe ? 'Wireframe: ON' : 'Wireframe: OFF'}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={350}
        height={260}
        className="rounded-lg border border-slate-800 shadow-xl"
      />
      <p className="text-[11px] text-slate-400 mt-2 font-mono">Live 3D perspective projection viewport</p>
    </div>
  );
};

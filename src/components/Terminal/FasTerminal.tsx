import React, { useState, useRef, useEffect } from 'react';
import { fasSdk } from '../../services/fasSdk';
import { ScreenCheckModal } from './ScreenCheckModal';
import { 
  Terminal, 
  Send, 
  Trash2, 
  Cpu, 
  Play, 
  CheckCircle2, 
  Smartphone, 
  Layers, 
  HelpCircle 
} from 'lucide-react';

interface TerminalOutput {
  id: string;
  type: 'input' | 'output' | 'error' | 'success' | 'system';
  text: string;
}

export const FasTerminal: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<TerminalOutput[]>([
    { id: '1', type: 'system', text: 'FreeAppStore CLI v1.8.4 (@freeappstore/cli)' },
    { id: '2', type: 'system', text: 'Type "help" to list commands or "fas doctor" to test system readiness.' }
  ]);
  const [screenCheckOpen, setScreenCheckOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const executeCommand = (cmdStr: string) => {
    const trimmed = cmdStr.trim();
    if (!trimmed) return;

    // Add input line
    const inputEntry: TerminalOutput = {
      id: Date.now().toString(),
      type: 'input',
      text: `$ ${trimmed}`
    };

    const parts = trimmed.split(' ');
    const main = parts[0];
    const sub = parts[1];

    let outputTexts: { type: 'output' | 'error' | 'success' | 'system'; text: string }[] = [];

    if (trimmed === 'clear') {
      setHistory([]);
      return;
    } else if (trimmed === 'help') {
      outputTexts.push({
        type: 'system',
        text: `Available commands:
  fas login               Sign in with GitHub (device-flow auth)
  fas whoami              Print current GitHub login & session token
  fas doctor              System health check (Node 22, Git, D1 API)
  fas init <id>           Scaffold a new app from official templates
  fas check               Run 6 compliance checks (trackers, fonts, PWA)
  fas publish             Provision repo, D1 hosting route, and deploy
  fas list                List your published apps
  fas logs <id>           Show recent GitHub Actions deploy runs
  fas screencheck         Responsive layout test across viewports
  fas quality [id]        VCQA code quality audit report
  fas secret list         List encrypted developer secrets
  fas proxy list          List URL allowlist and injection rules
  clear                   Clear terminal history`
      });
    } else if (trimmed === 'fas login') {
      outputTexts.push(
        { type: 'output', text: 'Initiating GitHub device-authorization flow...' },
        { type: 'system', text: 'Open https://github.com/login/device and enter code: FAS-7492-XQ' },
        { type: 'output', text: 'Polling for token exchange...' },
        { type: 'success', text: `Success! Authenticated as ${fasSdk.getUser()?.login || 'developer'}. Cached at ~/.fas/config.json (mode 0600)` }
      );
    } else if (trimmed === 'fas whoami') {
      const u = fasSdk.getUser();
      outputTexts.push({
        type: 'output',
        text: `Login:    ${u?.login || 'guest'}\nAppId:    ${fasSdk.getAppId()}\nToken:    ${u?.token || 'None'}\nConfig:   ~/.fas/config.json`
      });
    } else if (trimmed === 'fas doctor') {
      outputTexts.push(
        { type: 'system', text: 'FreeAppStore Doctor — Environment Check:' },
        { type: 'success', text: '  ✓ Node.js: v22.14.0 (supported >=22)' },
        { type: 'success', text: '  ✓ Package Manager: pnpm v9.15.4' },
        { type: 'success', text: '  ✓ Git: installed and git-lfs ready' },
        { type: 'success', text: '  ✓ Auth: valid session in ~/.fas/config.json' },
        { type: 'success', text: '  ✓ Platform API: https://api.freeappstore.online (200 OK, 18ms)' },
        { type: 'output', text: 'All systems operational. Ready to scaffold and publish.' }
      );
    } else if (main === 'fas' && sub === 'init') {
      const appName = parts[2] || 'my-cool-app';
      outputTexts.push(
        { type: 'output', text: `Scaffolding FreeAppStore project: ${appName}...` },
        { type: 'success', text: `✓ Created directory ./${appName}` },
        { type: 'success', text: '✓ Injected web/src/App.tsx, web/manifest.json, and package.json' },
        { type: 'success', text: '✓ Injected .github/workflows/deploy.yml' },
        { type: 'output', text: `Next steps:\n  cd ${appName}\n  pnpm install && pnpm dev\nYour app will run at http://localhost:5173` }
      );
    } else if (trimmed === 'fas check') {
      outputTexts.push(
        { type: 'system', text: 'Running FreeAppStore compliance verification suite...' },
        { type: 'success', text: '  ✓ No template placeholders (0 APPNAME strings)' },
        { type: 'success', text: '  ✓ No tracking SDKs (0 trackers detected)' },
        { type: 'success', text: '  ✓ Brand fonts present (Manrope + Fraunces referenced)' },
        { type: 'success', text: '  ✓ No brand token overrides (--accent only)' },
        { type: 'success', text: '  ✓ PWA manifest valid (standalone display configured)' },
        { type: 'success', text: '  ✓ Bundle size: 84.5KB gzipped (< 300KB limit)' },
        { type: 'success', text: 'Result: 100% PASS. Ready for fas publish.' }
      );
    } else if (trimmed === 'fas publish') {
      outputTexts.push(
        { type: 'system', text: 'Provisioning FreeAppStore hosting and storefront route...' },
        { type: 'output', text: '  [1/4] Running pre-publish compliance gate... PASS' },
        { type: 'output', text: '  [2/4] Provisioning repo: github.com/freeappstore-online/my-cool-app' },
        { type: 'output', text: '  [3/4] Registering Cloudflare D1 route: my-cool-app.freeappstore.online' },
        { type: 'output', text: '  [4/4] Injected .github/workflows/deploy.yml locally' },
        { type: 'success', text: '🚀 Published successfully!' },
        { type: 'output', text: 'Live URL:       https://my-cool-app.freeappstore.online\nStorefront:     https://freeappstore.online/app/my-cool-app\n\nRun "git push upstream main" to trigger auto-deploy (~30s build).' }
      );
    } else if (trimmed === 'fas list') {
      outputTexts.push({
        type: 'output',
        text: `ID              TYPE         STATUS   URL
────────────────────────────────────────────────────────────────
my-cool-app     connected    LIVE     https://my-cool-app.freeappstore.online
space-asteroids game-canvas  LIVE     https://space-asteroids.freeappstore.online
quick-notes     standalone   LIVE     https://quick-notes.freeappstore.online`
      });
    } else if (trimmed === 'fas screencheck') {
      setScreenCheckOpen(true);
      outputTexts.push({
        type: 'system',
        text: 'Launching headless viewport screencheck emulator (iPhone SE, iPhone 15, iPad Mini, Desktop)...'
      });
    } else if (trimmed === 'fas quality') {
      outputTexts.push({
        type: 'system',
        text: `VCQA Code Quality Audit (VibeCode Quality Assurance):
Score: 98/100 (Tier: Elite Production Grade)
  • Typography: Manrope + Fraunces 2-font discipline compliant
  • Metadata: Zero unboxed pills, clean typographic separators
  • Touch Targets: 44px mobile touch boundaries verified
  • Dark Mode: Contrast ratio 6.4:1 (WCAG AA)`
      });
    } else if (trimmed === 'fas secret list') {
      outputTexts.push({
        type: 'output',
        text: `CONFIGURED SECRETS (AES-256-GCM Envelope Encrypted):
  • OPENWEATHER_KEY (sk-abc123••••)
  • SPOTIFY_SECRET  (sec_••••••••)`
      });
    } else if (trimmed === 'fas proxy list') {
      outputTexts.push({
        type: 'output',
        text: `PROXY URL ALLOWLIST RULES:
  • https://api.openweathermap.org/ -> secret: OPENWEATHER_KEY, inject: query:appid
  • https://api.spotify.com/v1/     -> secret: SPOTIFY_SECRET,  inject: oauth2_cc`
      });
    } else {
      outputTexts.push({
        type: 'error',
        text: `Command not recognized: "${trimmed}". Type "help" to view available commands.`
      });
    }

    setHistory(prev => [
      ...prev,
      inputEntry,
      ...outputTexts.map(o => ({ id: Math.random().toString(), ...o }))
    ]);
    setInputVal('');
  };

  const handleMcpToolRun = (toolName: string) => {
    let mockResult = '';
    switch (toolName) {
      case 'create_app':
        mockResult = JSON.stringify({ ok: true, appId: 'retro-dodge', liveUrl: 'https://retro-dodge.freeappstore.online', template: 'game-canvas' }, null, 2);
        break;
      case 'deploy_status':
        mockResult = JSON.stringify({ runs: [{ id: 1042, status: 'completed', conclusion: 'success', duration: '28s', branch: 'main' }] }, null, 2);
        break;
      case 'app_info':
        mockResult = JSON.stringify({ appId: 'my-cool-app', status: 'healthy', visitsToday: 412, latencyMs: 24 }, null, 2);
        break;
      case 'platform_guide':
        mockResult = 'Retrieved SKILLS.md platform guide (24KB specification)';
        break;
      default:
        mockResult = JSON.stringify({ tool: toolName, status: 'success', timestamp: new Date().toISOString() }, null, 2);
    }

    setHistory(prev => [
      ...prev,
      { id: Date.now().toString(), type: 'input', text: `[MCP Remote]: ${toolName}()` },
      { id: (Date.now() + 1).toString(), type: 'output', text: mockResult }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-[var(--line)] gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--muted)] font-mono-code mb-1">
            <span>@freeappstore/cli · MCP Server (mcp.freeappstore.online)</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Terminal</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[var(--ink-strong)] tracking-tight font-serif-display">
            CLI & MCP Tool Runner
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-2xl">
            Execute real FreeAppStore CLI workflows, run multi-device responsive screenchecks, 
            and test Model Context Protocol (MCP) tools used by AI developer agents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setScreenCheckOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--panel)] border border-[var(--line)] text-xs font-semibold text-[var(--ink)] hover:bg-[var(--panel-secondary)] transition"
          >
            <Smartphone className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span>fas screencheck</span>
          </button>
        </div>
      </div>

      {/* Quick Click Badges */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[var(--muted)] text-[11px] font-mono-code shrink-0">Quick Run:</span>
        {['fas doctor', 'fas check', 'fas publish', 'fas list', 'fas quality', 'fas screencheck', 'help'].map(cmd => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            className="px-2.5 py-1 rounded-lg bg-[var(--panel)] hover:bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--ink)] font-mono-code text-[11px] shrink-0 transition"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal Viewport */}
      <div className="bg-[#090d16] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-mono-code text-xs">
        {/* Window Chrome Bar */}
        <div className="px-4 py-3 bg-[#0d1322] border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="ml-2 text-slate-300 font-bold">bash — fas interactive shell</span>
          </div>

          <button
            onClick={() => setHistory([])}
            className="text-slate-400 hover:text-white p-1"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* History Stream */}
        <div className="p-4 space-y-3 h-[420px] overflow-y-auto leading-relaxed">
          {history.map(item => (
            <div key={item.id} className="whitespace-pre-wrap">
              {item.type === 'input' && (
                <div className="text-emerald-400 font-bold">{item.text}</div>
              )}
              {item.type === 'system' && (
                <div className="text-slate-400">{item.text}</div>
              )}
              {item.type === 'success' && (
                <div className="text-emerald-300">{item.text}</div>
              )}
              {item.type === 'error' && (
                <div className="text-rose-400">{item.text}</div>
              )}
              {item.type === 'output' && (
                <div className="text-slate-200">{item.text}</div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Bar */}
        <div className="px-4 py-3 bg-[#0d1322] border-t border-slate-800 flex items-center gap-2">
          <span className="text-emerald-400 font-bold">fas $</span>
          <input
            type="text"
            placeholder="Type CLI command (e.g. fas check, fas publish, help)..."
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && executeCommand(inputVal)}
            className="flex-1 bg-transparent text-slate-100 outline-none border-none text-xs"
          />
          <button
            onClick={() => executeCommand(inputVal)}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold text-[11px]"
          >
            Run
          </button>
        </div>
      </div>

      {/* MCP Tools Inspector Section */}
      <div className="bg-[var(--panel)] border border-[var(--line)] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-[var(--line)] gap-2">
          <div>
            <h3 className="text-base font-bold text-[var(--ink-strong)] flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[var(--accent)]" />
              <span>Model Context Protocol (MCP) Remote Server</span>
            </h3>
            <p className="text-xs text-[var(--muted)] mt-0.5">
              Available at <code>https://mcp.freeappstore.online/mcp</code>. Test the 12 platform tools supported by Claude Code, Cursor, and Codex.
            </p>
          </div>
          <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-[var(--panel-secondary)] border border-[var(--line)] text-[var(--muted)]">
            12 Agent Tools
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            'create_app',
            'deploy_status',
            'app_info',
            'list_apps',
            'app_logs',
            'platform_guide'
          ].map(tool => (
            <button
              key={tool}
              onClick={() => handleMcpToolRun(tool)}
              className="p-2.5 rounded-xl border border-[var(--line)] bg-[var(--panel-secondary)] hover:border-[var(--accent)]/50 hover:bg-[var(--accent-soft)] text-xs font-mono-code text-[var(--ink)] font-semibold transition text-left flex flex-col justify-between"
            >
              <span className="truncate">{tool}()</span>
              <span className="text-[10px] text-[var(--muted)] mt-1">Execute →</span>
            </button>
          ))}
        </div>
      </div>

      {/* ScreenCheck Viewport Modal */}
      <ScreenCheckModal
        isOpen={screenCheckOpen}
        onClose={() => setScreenCheckOpen(false)}
        appName={fasSdk.getAppId()}
      />
    </div>
  );
};

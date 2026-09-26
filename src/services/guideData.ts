/**
 * Comprehensive FreeAppStore Platform Guide & SDK Reference Data
 * Grounded directly in the official platform specification
 */

export interface GuideSectionData {
  id: string;
  title: string;
  badge: string;
  description: string;
  subsections: {
    title: string;
    content: string;
    codeSnippet?: {
      language: string;
      code: string;
    };
    tip?: string;
  }[];
}

export const GUIDE_SECTIONS: GuideSectionData[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    badge: 'Quickstart',
    description: 'Scaffold, build, and publish a free app on FreeAppStore in under a minute.',
    subsections: [
      {
        title: 'Prerequisites & System Setup',
        content: 'To build and publish apps on FreeAppStore, you need Node.js 22+, pnpm (recommended) or npm, Git, and a free GitHub account.'
      },
      {
        title: 'Install the CLI',
        content: 'The official CLI is published globally on npm under @freeappstore/cli.',
        codeSnippet: {
          language: 'bash',
          code: 'npm i -g @freeappstore/cli'
        }
      },
      {
        title: 'Create and run your app',
        content: 'Log in with GitHub via device-flow authentication, initialize from a template, and start the development server.',
        codeSnippet: {
          language: 'bash',
          code: `# 1. Authenticate with GitHub
fas login

# 2. Scaffold from template
fas init my-cool-app

# 3. Enter directory and run
cd my-cool-app
pnpm install && pnpm dev`
        },
        tip: 'Your local app runs at http://localhost:5173. Edit web/src/App.tsx to build your app.'
      },
      {
        title: 'Available Templates',
        content: 'FreeAppStore provides 5 specialized starter templates for different app paradigms:\n• standalone: localStorage only, no backend dependency (default)\n• connected: uses platform SDK (auth, KV, rooms, counters, etc.)\n• game-canvas: HTML5 Canvas games (60fps render loop)\n• game-grid: grid/tile-based games (turn state, chess/puzzles)\n• game-3d: Three.js 3D games with lighting and camera controls',
        codeSnippet: {
          language: 'bash',
          code: `fas init my-app                          # default: standalone
fas init my-app --template connected     # uses platform backend (KV, rooms, etc.)
fas init asteroids --template game-canvas  # HTML5 canvas game
fas init chess --template game-grid        # grid-based game
fas init racing --template game-3d         # 3D game`
        }
      },
      {
        title: 'Run compliance checks & Publish',
        content: 'Before publishing, fas check verifies your app meets all platform standards (no trackers, brand fonts present, valid PWA manifest, <300KB bundle). Then fas publish provisions hosting, DNS, and storefront listing.',
        codeSnippet: {
          language: 'bash',
          code: `# Check compliance
fas check

# Publish to freeappstore.online
fas publish

# Push your code
git push upstream main`
        },
        tip: 'Your app is live at https://my-cool-app.freeappstore.online and listed on the storefront within ~30 seconds.'
      }
    ]
  },
  {
    id: 'sdk-reference',
    title: 'SDK Reference (@freeappstore/sdk)',
    badge: 'v0.14 Reference',
    description: 'Complete browser SDK API reference for auth, per-user KV, shared counters, collections, realtime rooms, proxy, and key vault.',
    subsections: [
      {
        title: 'Initialization',
        content: 'Install @freeappstore/sdk from npm and initialize with your unique appId. Call fas.auth.init() once at startup to capture OAuth redirects.',
        codeSnippet: {
          language: 'typescript',
          code: `import { initApp } from '@freeappstore/sdk';

const fas = initApp({ appId: 'my-cool-app' });
await fas.auth.init(); // capture OAuth callback — call once at app start`
        }
      },
      {
        title: 'Authentication (fas.auth)',
        content: 'OAuth via redirect. Supports GitHub, Google, Apple, and Email (magic link). Session persists in localStorage with 30-day HMAC token.',
        codeSnippet: {
          language: 'typescript',
          code: `fas.auth.user;                          // User | null
fas.auth.token;                         // string | null
fas.auth.signIn();                      // default: GitHub
fas.auth.signIn('google');              // Google OAuth
fas.auth.signIn('apple');               // Apple Sign In
fas.auth.signIn('email');               // prompts for email, sends magic link
fas.auth.signInWithEmail('user@x.com'); // send magic link directly
fas.auth.signOut();                     // clears local session
fas.auth.onChange(cb);                  // fires immediately + on change, returns Unsubscribe
fas.auth.setDateOfBirth('2000-01-15'); // set user date of birth`
        }
      },
      {
        title: 'Per-user KV (fas.kv)',
        content: 'Per-user, per-app key-value store scoped to (appId, userId) server-side on Cloudflare D1. Limits: 1MB per user, 100 keys, 64KB per value.',
        codeSnippet: {
          language: 'typescript',
          code: `await fas.kv.set('theme', { color: 'plum' });
const theme = await fas.kv.get<{ color: string }>('theme');
await fas.kv.delete('theme');

const allKeys = await fas.kv.list();
const noteKeys = await fas.kv.list({ prefix: 'note:' });
const notes = await fas.kv.getMany<Note>(noteKeys); // bulk fetch`
        }
      },
      {
        title: 'Shared Counters (fas.counters)',
        content: 'App-wide atomic counters. Anyone can read; authenticated users can increment or decrement. Limits: 1,000 counters per app, increment range -1,000 to +1,000 per call.',
        codeSnippet: {
          language: 'typescript',
          code: `const all = await fas.counters.list();           // { likes: 5, views: 100 }
const views = await fas.counters.get('views');   // 100
const newVal = await fas.counters.increment('likes');      // +1
const newVal2 = await fas.counters.increment('score', 10); // +10
await fas.counters.increment('lives', -1);                 // decrement`
        }
      },
      {
        title: 'Collections (fas.db)',
        content: 'Simple document store for public, queryable data. Writes require auth and set the document owner. Public reads with filtering, order, and pagination.',
        codeSnippet: {
          language: 'typescript',
          code: `const posts = fas.db.collection('posts');

// Create (auth required, you become owner)
const post = await posts.create({ title: 'Hello', body: '...' });

// Query (public read)
const { documents, total } = await posts.query({
  limit: 20,
  orderBy: 'created_at',
  order: 'desc',
  owner: userId,
});

// Update / Delete (owner only for writes)
await posts.update('doc-id', { title: 'Updated' });
await posts.delete('doc-id');`
        }
      },
      {
        title: 'Realtime Rooms (fas.rooms)',
        content: 'Durable-Object-backed WebSocket fan-out. Ephemeral: messages are not persisted. Limits: 32 peers/room, 100 msgs/sec/peer, 4KB/message, 64 rooms/app, 24h idle eviction.',
        codeSnippet: {
          language: 'typescript',
          code: `const room = fas.rooms.join('lobby');

room.onPeers((peers) => console.log('peers:', peers));
room.onMessage<{ text: string }>((msg) => {
  console.log(msg.from, msg.data.text);
});
room.onConnectionState((state) => console.log(state)); // 'connecting' | 'open' | 'closed' | 'error'

room.send({ text: 'hello' });
room.close();`
        }
      },
      {
        title: 'Secret-Injecting Proxy (fas.proxy)',
        content: 'Call third-party APIs without exposing keys to the browser. The developer registers secrets via CLI; the platform Worker decrypts and injects the key server-side.',
        codeSnippet: {
          language: 'typescript',
          code: `const res = await fas.proxy.fetch('api.openweathermap.org/data/2.5/weather?q=London');
const data = await res.json();`
        }
      },
      {
        title: 'User API Key Vault (fas.keys)',
        content: 'Users store their own API keys on the platform once (encrypted AES-256-GCM). Apps never see plaintext keys. Supported: OpenAI, Anthropic, Google AI, OpenRouter, Replicate, Stability AI, ElevenLabs, Stripe.',
        codeSnippet: {
          language: 'typescript',
          code: `const hasKey = await fas.keys.has('openai');
fas.keys.manage('openai');          // redirect to key management page
const keys = await fas.keys.status(); // check all configured providers`
        }
      },
      {
        title: 'React Hooks & UI Components',
        content: 'Import hooks from @freeappstore/sdk/hooks and zero-config components from @freeappstore/sdk/ui.',
        codeSnippet: {
          language: 'typescript',
          code: `import { useAuth, useTheme, useFriends, useVoiceInput } from '@freeappstore/sdk/hooks';
import { FasShell, Avatar, SignInButton, ThemeToggle, Card } from '@freeappstore/sdk/ui';

function App() {
  const { user, loading, signIn, signOut } = useAuth(fas);
  const { theme, preference, setPreference } = useTheme();

  return (
    <FasShell app={fas} appName="My App">
      <Card>
        {user ? <Avatar user={user} size={32} /> : <SignInButton app={fas} />}
      </Card>
    </FasShell>
  );
}`
        }
      }
    ]
  },
  {
    id: 'cli-reference',
    title: 'CLI Reference (@freeappstore/cli)',
    badge: 'Developer Tooling',
    description: 'Command-line tool for scaffolding, compliance checks, secrets management, and publishing.',
    subsections: [
      {
        title: 'Commands Overview',
        content: '• fas: interactive TUI\n• fas login: GitHub device-flow auth\n• fas logout: clear cached session\n• fas whoami: print current login\n• fas doctor: health check\n• fas init <id>: scaffold template\n• fas check: run compliance checks\n• fas publish: provision and publish\n• fas list: list published apps\n• fas logs <id>: view deploy logs\n• fas secret set/list/rm: manage API keys\n• fas proxy allow/list/deny: manage proxy allowlist\n• fas screencheck: responsive test across viewports\n• fas quality [id]: VCQA quality report'
      },
      {
        title: 'fas check (Compliance Gate)',
        content: 'Audits the current project directory before publication against 6 mandatory rules:\n1. No template placeholders: every APPNAME substituted\n2. No tracking SDKs: 8 known trackers blocked\n3. Brand fonts present: Manrope + Fraunces referenced\n4. No brand overrides: no redefined platform CSS tokens\n5. PWA manifest: valid manifest.json with name, display, start_url\n6. Bundle size: under 300KB gzipped',
        codeSnippet: {
          language: 'bash',
          code: 'fas check'
        }
      },
      {
        title: 'fas proxy & fas secret',
        content: 'Configure server-side encrypted secrets and URL proxy rules with query, header, bearer, or oauth2_cc injection.',
        codeSnippet: {
          language: 'bash',
          code: `# Store a secret
fas secret set OPENWEATHER_KEY sk-abc123

# Allow proxy URL with query parameter injection
fas proxy allow "https://api.openweathermap.org/" \\
  --secret OPENWEATHER_KEY --inject "query:appid"

# Allow bearer token injection
fas proxy allow "https://api.example.com/v1/" \\
  --secret EXAMPLE_TOKEN --inject bearer`
        }
      }
    ]
  },
  {
    id: 'publishing',
    title: 'Publishing & Hosting Architecture',
    badge: 'Path B Deploy',
    description: 'How apps transition from local machine to live yourapp.freeappstore.online hosting in ~30 seconds.',
    subsections: [
      {
        title: 'What fas publish does',
        content: '1. Compliance gate: runs fas check. Hard failures abort.\n2. Auth check: verifies 30-day session token.\n3. Provision: POSTs to platform API. Admin Worker creates an empty GitHub repo in freeappstore-online org, a D1 hosting route (subdomain -> R2 prefix), and storefront registry entry.\n4. Deploy workflow: injects .github/workflows/deploy.yml locally.\n5. Ownership: records app in platform DB.\n6. Output: prints live URL, repo URL, and git push commands.'
      },
      {
        title: 'Deploy Flow (Path B)',
        content: 'Apps deploy to Cloudflare R2 via GitHub Actions, not CF Pages:\n• git push triggers .github/workflows/deploy.yml\n• Builds app with pnpm build\n• Uploads web/dist/ to fas-apps R2 bucket under apps/<id>/\n• Host Worker (*.freeappstore.online) reads D1 routes table and streams from R2\n• Deploys take ~30 seconds.'
      }
    ]
  },
  {
    id: 'proxy-and-keys',
    title: 'Proxy & Keys Security Model',
    badge: 'Zero-Secret Leakage',
    description: 'Two separate systems for calling third-party APIs without exposing secrets in browser bundles.',
    subsections: [
      {
        title: 'App Secret Proxy (fas.proxy)',
        content: 'For developer-owned API keys (weather, geocoding, maps). Developer stores key on platform; Worker decrypts and injects server-side into upstream request. Keys are encrypted at rest with AES-256-GCM envelope encryption. Daily request cap: 10,000/day.'
      },
      {
        title: 'User API Key Vault (fas.keys)',
        content: 'For end-user-owned keys (OpenAI, Anthropic, Gemini, OpenRouter). Users store keys on platform once; apps request access without seeing plaintext. Supported: OpenAI, Anthropic, Google AI, OpenRouter, Replicate, Stability AI, ElevenLabs, Stripe.'
      },
      {
        title: 'Free APIs (No Proxy Needed)',
        content: 'Prefer free, unauthenticated APIs first:\n• Maps: Leaflet, OpenStreetMap\n• Charts: Recharts\n• Weather: Open-Meteo\n• Geocoding: Nominatim\n• Routing: OSRM\n• Countries: REST Countries\n• Icons: Lucide React\n• Animation: Motion\n• Forms: React Hook Form\n• State: Zustand'
      }
    ]
  },
  {
    id: 'platform-limits',
    title: 'Platform Limits & Quotas',
    badge: 'Server-Enforced Quotas',
    description: 'Conservative server-enforced quotas for the free tier and breach HTTP status codes.',
    subsections: [
      {
        title: 'Limits Matrix',
        content: '• Auth: 30-day session lifetime (HMAC-signed bearer token)\n• Per-user KV: 64KB max value (413), 100 max keys (413), 1MB total per user (413)\n• Shared Counters: 1,000 counters/app, -1000 to +1000 increment range\n• Collections: 10,000 documents/collection, 64KB document size\n• Realtime Rooms: 32 peers/room (503 room full), 100 msgs/sec/peer, 4KB/message, 64 rooms/app, 24h idle eviction\n• App Secret Proxy: 5 secrets, 5 allowlist rules, 10,000 reqs/day (429), 100KB req/resp\n• User Key Vault: 8 providers, 1 key per provider, 500 chars max\n• Email: 100 emails/day per app\n• Webhooks: 5 webhooks/app, HMAC-SHA256 signing'
      },
      {
        title: 'What FAS does NOT support',
        content: 'These features require ProAppStore:\n• File uploads / direct user R2 storage\n• Server-side AI (Workers AI)\n• Cron / scheduled background tasks\n• Custom domains\n• Monetization (Stripe + creator payouts)\n• Server-side compute (per-app custom Worker + D1)'
      }
    ]
  },
  {
    id: 'mcp-server',
    title: 'MCP Server (AI Agent Integration)',
    badge: 'Model Context Protocol',
    description: 'Connect AI agents (Claude Code, Cursor, Codex) to FreeAppStore via mcp.freeappstore.online/mcp.',
    subsections: [
      {
        title: 'Setup for Claude, Cursor, and Codex',
        content: 'Add the remote MCP server endpoint to your agent configuration:',
        codeSnippet: {
          language: 'bash',
          code: `# Claude Code
claude mcp add freeappstore -- npx mcp-remote https://mcp.freeappstore.online/mcp

# Codex
codex mcp add freeappstore --url https://mcp.freeappstore.online/mcp

# Project-local .mcp.json
{
  "mcpServers": {
    "freeappstore": {
      "command": "npx",
      "args": ["mcp-remote", "https://mcp.freeappstore.online/mcp"]
    }
  }
}`
        }
      },
      {
        title: 'The 12 Official MCP Tools',
        content: '• Build tools (auth required): create_app, update_files\n• Agent tools (auth + vaulted AI key): agent_build, agent_status\n• Read tools (public): list_files, read_file\n• Inspect tools: list_apps (FAS token), app_info, deploy_status, app_logs (owner), platform_guide, sdk_reference'
      },
      {
        title: 'VibeCode Recipe',
        content: '"Build me a pomodoro timer and deploy it as pomodoro."\nTool flow: agent_build -> agent_status (poll until live URL is ready at pomodoro.freeappstore.online).'
      }
    ]
  }
];

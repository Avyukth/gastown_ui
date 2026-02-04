# Gastown UI

[![Contract Tests](https://github.com/Avyukth/gastown_ui/actions/workflows/contract-tests.yml/badge.svg)](https://github.com/Avyukth/gastown_ui/actions/workflows/contract-tests.yml)

Operator console for [Gas Town](https://github.com/steveyegge/gastown) multi-agent orchestration system. This dashboard provides real-time visibility into agents, workflows, merge queues, and system health.

## Features

- **Dashboard** - Overview with agent counts, rig status, and quick actions
- **Agents** - Monitor Mayor, Deacon, Witness, Refinery, and Polecat agents with detail views
- **Work** - Browse and filter beads (issues) by type, status, and priority
- **Queue** - Merge queue for each rig with status tracking
- **Mail** - Agent mailbox system with compose and inbox views
- **Escalations** - Decision requests, merge conflicts, and critical failures requiring attention
- **Convoys** - Track batched work across multiple rigs
- **Workflows** - Molecule and formula management for orchestrated processes
- **Rigs** - Project container management with polecat/crew counts
- **Health** - System health dashboard with daemon heartbeat and rig status
- **Watchdog** - Three-tier monitoring chain (Daemon, Boot, Deacon)
- **Activity** - Real-time event feed with filtering

## Tech Stack

- **Framework**: SvelteKit 2.x + Vite 6.x
- **Styling**: Tailwind CSS + tailwind-variants
- **Icons**: lucide-svelte
- **Validation**: Zod schemas for CLI output parsing
- **Runtime**: Bun (preferred) or Node.js 18+

## Architecture

### CLI Integration

The UI communicates with Gas Town through two CLI tools:

| CLI | Purpose | Location |
|-----|---------|----------|
| `gt` | Town operations (status, mail, convoys, agents) | `~/go/bin/gt` |
| `bd` | Beads operations (issues, workflows, molecules) | `~/.local/bin/bd` |

### Server-Side Components

```
src/lib/server/
├── cli/
│   ├── process-supervisor.ts   # Safe CLI execution with circuit breaker
│   ├── contracts.ts            # Zod schemas for CLI output validation
│   ├── circuit-breaker.ts      # Failure protection
│   ├── concurrency-limiter.ts  # Request queuing (max 4 concurrent)
│   └── capabilities.ts         # CLI feature detection
├── gt.ts                       # Legacy gt command wrapper
├── cache/
│   └── swr.ts                  # Stale-while-revalidate caching
└── watch/
    └── beads-watcher.ts        # File system watchers for real-time updates
```

### ProcessSupervisor

The `ProcessSupervisor` provides safe, observable CLI execution:

- **No-shell execution** via `execFile` (security)
- **Configurable timeouts** per command (default 30s)
- **Concurrency limiting** (max 4 concurrent commands)
- **Circuit breaker** protection (opens after 5 failures, resets after 60s)
- **Request deduplication** for identical commands
- **Process tracking** with cleanup on destroy

### API Routes

```
/api/gastown/
├── status          # gt status --json
├── agents          # Agent list and details
├── agents/[id]     # Individual agent info
├── agents/[id]/logs
├── agents/[id]/reboot
├── mail            # gt mail inbox --json
├── mail/[id]       # Individual message
├── convoys         # gt convoy list --json
├── convoys/[id]    # Convoy details
├── queue           # gt mq list --json
├── rigs            # Rig management
├── health          # System health
├── workflows       # Molecule management
├── workflows/formulas
├── workflows/cook
├── workflows/pour
├── work/issues     # bd list --json
├── work/sling      # Work assignment
├── escalations/[id]/resolve
├── diagnostics     # Health check + circuit breaker reset
└── snapshot        # Full system snapshot
```

## Quickstart

### Prerequisites

- **Node.js 18+** or **Bun 1.1+**
- **Gas Town CLI** (`gt`) installed via `go install` or Homebrew
- **Beads CLI** (`bd`) installed in `~/.local/bin`
- A running Gas Town workspace

### Installation

```bash
# Clone and install
git clone https://github.com/Avyukth/gastown_ui.git
cd gastown_ui
bun install
```

### Configuration

Create `.env.local` with your Gas Town workspace path:

```bash
# Required: Path to your Gas Town workspace
GT_TOWN=/path/to/your/gt/workspace

# Optional: WebSocket URL for real-time updates
VITE_WS_URL=ws://localhost:8080/ws

# Optional: Enable mock API for development without Gas Town
VITE_MOCK_API=false
```

### Running

```bash
# Start development server
bun dev

# Or with explicit town path
GT_TOWN=/tmp/test-town bun dev --port 5174
```

Open `http://localhost:5173` (or the port shown in terminal).

### Build

```bash
bun run build
bun run preview
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GT_TOWN` | Yes | Path to Gas Town workspace directory |
| `VITE_WS_URL` | No | WebSocket URL for real-time updates |
| `VITE_MOCK_API` | No | Enable mock API (default: false) |

### CLI Path Requirements

The UI server needs access to both `gt` and `bd` CLIs. The ProcessSupervisor automatically prepends these paths:

```bash
~/.local/bin    # bd default install location
~/go/bin        # gt default install location (go install)
```

If CLIs are installed elsewhere, ensure they're in your PATH before starting the server.

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start local dev server |
| `build` | Production build |
| `preview` | Serve production build |
| `check` | SvelteKit sync + typecheck |
| `test` | Run Vitest tests |
| `test:coverage` | Run tests with coverage |
| `lint` | ESLint check |
| `format` | Prettier formatting |

## Project Structure

```
src/
├── lib/
│   ├── components/         # Reusable UI components
│   │   ├── core/          # Button, Badge, Input, etc.
│   │   ├── layout/        # DashboardLayout, Sidebar, PageHeader
│   │   └── domain/        # Agent cards, status indicators
│   ├── server/            # Server-side CLI integration
│   │   └── cli/           # ProcessSupervisor, contracts, validation
│   ├── stores/            # Client state (Svelte 5 runes)
│   ├── api/               # Client-side API utilities
│   └── utils/             # Logger, keyboard, gestures
├── routes/
│   ├── (app)/             # Main application routes
│   │   ├── +page.svelte           # Dashboard
│   │   ├── agents/                # Agent views
│   │   ├── work/                  # Issue browser
│   │   ├── queue/                 # Merge queue
│   │   ├── mail/                  # Mailbox
│   │   ├── escalations/           # Escalation management
│   │   ├── convoys/               # Convoy tracking
│   │   ├── workflows/             # Molecule/formula views
│   │   ├── rigs/                  # Rig management
│   │   ├── health/                # System health
│   │   ├── watchdog/              # Three-tier monitoring
│   │   └── activity/              # Event feed
│   ├── (auth)/            # Authentication routes
│   └── api/               # API endpoints
└── static/                # Static assets
```

## Design System

Semantic tokens in `src/app.css` following shadcn conventions:

### Colors
- **Core**: `--background`, `--foreground`, `--card`, `--muted`, `--border`
- **Status**: `--success`, `--warning`, `--info`, `--destructive`
- **Agent**: `--status-online`, `--status-offline`, `--status-pending`, `--status-idle`

### Typography
- **Body**: Inter
- **Headlines**: Space Grotesk
- **Code**: JetBrains Mono

### Utilities
- `.panel-glass` - Frosted glass effect
- `.touch-target` - 48px minimum touch targets
- `.stagger` - Staggered animations

## Component Library

70+ components in `src/lib/components/` using Svelte 5 runes and `tailwind-variants`:

| Category | Components |
|----------|------------|
| **Core** | Button, Badge, Input, Switch, Icon, Tooltip |
| **Layout** | DashboardLayout, PageHeader, SplitView, Sidebar |
| **Status** | StatusIndicator, ProgressBar, Toast, Alert |
| **Loading** | Skeleton, SkeletonGroup, NavigationLoader |
| **A11y** | Announcer, LiveRegion, SkipLink, KeyboardHelpDialog |
| **Mobile** | BottomNav, SwipeableItem, PullToRefresh, OfflineIndicator |

## Testing

### Policy

**Playwright is not used.** All UI verification uses **Claude in Chrome** browser automation tools.

### Running Tests

```bash
# Unit tests (Vitest)
bun test

# With coverage
bun test:coverage

# Watch mode
bun test --watch
```

### E2E Testing

See `docs/E2E_TESTING_PLAN.md` for comprehensive testing strategy including:

- **Tier 0 (Smoke)**: HTTP 200 checks (zero cost)
- **Tier 1 (Integration)**: Data validation (zero cost)
- **Tier 2 (Full E2E)**: Browser testing with Claude in Chrome

## Security

Configured in `src/hooks.server.ts`:

- **CSP headers** (self + fonts.googleapis.com)
- **CSRF** double-submit cookie pattern
- **HttpOnly** auth cookies
- **Security headers** (X-Frame-Options, HSTS in production)

## Accessibility

- WCAG 2.5.5 AAA touch targets (48px min)
- Safe area insets for notched devices
- Screen reader live regions
- `prefers-reduced-motion` support

## Real-Time Updates

WebSocket client (`$lib/stores/websocket.svelte.ts`) with:

- Exponential backoff reconnection (1s base, 30s max, 20% jitter)
- Heartbeat/ping-pong (30s interval, 5s timeout)
- Browser online/offline event integration

## Troubleshooting

### Circuit Breaker Open

If CLI commands fail with "Circuit breaker is open - CLI is unavailable":

```bash
# Reset circuit breaker
curl "http://localhost:5174/api/gastown/diagnostics?reset-circuit=true"
```

### CLI Not Found

Verify CLIs are accessible:

```bash
which gt    # Should show ~/go/bin/gt or similar
which bd    # Should show ~/.local/bin/bd or similar
```

### Database Sync Issues

If beads commands fail with database errors:

```bash
cd $GT_TOWN
bd daemon stop
rm -f .beads/*.db .beads/*.db-*
bd init --prefix=<your-prefix>
bd sync --import-only
```

### Port Already in Use

The dev server auto-increments ports if the default is in use. Check terminal output for actual port:

```
VITE v6.4.1  ready in 817 ms
  ➜  Local:   http://localhost:5176/   <-- actual port
```

## Contributing

- Keep commit messages concise
- Avoid introducing new deps unless necessary
- Maintain accessibility and keyboard support
- Follow the testing policy (no Playwright)
- Prefer reusable components in `src/lib/components`

## Support This Project

If you find this project useful, consider supporting its development:

[![Donate with Razorpay](https://img.shields.io/badge/Donate-Razorpay-blue?style=for-the-badge&logo=razorpay)](https://razorpay.me/@pathshalainc)

## Related Projects

- [Gas Town](https://github.com/steveyegge/gastown) - Multi-agent orchestration system
- [Beads](https://github.com/steveyegge/beads) - Git-backed issue tracking

## License

MIT License - see LICENSE file for details

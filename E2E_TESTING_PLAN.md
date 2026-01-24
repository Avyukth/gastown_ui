# Gas Town UI E2E Testing Plan

> Comprehensive testing strategy for gastown_ui using beads-driven workflows

**Last Updated**: 2025-01-24
**Status**: ✅ All 12 pages passing (after ProcessSupervisor fix)
**Test Town**: `/tmp/test-town-1769271249` (prefix: `hq`)

---

## Overview

This plan outlines how to test all UI functionality in a temporary Gas Town environment
using real `gt` and `bd` commands. Tests are organized into **three tiers** based on
cost and coverage, following Gas Town best practices.

### Test Tiers (Cost vs Coverage)

| Tier | Name | Token Cost | Duration | Agent Usage | When to Run |
|------|------|------------|----------|-------------|-------------|
| **0** | Smoke | Zero | <30s | None | Every commit, CI |
| **1** | Integration | Zero | <2min | Degraded mode | PR checks, daily |
| **2** | Full E2E | ~1-2k tokens | <10min | 1 polecat max | Release, weekly |

**Strategy**: Run Tier 0/1 constantly (free). Run Tier 2 only when needed.

### Test Environment (Parameterized)

```bash
# Environment variables (customize as needed)
export TEST_TOWN="${TEST_TOWN:-/tmp/gt-test-$$}"
export GASTOWN_UI="${GASTOWN_UI:-$(pwd)}"
export TEST_RIG="${TEST_RIG:-testrig}"
export UI_PORT="${UI_PORT:-5174}"
export UI_URL="http://localhost:$UI_PORT"
```

```
Test Town: $TEST_TOWN
Rig:       $TEST_RIG (prefix: te-)
UI:        GT_TOWN=$TEST_TOWN bun dev --port $UI_PORT
URL:       $UI_URL
```

### CLI Paths (Important!)

```bash
# Verify CLI locations
which bd   # /Users/amrit/.local/bin/bd
which gt   # ~/go/bin/gt (may be aliased)

# For UI server, ensure PATH includes:
export PATH="/Users/amrit/.local/bin:/Users/amrit/go/bin:$PATH"
```

### Valid Issue Types

Only these types are valid for `bd create --type=`:
- `task` - General work items
- `bug` - Bug fixes
- `feature` - New features
- `epic` - Large work items
- `chore` - Maintenance tasks

**NOT valid:** `merge_request`, `convoy`, `agent` (these are created via `gt` commands)

### Polecat Management Commands

```bash
# Create polecats via sling (NOT gt polecat spawn)
gt sling <bead-id> <rig> --create    # Creates polecat and assigns work

# Session control (pause/resume without killing)
gt session stop <rig>/<polecat>      # Pause - agent waits for nudge
gt session start <rig>/<polecat>     # Resume - agent starts working

# Check polecat status
gt status --json | jq '.rigs[].agents[] | select(.role=="polecat")'
```

**Token Conservation**: Use `gt session stop` to pause polecats during debugging.
They remain running but wait for mayor nudge before consuming tokens.

### Creating Polecats via Sling

The correct workflow to spawn polecats and assign work:

```bash
# Step 1: Create a task bead (keep minimal!)
bd create --type=task --priority=1 --title="Short task name"

# Step 2: Sling to rig with --create flag (spawns polecat automatically)
gt sling <bead-id> <rig> --create

# This creates:
# - A new polecat (e.g., testrig/polecats/rust)
# - A convoy tracking the slung work
# - Assignment of bead to the new polecat
```

### Known Issues (RESOLVED)

#### Circuit Breaker / PATH Problem (FIXED 2025-01-24)

Previously, pages using `bd` commands failed with "Circuit breaker is open - CLI is unavailable".

**Root Cause**: ProcessSupervisor in `src/lib/server/cli/process-supervisor.ts` was not:
1. Including `~/.local/bin` and `~/go/bin` in PATH
2. Using `GT_TOWN` environment variable as cwd

**Fix Applied**: Added `getEnvWithPath()` and `getTownCwd()` functions to ProcessSupervisor.
Committed as `bb9ca56: fix: add PATH and GT_TOWN cwd to ProcessSupervisor`.

**All pages now work correctly.**

#### Circuit Breaker Reset (Debugging Aid)

If circuit breaker trips during development, reset it via:
```bash
curl "http://localhost:5176/api/gastown/diagnostics?reset-circuit=true"
```

---

## Phase 1: Environment Setup

### 1.1 Verify Test Town

```bash
# Set environment
export GT_TOWN=/tmp/test-town-1769271249
cd $GT_TOWN

# Verify daemon is running
gt status --json | jq .

# Check agents
gt status --json | jq '.agents[] | {name, role, running}'

# Verify rig
gt status --json | jq '.rigs[] | {name, polecat_count, has_witness, has_refinery}'
```

### 1.2 Start UI Server (Token-Efficient Mode)

**Recommended**: Pause the deacon before starting UI tests to prevent token drain:

```bash
# Terminal 1: Ensure daemon is paused for testing
cd $GT_TOWN
gt daemon start
gt deacon pause --reason="UI testing"

# Verify pause
gt deacon status  # Should show "paused: true"
```

```bash
# Terminal 2: Start UI server
cd /Users/amrit/Documents/Projects/Rust/mouchak/gastown_exp-stage/gastown_ui

# Ensure PATH includes bd and gt
export PATH="/Users/amrit/.local/bin:/Users/amrit/go/bin:$PATH"

GT_TOWN=/tmp/test-town-1769271249 bun dev --port 5174
```

### 1.3 Alternative: Degraded Mode (Zero Tokens - Tier 0/1)

For pure mechanical testing without any Claude calls:

```bash
# Start daemon in degraded mode
GT_DEGRADED=true gt daemon start

# All operations are mechanical - zero tokens consumed
# Useful for CI/CD pipeline validation
```

### 1.4 Health Check Gate (Run Before Tests)

**CRITICAL**: Always verify system health before running tests:

```bash
#!/bin/bash
# health-gate.sh - Run before any test tier

set -e

echo "=== Health Check Gate ==="

# Check 1: Daemon running
gt status --json | jq -e '.agents | length > 0' > /dev/null || {
  echo "FAIL: Daemon not running or no agents"
  exit 1
}
echo "✓ Daemon running"

# Check 2: UI server responding
curl -sf "$UI_URL/health" > /dev/null 2>&1 || curl -sf "$UI_URL" > /dev/null 2>&1 || {
  echo "FAIL: UI server not responding at $UI_URL"
  exit 1
}
echo "✓ UI server responding"

# Check 3: CLI tools available
which gt > /dev/null || { echo "FAIL: gt not in PATH"; exit 1; }
which bd > /dev/null || { echo "FAIL: bd not in PATH"; exit 1; }
echo "✓ CLI tools available"

# Check 4: Test rig exists
gt status --json | jq -e ".rigs[] | select(.name == \"$TEST_RIG\")" > /dev/null || {
  echo "FAIL: Test rig '$TEST_RIG' not found"
  exit 1
}
echo "✓ Test rig exists"

echo "=== Health Check PASSED ==="
```

### 1.5 Current Test Data (Already Available)

The test town has live data from running agents:

```bash
# Existing data summary
gt status --json | jq '.summary'
# Output: {rig_count: 1, polecat_count: 0, active_hooks: 2}

# Wisps from agent patrols (39+ beads)
bd list --json | jq 'length'

# Agent-created wisps (mol-witness-patrol, mol-deacon-patrol, etc.)
bd list | head -20
```

**Available for testing:**
- 4 agents: Mayor, Deacon, Witness, Refinery
- 1 rig: testrig (with witness + refinery)
- 39+ wisp beads from agent patrol cycles
- 1 closed digest bead (squashed patrol)
- Mail system (empty inbox initially)
- Escalations (none by default - agents don't create escalations in normal operation)

---

## Phase 2: Create Test Data with Beads

> **Note:** The beads daemon uses in-memory caching with JSONL export. Newly created
> beads may take a moment to sync. For testing, the existing wisp data is sufficient.

### 2.0 Fixtures System (Zero-Cost Data Seeding)

**Recommended**: Use pre-built fixtures instead of creating beads manually each time.

```bash
# Create fixtures directory
mkdir -p $TEST_TOWN/.beads/fixtures

# Save current test data as fixture
bd list --json > $TEST_TOWN/.beads/fixtures/e2e-base.json

# Load fixture (instant, zero tokens)
# Note: This requires the beads daemon to support fixture loading
# Alternatively, copy JSONL directly:
cp $TEST_TOWN/.beads/fixtures/e2e-base.jsonl $TEST_TOWN/.beads/issues.jsonl
bd sync  # Reload from disk
```

**Fixture Files to Create**:

| Fixture | Contents | Use Case |
|---------|----------|----------|
| `e2e-base.json` | 2 tasks, 1 bug, 1 feature | Basic page testing |
| `e2e-escalations.json` | 3 escalation beads | Escalations page |
| `e2e-empty.json` | No beads | Empty state testing |
| `e2e-large.json` | 50+ beads | Pagination/performance |

**Benefits**:
- Zero token cost (no agent interaction)
- Instant load (<1 second)
- Reproducible test state
- Can version control fixtures

### 2.1 Create Test Beads (Tasks)

These beads populate the Work page with various states:

```bash
cd $GT_TOWN

# Task 1: Open task (no assignee)
bd create --type=task --priority=2 \
  --title="[UI-TEST] Implement search feature" \
  --description="Add search functionality to agent list"

# Task 2: In-progress task (assigned)
bd create --type=task --priority=1 \
  --title="[UI-TEST] Fix pagination bug" \
  --description="Pagination breaks on empty pages" \
  --assignee=testrig/polecats/polecat-1

# Task 3: High priority bug
bd create --type=bug --priority=0 \
  --title="[UI-TEST] Critical: Memory leak in dashboard" \
  --description="Dashboard consumes memory on refresh"

# Task 4: Feature request
bd create --type=feature --priority=3 \
  --title="[UI-TEST] Add dark mode toggle" \
  --description="User preference for dark/light theme"
```

### 2.2 Create Escalation Beads

Escalations have the `escalation` label and appear in the Escalations page:

```bash
# Escalation 1: Merge conflict (HIGH severity)
bd create --type=bug --priority=1 \
  --title="[Merge Conflict] Branch polecat/test-auth conflicts with main" \
  --description="Automatic rebase failed. Manual intervention required." \
  --label=escalation

# Escalation 2: Decision required (MEDIUM severity)
bd create --type=task --priority=2 \
  --title="[Decision] API versioning strategy needed" \
  --description="Question: How should we version the API?
Options:
- URL path: Use /api/v1/resource pattern
- Header: Use Accept-Version header
- Query: Use ?version=1 parameter" \
  --label=escalation

# Escalation 3: Critical failure (CRITICAL severity)
bd create --type=bug --priority=0 \
  --title="[Failure] Tests failing on main branch" \
  --description="CI pipeline broken. Blocking all merges." \
  --label=escalation
```

### 2.3 Create Polecats with Work (via Sling)

**IMPORTANT**: Start with 1-2 polecats MAXIMUM. Each polecat costs ~500-1000
tokens to initialize. Only create more if specifically testing multi-polecat features.

```bash
# FIRST: Pause deacon to prevent token drain after polecat starts
gt deacon pause --reason="testing"

# Create ONE task bead (keep title minimal)
bd create --type=task --priority=1 --title="Test task"
# Note the bead ID from output, e.g., hq-xyz

# Sling to rig - creates ONE polecat + convoy automatically
gt sling hq-xyz testrig --create   # Creates polecat (e.g., "rust")

# Polecat initializes then idles (deacon is paused = no work assigned)
# Verify it's running but idle:
gt status --json | jq '.rigs[].agents[] | select(.role=="polecat")'
# Should show: running: true, has_work: false

# OPTIONAL: Only if testing multiple polecats
bd create --type=bug --priority=0 --title="Test bug"
gt sling hq-abc testrig --create   # Creates second polecat
```

**Note**: `merge_request` is NOT a valid bead type. Merge requests are tracked
via the `gt mq` (merge queue) commands, not `bd create`.

### 2.4 Create Convoy for Parallel Work

Convoys track related work items together. They're auto-created when slinging,
but you can also create them manually:

```bash
# Create convoy (no --description flag)
gt convoy create "UI Testing Sprint"

# Get convoy ID (capture from output)
CONVOY_ID=$(gt convoy list --json | jq -r '.[0].id')

# Track beads in convoy (use actual bead IDs from bd list)
bd list --json | jq -r '.[0:3] | .[].id' | while read id; do
  gt convoy track $CONVOY_ID $id
done

# Check convoy status
gt convoy status $CONVOY_ID --json
```

---

## Phase 3: Test Scenarios by Page

### 3.1 Dashboard Tests (`/`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| D-01 | Stats display | Navigate to `/` | Shows agent count, rig count, bead count |
| D-02 | Agent status | Check agent cards | All 4 agents shown (Mayor, Deacon, Witness, Refinery) |
| D-03 | Quick actions | Verify action buttons | Compose mail, view work queue buttons present |
| D-04 | Error state | Stop daemon, refresh | Graceful error message displayed |

**Verification Commands:**
```bash
# Get expected counts
gt status --json | jq '.summary'
bd list --json | jq 'length'
```

### 3.2 Agents Page (`/agents`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| A-01 | Agent list | Navigate to `/agents` | All agents listed with status indicators |
| A-02 | Agent detail | Click on Mayor | Shows `/agents/mayor` with details |
| A-03 | Running state | Check status badges | Green = running, gray = idle |
| A-04 | Role icons | Verify role display | Correct icons for coordinator, health-check, etc. |

**Verification Commands:**
```bash
# List all agents
gt status --json | jq '.agents[] + (.rigs[]?.agents[]? // empty)'
```

### 3.3 Work Page (`/work`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| W-01 | Bead list | Navigate to `/work` | Shows all created beads |
| W-02 | Filter by type | Filter by "bug" | Only bug-type beads shown |
| W-03 | Priority colors | Check priority badges | P0=red, P1=orange, P2=yellow, P3=green |
| W-04 | Status badges | Check status display | open, in_progress, closed states shown |
| W-05 | Click bead | Click on bead title | Navigates to `/issues/[id]` |

**Verification Commands:**
```bash
# List beads
bd list --json | jq '.[] | {id, title, type: .issue_type, status, priority}'
```

### 3.4 Queue Page (`/queue`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| Q-01 | MQ list | Navigate to `/queue` | Shows merge queue entries |
| Q-02 | Priority order | Check item order | Higher priority items first |
| Q-03 | Status types | Check color coding | ready=green, pending=yellow, conflict=red |
| Q-04 | Assignee | Check assignee column | Shows refinery when assigned |

**Note**: Queue uses `gt mq list` (merge queue), not beads. Merge requests are
tracked by the merge queue system, not by `bd create --type=merge_request`.

**Verification Commands:**
```bash
# List merge queue (actual source of truth)
gt mq list testrig --json

# Note: bd list --type=merge_request will NOT work (invalid type)
```

### 3.5 Convoys Page (`/convoys`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| C-01 | Convoy list | Navigate to `/convoys` | Shows created convoy |
| C-02 | Progress bar | Check progress indicator | Shows X/Y completed |
| C-03 | Convoy detail | Click convoy | Shows `/convoys/[id]` with tracked items |
| C-04 | Status badges | Check convoy status | active/stale/stuck/complete |

**Verification Commands:**
```bash
# List convoys
gt convoy list --json
gt convoy status $CONVOY_ID --json | jq '{title, completed, total, tracked}'
```

### 3.6 Mail Page (`/mail`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| M-01 | Inbox empty | Navigate to `/mail` | Shows empty state or mail list |
| M-02 | Compose link | Click "Compose" | Navigates to `/mail/compose` |
| M-03 | Send mail | Fill form, submit | Mail sent, redirects to inbox |
| M-04 | Read mail | Click mail item | Shows `/mail/[id]` with content |
| M-05 | Mail detail | Navigate to `/mail/[id]` | Shows sender, subject, body, timestamp |

**Form Validation Tests (Mail Compose)**:

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| M-V01 | Empty recipient | Submit with empty "To" | Error: "Recipient address is required" |
| M-V02 | Empty subject | Submit with empty subject | Error: "Subject is required" |
| M-V03 | Empty body | Submit with empty body | Error: "Message body is required" |
| M-V04 | All empty | Submit blank form | First validation error shown |
| M-V05 | Valid submission | Fill all fields, submit | Success, redirect to inbox |

**Test Mail Flow:**
```bash
# Send test mail to refinery
gt mail send testrig/refinery -s "Test Subject" -m "Test body content"

# Check inbox (as refinery)
gt mail inbox testrig/refinery --json
```

### 3.7 Escalations Page (`/escalations`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| E-01 | Escalation list | Navigate to `/escalations` | Shows beads with escalation label |
| E-02 | Severity colors | Check severity badges | CRITICAL=red, HIGH=orange, etc. |
| E-03 | Decision format | Check decision escalation | Shows question and options |
| E-04 | Category parsing | Check category badges | Merge Conflict, Decision, etc. |
| E-05 | Escalation detail | Click escalation | Shows `/escalations/[id]` |

**Verification Commands:**
```bash
# List escalations
bd list --label=escalation --json | jq '.[] | {id, title, priority}'
```

### 3.8 Rigs Page (`/rigs`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| R-01 | Rig list | Navigate to `/rigs` | Shows testrig with details |
| R-02 | Agent counts | Check agent counts | Shows polecat/crew counts |
| R-03 | Special agents | Check witness/refinery | Checkmarks if present |
| R-04 | Add rig form | Submit add form | Rig added (if not already exists) |
| R-05 | Remove rig | Click remove button | Confirmation, then removal |

**Verification Commands:**
```bash
# List rigs
gt status --json | jq '.rigs[] | {name, polecat_count, crew_count, has_witness, has_refinery}'
```

### 3.9 Health Page (`/health`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| H-01 | Overall status | Navigate to `/health` | Shows healthy/degraded/offline |
| H-02 | Daemon health | Check daemon section | Shows running status |
| H-03 | Rig health | Check rig sections | Shows each rig's health |
| H-04 | Dead agents | Check for warnings | Highlights any dead agents |

**Verification Commands:**
```bash
# Check for dead agents
gt status --json | jq '[.rigs[].agents[] | select(.state == "dead")]'
```

### 3.10 Watchdog Page (`/watchdog`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| W-01 | Three tiers | Navigate to `/watchdog` | Shows Daemon, Boot, Deacon tiers |
| W-02 | Chain status | Check chain health | Shows healthy/broken chain |
| W-03 | Heartbeat freshness | Check timestamps | fresh/stale/very-stale indicators |
| W-04 | Tier details | Check each tier | Shows last heartbeat, status |

**Verification Commands:**
```bash
# Check heartbeat files
cat ~/gt/deacon/heartbeat.json 2>/dev/null || echo "No deacon heartbeat"
cat ~/gt/boot/status.json 2>/dev/null || echo "No boot status"
```

### 3.11 Activity Page (`/activity`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| AC-01 | Activity feed | Navigate to `/activity` | Shows event timeline |
| AC-02 | Event count | Check header | Shows "X events" count |
| AC-03 | Filter chips | Check filter options | All Events, merge, session start, spawn, test pass, work completed |
| AC-04 | Type filter | Use Type dropdown | Filters events by type |
| AC-05 | Actor filter | Use Actor dropdown | Filters events by agent |
| AC-06 | Refresh rate | Check Refresh dropdown | Auto-refresh options (5s default) |
| AC-07 | Event details | Check timeline entries | Shows agent, action type, description, timestamp |

**Verification Commands:**
```bash
# Activity comes from gt event log
gt status --json | jq '.events // []'
```

### 3.12 Workflows Page (`/workflows`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| WF-01 | Workflows header | Navigate to `/workflows` | Shows "Workflows" title with connection status |
| WF-02 | System stats | Check stats section | Shows Active, Wisps, Stale counts |
| WF-03 | Molecules tab | Default tab selected | Shows molecule list or empty state |
| WF-04 | Formulas tab | Click Formulas tab | Shows formula templates |
| WF-05 | Empty state | No molecules | "No active molecules or wisps" message |
| WF-06 | Connection status | Check badge | Shows "1 connected" or error state |

**Verification Commands:**
```bash
# List molecules and formulas
bd mol list --json
bd mol list --formulas --json
```

### 3.14 Detail Pages (Dynamic Routes)

These pages display individual item details:

#### Issue Detail (`/issues/[id]`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| I-01 | Valid issue | Navigate to `/issues/hq-xyz` | Shows title, type, priority, status |
| I-02 | Issue metadata | Check details section | Shows assignee, created date, labels |
| I-03 | Issue description | Check description | Renders markdown content |
| I-04 | Invalid issue | Navigate to `/issues/invalid` | 404 or "Not found" message |
| I-05 | Back navigation | Click back button | Returns to /work page |

#### Convoy Detail (`/convoys/[id]`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| CV-01 | Valid convoy | Navigate to `/convoys/[id]` | Shows title, progress, tracked items |
| CV-02 | Progress display | Check progress bar | Shows X/Y completed |
| CV-03 | Tracked items | Check item list | Lists all tracked beads |
| CV-04 | Item status | Check item badges | Shows open/closed status per item |
| CV-05 | Invalid convoy | Navigate to `/convoys/invalid` | 404 or "Not found" message |

#### Escalation Detail (`/escalations/[id]`)

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| ES-01 | Valid escalation | Navigate to `/escalations/[id]` | Shows title, severity, category |
| ES-02 | Decision options | Check decision type | Shows options if decision escalation |
| ES-03 | Merge conflict | Check conflict type | Shows branch info if merge conflict |
| ES-04 | Invalid escalation | Navigate to `/escalations/invalid` | 404 or "Not found" message |

### 3.15 Error State Tests (Per Page)

Each page should gracefully handle errors:

| Page | Error Scenario | Expected Behavior |
|------|----------------|-------------------|
| Dashboard | Daemon stopped | "Unable to connect" message, no crash |
| Agents | CLI timeout | Loading spinner, then error |
| Work | `bd` not in PATH | Circuit breaker message (see fix in Lessons Learned) |
| Queue | Empty queue | "Queue is empty" message |
| Convoys | No convoys | "No convoys yet" empty state |
| Mail | Empty inbox | "No messages" empty state |
| Escalations | No escalations | "No pending escalations" empty state |
| Rigs | No rigs | "No rigs configured" message |
| Health | Agent dead | Shows "Degraded Mode" status, highlights offline agents |
| Watchdog | Missing heartbeat | Shows "stale" or "very-stale" indicator |
| Activity | No events | "No activity" empty state |
| Workflows | No molecules | "No active molecules or wisps" message |

### 3.16 Loading State Tests

| Test ID | Scenario | Steps | Expected Result |
|---------|----------|-------|-----------------|
| L-01 | Slow CLI | Add delay to CLI response | Loading spinner shown |
| L-02 | Page transition | Navigate between pages | Smooth transition, no flash |
| L-03 | Data refresh | Trigger data reload | Loading indicator, then fresh data |

---

## Phase 4: Create Test Molecule

A molecule template for running the complete E2E test suite:

```bash
# Create molecule definition
cat > $GT_TOWN/.beads/molecules/mol-ui-e2e-test.yaml << 'EOF'
id: mol-ui-e2e-test
name: UI E2E Test Suite
description: Complete end-to-end testing of gastown_ui
type: patrol

steps:
  - id: setup-verify
    name: Verify Test Environment
    description: Ensure test town and UI server are running

  - id: create-test-data
    name: Create Test Beads
    description: Populate beads for testing all pages

  - id: test-dashboard
    name: Test Dashboard
    description: Verify dashboard stats and quick actions

  - id: test-agents
    name: Test Agents Page
    description: Verify agent list and detail views

  - id: test-work
    name: Test Work Page
    description: Verify bead list, filters, and detail views

  - id: test-queue
    name: Test Queue Page
    description: Verify merge request queue display

  - id: test-convoys
    name: Test Convoys Page
    description: Verify convoy list and tracking

  - id: test-mail
    name: Test Mail System
    description: Test inbox, compose, and send functionality

  - id: test-escalations
    name: Test Escalations Page
    description: Verify escalation display and severity

  - id: test-rigs
    name: Test Rigs Page
    description: Test rig list and management

  - id: test-health
    name: Test Health Page
    description: Verify health status display

  - id: test-watchdog
    name: Test Watchdog Page
    description: Verify three-tier chain monitoring

  - id: cleanup
    name: Cleanup Test Data
    description: Remove test beads (optional)

  - id: generate-report
    name: Generate Test Report
    description: Summarize test results
EOF
```

---

## Phase 5: Browser Testing with Claude in Chrome

For real browser automation, use **Claude in Chrome** (MCP-based browser control).
Do NOT use Playwright or other browser automation frameworks.

### 5.0 Claude in Chrome Test Workflow

```bash
# Prerequisites:
# 1. Claude Code CLI with claude-in-chrome MCP server configured
# 2. Chrome browser with Claude extension installed

# Test workflow:
# 1. Start UI server
GT_TOWN=$TEST_TOWN bun dev --port $UI_PORT &

# 2. Use Claude in Chrome to navigate and test
# Claude can:
# - Navigate to pages: mcp__claude-in-chrome__navigate
# - Read page content: mcp__claude-in-chrome__read_page
# - Click elements: mcp__claude-in-chrome__computer
# - Fill forms: mcp__claude-in-chrome__form_input
# - Take screenshots: mcp__claude-in-chrome__computer (action: screenshot)
```

### 5.0.1 Example Browser Test Commands

```
# In Claude Code conversation:

"Navigate to http://localhost:5174 and verify the dashboard shows 4 agents"
"Go to /agents and click on the Mayor agent to view details"
"Navigate to /mail/compose, fill in the form, and submit"
"Take a screenshot of the /health page"
```

### 5.0.2 Browser Test Checklist (Manual with Claude in Chrome)

| Test | Claude Command | Verification |
|------|----------------|--------------|
| Dashboard loads | Navigate to `/` | Screenshot shows agent cards |
| Agent detail | Click Mayor on `/agents` | Detail page shows Mayor info |
| Mail compose | Fill form on `/mail/compose` | Form submits without error |
| Error state | Stop daemon, refresh | Error message displayed |

---

## Phase 6: Automated Test Scripts

### 6.1 Setup Script (Improved Error Handling)

```bash
#!/bin/bash
# setup-test-data.sh
# Creates all test data for E2E testing
# Usage: TEST_TOWN=/tmp/my-town TEST_RIG=myrig ./setup-test-data.sh

set -euo pipefail

# Parameterized paths (override with environment variables)
export GT_TOWN="${TEST_TOWN:-/tmp/gt-test-$$}"
export TEST_RIG="${TEST_RIG:-testrig}"

cd "$GT_TOWN" || { echo "ERROR: Cannot cd to $GT_TOWN"; exit 1; }

# Helper function for safe bead creation
create_bead() {
  local output
  output=$(bd create "$@" 2>&1) || { echo "ERROR: bd create failed: $output"; return 1; }
  echo "$output" | grep -oE 'hq-[a-z0-9]+' || { echo "ERROR: Could not parse bead ID"; return 1; }
}

echo "=== Pause Deacon First (Prevents Token Drain) ==="
gt deacon pause --reason="setup script" || echo "WARN: deacon pause failed (may already be paused)"

echo "=== Creating Test Beads (Tier 1 - No Agents) ==="

# Tasks (minimal titles to reduce context cost)
create_bead --type=task --priority=2 --title="[UI-TEST] Search"
create_bead --type=task --priority=1 --title="[UI-TEST] Pagination"
create_bead --type=bug --priority=0 --title="[UI-TEST] Memory leak"
create_bead --type=feature --priority=3 --title="[UI-TEST] Dark mode"

echo "=== Creating Escalations ==="

create_bead --type=bug --priority=1 --title="[Merge Conflict] Branch" --label=escalation
create_bead --type=task --priority=2 --title="[Decision] API version" --label=escalation
create_bead --type=bug --priority=0 --title="[Failure] Tests fail" --label=escalation

echo "=== Creating Convoy ==="

gt convoy create "UI Test Sprint" || echo "WARN: convoy create failed"

echo "=== Test Data Summary ==="
echo "Beads: $(bd list --json 2>/dev/null | jq 'length' || echo 'N/A')"
echo "Convoys: $(gt convoy list --json 2>/dev/null | jq 'length' || echo 'N/A')"
echo "Rig: $TEST_RIG"

echo "=== Setup Complete (Tier 1 - No agent tokens used) ==="
```

### 6.1.1 Tier 2 Setup Script (With 1 Polecat)

```bash
#!/bin/bash
# setup-tier2.sh
# Adds ONE polecat for full E2E testing
# WARNING: This costs ~500-1000 tokens

set -euo pipefail

export GT_TOWN="${TEST_TOWN:-/tmp/gt-test-$$}"
export TEST_RIG="${TEST_RIG:-testrig}"

cd "$GT_TOWN"

# Ensure deacon is paused
gt deacon pause --reason="tier2 setup" 2>/dev/null || true

echo "=== Creating ONE Polecat (Tier 2) ==="

# Create a minimal bead for the polecat
BEAD_ID=$(bd create --type=task --priority=1 --title="[UI-TEST] Polecat work" 2>&1 | grep -oE 'hq-[a-z0-9]+')

if [ -z "$BEAD_ID" ]; then
  echo "ERROR: Failed to create bead"
  exit 1
fi

echo "Created bead: $BEAD_ID"

# Sling to create polecat (ONE-TIME token cost)
gt sling "$BEAD_ID" "$TEST_RIG" --create || { echo "ERROR: sling failed"; exit 1; }

echo "=== Polecat Created (Token Cost: ~500-1000) ==="
echo "Polecat is running but idle (deacon paused)"

# Verify
gt status --json | jq ".rigs[] | select(.name == \"$TEST_RIG\") | .agents[] | select(.role == \"polecat\")"
```

### 6.2 Verification Script (Tier-Based)

```bash
#!/bin/bash
# verify-ui.sh
# Verifies all pages have correct data
# Usage: TEST_TOWN=/tmp/my-town UI_PORT=5174 ./verify-ui.sh

set -euo pipefail

export GT_TOWN="${TEST_TOWN:-/tmp/gt-test-$$}"
export TEST_RIG="${TEST_RIG:-testrig}"
export UI_PORT="${UI_PORT:-5174}"
BASE_URL="http://localhost:$UI_PORT"

PASSED=0
FAILED=0
SKIPPED=0

# Test result tracking
test_pass() { echo "✓ $1"; ((PASSED++)); }
test_fail() { echo "✗ $1"; ((FAILED++)); }
test_skip() { echo "- $1 (skipped)"; ((SKIPPED++)); }

cd "$GT_TOWN" || { echo "ERROR: Cannot cd to $GT_TOWN"; exit 1; }

echo "=== Tier 0: Smoke Tests (Zero Cost) ==="

# HTTP 200 checks only
for endpoint in "" "agents" "work" "queue" "convoys" "mail" "escalations" "rigs" "health" "watchdog"; do
  STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$BASE_URL/$endpoint" 2>/dev/null || echo "000")
  if [ "$STATUS" = "200" ]; then
    test_pass "/$endpoint (HTTP 200)"
  else
    test_fail "/$endpoint (HTTP $STATUS)"
  fi
done

echo ""
echo "=== Tier 1: Integration Tests (Zero Cost) ==="

# Backend data verification
AGENT_COUNT=$(gt status --json 2>/dev/null | jq '.agents | length' || echo 0)
[ "$AGENT_COUNT" -ge 1 ] && test_pass "Agents: $AGENT_COUNT" || test_fail "No agents found"

RIG_COUNT=$(gt status --json 2>/dev/null | jq '.rigs | length' || echo 0)
[ "$RIG_COUNT" -ge 1 ] && test_pass "Rigs: $RIG_COUNT" || test_fail "No rigs found"

BEAD_COUNT=$(bd list --json 2>/dev/null | jq 'length' || echo 0)
[ "$BEAD_COUNT" -ge 1 ] && test_pass "Beads: $BEAD_COUNT" || test_skip "No beads (may be expected)"

ESC_COUNT=$(bd list --label=escalation --json 2>/dev/null | jq 'length' || echo 0)
echo "  Escalations: $ESC_COUNT"

CONVOY_COUNT=$(gt convoy list --json 2>/dev/null | jq 'length' || echo 0)
echo "  Convoys: $CONVOY_COUNT"

echo ""
echo "=== Summary ==="
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo "Skipped: $SKIPPED"

if [ "$FAILED" -gt 0 ]; then
  echo ""
  echo "RESULT: FAIL"
  exit 1
else
  echo ""
  echo "RESULT: PASS"
  exit 0
fi
```

### 6.3 Cleanup Script

```bash
#!/bin/bash
# cleanup-test-data.sh
# Removes test beads (optional)

set -euo pipefail

export GT_TOWN="${TEST_TOWN:-/tmp/gt-test-$$}"
cd "$GT_TOWN"

echo "=== Cleaning Up Test Beads ==="

# Find and close all UI-TEST beads
bd list --json 2>/dev/null | jq -r '.[] | select(.title | contains("[UI-TEST]")) | .id' | while read -r id; do
  [ -n "$id" ] && { echo "Closing: $id"; bd close "$id" 2>/dev/null || true; }
done

# Remove test convoys
gt convoy list --json 2>/dev/null | jq -r '.[] | select(.title | contains("UI Test")) | .id' | while read -r id; do
  [ -n "$id" ] && { echo "Removing convoy: $id"; gt convoy close "$id" 2>/dev/null || true; }
done

# Stop any test polecats
gt session stop "$TEST_RIG/polecats/*" 2>/dev/null || true

# Resume deacon
gt deacon resume 2>/dev/null || true

echo "=== Cleanup Complete ==="
```

---

## Phase 7: Test Convoy Structure

For organized parallel testing, create a convoy:

```bash
cd $GT_TOWN

# Create main test convoy (no --description flag)
gt convoy create "UI E2E Full Test Suite"

# Create beads for each test area
bd create --type=task --priority=1 --title="Test: Dashboard page" --label=e2e-test
bd create --type=task --priority=1 --title="Test: Agents page" --label=e2e-test
bd create --type=task --priority=1 --title="Test: Work page" --label=e2e-test
bd create --type=task --priority=1 --title="Test: Queue page" --label=e2e-test
bd create --type=task --priority=1 --title="Test: Convoys page" --label=e2e-test
bd create --type=task --priority=2 --title="Test: Mail system" --label=e2e-test
bd create --type=task --priority=2 --title="Test: Escalations page" --label=e2e-test
bd create --type=task --priority=2 --title="Test: Rigs page" --label=e2e-test
bd create --type=task --priority=2 --title="Test: Health page" --label=e2e-test
bd create --type=task --priority=2 --title="Test: Watchdog page" --label=e2e-test

# Track all in convoy
CONVOY_ID=$(gt convoy list --json | jq -r '.[-1].id')
bd list --label=e2e-test --json | jq -r '.[].id' | while read id; do
  gt convoy track $CONVOY_ID $id
done

echo "Convoy ready: $CONVOY_ID"
gt convoy status $CONVOY_ID
```

---

## Phase 8: Expected Test Results

### 7.1 Page Availability Matrix (Actual Test Results - 2025-01-24)

**All pages passing after ProcessSupervisor fix (commit bb9ca56).**

| Page | URL | Data Source | Status | Notes |
|------|-----|-------------|--------|-------|
| Dashboard | `/` | `gt status --json` | ✅ **PASS** | Shows rig count, agent count correctly |
| Agents | `/agents` | `gt status --json` | ✅ **PASS** | All 6 agents shown (Mayor, Deacon, Witness, Refinery, Chrome, Rust) |
| Agent Detail | `/agents/[id]` | `gt status --json` | ✅ **PASS** | Agent info displayed |
| Work | `/work` | `bd list --json` | ✅ **PASS** | Shows 3 beads (hq-0jh, hq-2t3, hq-dzk) |
| Queue | `/queue` | `gt mq list` | ✅ **PASS** | Shows "Queue is empty" (expected - no MRs) |
| Convoys | `/convoys` | `gt convoy list` | ✅ **PASS** | Shows "No convoys yet" empty state |
| Mail | `/mail` | `gt mail inbox` | ✅ **PASS** | Inbox with Compose button |
| Escalations | `/escalations` | `bd list --label=escalation` | ✅ **PASS** | Shows 2 escalations with full details |
| Rigs | `/rigs` | `gt status --json` | ✅ **PASS** | testrig with 2 polecats, Witness, Refinery |
| Health | `/health` | `gt status --json` | ✅ **PASS** | System status, daemon heartbeat, rig health |
| Activity | `/activity` | Event log | ✅ **PASS** | Shows 5 events with filtering |
| Workflows | `/workflows` | `bd mol list` | ✅ **PASS** | System stats, Molecules/Formulas tabs |

**Key Fix**: ProcessSupervisor now includes `~/.local/bin` and `~/go/bin` in PATH,
and uses `GT_TOWN` environment variable as working directory for CLI commands.

### 7.2 Tested Agent Configuration (2025-01-24 Session)

From actual test run with deacon paused:
```
Mayor     - Coordinator (Stopped - deacon paused)
Deacon    - Health-Check (Stopped - paused for testing)
Witness   - Rig observer (Offline - deacon paused)
Refinery  - Merge processor (Offline - deacon paused)
rust      - polecat (created by earlier session)
chrome    - polecat (created by earlier session)
```

**Test Town**: `/tmp/test-town-1769271249`
**Beads Prefix**: `hq`

**Test Data Created**:
- 3 beads: hq-0jh (Task A), hq-2t3 (Bug B), hq-dzk (Escalation C)
- 2 escalations with full details (merge conflict, decision required)
- 1 rig: testrig with witness + refinery
- Activity log with 5 events from prior agent patrols

### 7.2 Error Handling Matrix

| Scenario | Expected Behavior |
|----------|-------------------|
| Daemon stopped | Error message, no crash |
| Empty bead list | "No items" message |
| Invalid agent ID | 404 page |
| Network timeout | Error with retry option |

---

## Phase 9: Running the Tests

### Pre-Flight Checklist (CRITICAL)

Before running tests, verify these items to avoid common pitfalls:

```bash
# 1. Check CLI tools are in PATH
which bd || echo "FAIL: bd not in PATH - add ~/.local/bin"
which gt || echo "FAIL: gt not in PATH - add ~/go/bin"

# 2. Check ProcessSupervisor has PATH fix (commit bb9ca56)
grep -q "getEnvWithPath" src/lib/server/cli/process-supervisor.ts || \
  echo "WARN: ProcessSupervisor may be missing PATH fix"

# 3. Check GT_TOWN is set
[ -n "$GT_TOWN" ] || echo "FAIL: GT_TOWN not set"

# 4. Check test town has valid beads config
[ -f "$GT_TOWN/.beads/config.yaml" ] || echo "FAIL: No beads config in test town"

# 5. Check beads database is healthy
bd list --json >/dev/null 2>&1 || echo "WARN: bd list failed - may need db reset"

# 6. Check UI server port
curl -sf "http://localhost:${UI_PORT:-5174}" >/dev/null || \
  echo "FAIL: UI not responding on port ${UI_PORT:-5174}"
```

### Quick Start (Tier-Based)

```bash
# Set up environment variables
export TEST_TOWN="/tmp/gt-test-$$"
export TEST_RIG="testrig"
export UI_PORT="5174"
export GASTOWN_UI="$PWD"

# Terminal 1: Ensure daemon is running with deacon paused
cd "$TEST_TOWN"
gt daemon start
gt deacon pause --reason="testing"
gt status  # Should show running agents

# Terminal 2: Start UI server
cd "$GASTOWN_UI"
export PATH="/Users/amrit/.local/bin:/Users/amrit/go/bin:$PATH"
GT_TOWN="$TEST_TOWN" bun dev --port "$UI_PORT"

# Terminal 3: Run tests by tier
./health-gate.sh           # Pre-flight check
./setup-test-data.sh       # Tier 1 data (zero cost)
./verify-ui.sh             # Tier 0/1 tests (zero cost)

# Optional: Tier 2 (costs tokens)
./setup-tier2.sh           # Create 1 polecat (~500-1000 tokens)
```

### Tier-Based Testing Checklist

**Tier 0: Smoke (Zero Cost, Run Every Commit)**
- [ ] All pages return HTTP 200
- [ ] No server errors in console

**Tier 1: Integration (Zero Cost, Run on PR)**
- [ ] Dashboard loads with agent/rig counts
- [ ] Agents page shows all agents
- [ ] Work page shows test beads (if bd in PATH)
- [ ] Health page shows healthy status
- [ ] Watchdog shows three tiers

**Tier 2: Full E2E (Token Cost, Run on Release)**
- [ ] Polecat visible and running
- [ ] Mail compose sends successfully
- [ ] Convoy progress updates
- [ ] Agent detail pages load

---

## Appendix: gt and bd Command Reference

### gt Commands (Town Operations)

```bash
gt status [--json]           # Overall status
gt mail inbox [AGENT]        # Agent's mailbox
gt mail send ADDR -s SUBJ -m MSG  # Send mail
gt convoy list [--json]      # List convoys
gt convoy create TITLE       # Create convoy
gt convoy status ID [--json] # Convoy details
gt convoy track ID BEAD_ID   # Add bead to convoy
gt hook                      # Check agent's hook
gt mq list RIG               # Merge queue for rig
```

### bd Commands (Beads Operations)

```bash
bd list [--json] [--type=TYPE] [--status=STATUS] [--label=LABEL]
bd create --type=TYPE --priority=N --title="TITLE" [--description="DESC"] [--label=LABEL]
bd show ID                   # Show bead details
bd close ID                  # Close a bead
bd assign ID ASSIGNEE        # Assign bead
bd mol list                  # List molecules
bd mol spawn MOL_ID [--wisp] # Create instance
```

---

## Notes

1. **Test Town Isolation**: Tests run against `/tmp/test-town-*`, not production
2. **Data Reset**: Use cleanup script between test runs
3. **Demo Mode**: Set `GASTOWN_DEMO_MODE=false` for real data testing
4. **Timeouts**: Some pages have 5-10 second timeouts for CLI commands
5. **Error States**: Test error scenarios by stopping daemon

---

## Token Conservation Best Practices

When testing with live agents, token costs add up quickly. Understanding what
consumes tokens vs what is free is critical for efficient testing.

### What Consumes Tokens vs What Is Free

| Operation | Token Cost | Notes |
|-----------|------------|-------|
| `gt session start` | ~500-1000 | Claude initialization + GUPP propulsion |
| Idle patrol cycle | ~100-200 | Claude reviews inbox, decides actions |
| Full Witness patrol | ~500-1000 | Surveys all polecats, assigns work |
| Active polecat work | Variable | Continuous Claude reasoning |
| `gt nudge` | **FREE** | Pure tmux message injection |
| `gt hook` | **FREE** | Local beads query |
| `gt agent state` | **FREE** | Local labels read |
| `gt status` | **FREE** | Local state query |
| `bd list/show/create` | **FREE** | Local beads operations |

### Method 1: Pause the Deacon (Recommended for UI Testing)

The **Deacon** is the watchdog that triggers patrols and health checks.
Pausing it prevents ALL autonomous agent activity:

```bash
# Pause deacon BEFORE starting test sessions
gt deacon pause --reason="UI testing"

# Now agents won't auto-patrol or process work
# They'll just idle at the prompt (zero token drain)

# Resume when done testing
gt deacon resume
```

**Important**: `gt deacon pause` is different from `gt session stop`:
- `deacon pause` - Agents stay running but don't take actions
- `session stop` - Kills the agent session entirely

### Method 2: Degraded Mode (Zero Tokens)

For CI/CD or mechanical testing without ANY LLM calls:

```bash
# Start daemon in degraded mode (no Claude)
GT_DEGRADED=true gt daemon start

# Daemon runs mechanical checks only:
# - Is session alive?
# - Are beads synced?
# - Hook assignments (local only)

# Zero tokens consumed - pure Go code execution
```

### Method 3: Pre-Assign Work on Session Start

Avoid poll loops by assigning work directly:

```bash
# BAD: Start session, let it poll for work (wastes tokens)
gt session start testrig/alpha

# GOOD: Pre-assign issue on start (avoids poll loop)
gt session start testrig/alpha --issue hq-abc

# Polecat immediately starts working on hq-abc
# No patrol cycle needed to discover work
```

### Method 4: Use Hooks for Direct Assignment

Hooks are local beads operations (zero tokens):

```bash
# Assign work via hook (FREE operation)
bd update hq-abc --assignee=testrig/polecats/alpha
gt hook testrig/alpha hq-abc

# Then nudge to wake agent (FREE operation)
gt nudge testrig/alpha "New work on your hook"

# Agent checks hook locally, starts working
# No patrol needed
```

### Method 5: Model Selection Strategy

Use cheaper models for simple tasks:

```bash
# Haiku (~10x cheaper) for quick checks
gt session start testrig/alpha --model=haiku --issue hq-simple

# Sonnet (default) for standard work
gt session start testrig/alpha --issue hq-standard

# Opus (expensive) only for complex reasoning
gt session start testrig/alpha --model=opus --issue hq-complex
```

**Model Selection by Test Type**:

| Test Type | Recommended Model | Why |
|-----------|-------------------|-----|
| Simple validation | Haiku | Fast, cheap, sufficient |
| Standard E2E | Sonnet | Balanced capability/cost |
| Complex debugging | Opus | Better reasoning needed |
| Tier 0/1 tests | None (degraded) | Zero cost |

### Keep Beads Minimal

```bash
# GOOD: Short titles, no description
bd create --type=task --priority=1 --title="Test login"

# BAD: Verbose (wastes context when agents read)
bd create --type=task --priority=1 \
  --title="Test login feature for authentication system" \
  --description="This bead tests the complete login flow including..."
```

### Token-Efficient UI Testing Workflow

```bash
# 1. Start daemon with deacon paused
gt daemon start
gt deacon pause --reason="UI testing"

# 2. Create test beads (FREE - local operation)
bd create --type=task --priority=1 --title="Test task"
# Note the bead ID, e.g., hq-xyz

# 3. Sling to create polecats (one-time token cost)
gt sling hq-xyz testrig --create

# 4. Immediately stop the polecat session
gt session stop testrig/polecats/rust

# 5. Now test UI freely - no token drain
#    - Browse /agents, /work, /convoys, etc.
#    - All pages show real data
#    - No agents consuming tokens

# 6. When done, clean up
bd close hq-xyz
gt deacon resume
```

### Monitor Agent Idle State

Agents track idle cycles via labels (zero token check):

```bash
# Check agent idle state (FREE)
gt agent state testrig/polecats/rust

# Output shows:
#   idle:3          - 3 consecutive idle cycles
#   backoff:30s     - Current sleep interval
#   last_activity:  - When last active

# Reset idle counter if needed
gt agent state testrig/polecats/rust --set idle=0
```

### Spawning & Pausing Each Agent Type

Each agent type has different spawn/pause mechanisms:

#### Deacon (Watchdog)

```bash
# Deacon is started automatically by daemon
# To prevent token consumption:
gt deacon pause --reason="testing"

# Deacon stays "running" but takes NO actions:
# - No patrol molecules created
# - No health checks
# - No autonomous nudges

# Resume when ready
gt deacon resume
```

**Token Impact**: Paused deacon = zero tokens (purely mechanical)

#### Witness (Rig Observer)

```bash
# Witness is auto-spawned when you create a rig with --witness
gt rig add testrig https://github.com/... --witness

# Or spawn manually for existing rig
gt witness spawn testrig

# To pause witness: stop its session
gt session stop testrig/witness

# Witness patrol consumes ~500-1000 tokens per cycle
# When stopped: zero tokens
```

**Token Impact**: Running witness patrols periodically. Stop session to freeze.

#### Refinery (Merge Queue Processor)

```bash
# Refinery is auto-spawned with --refinery flag
gt rig add testrig https://github.com/... --refinery

# Or spawn manually
gt refinery spawn testrig

# To pause refinery: stop its session
gt session stop testrig/refinery

# Refinery only consumes tokens when:
# - Processing merge queue
# - Running test suites
# - Resolving conflicts
```

**Token Impact**: Mostly idle unless merge queue has work. Safe to run.

#### Polecats (Workers)

```bash
# SPAWNING: Use sling with --create flag
bd create --type=task --priority=1 --title="Test work"
gt sling hq-xyz testrig --create
# Creates polecat automatically (e.g., testrig/polecats/rust)

# PAUSING: Stop the session (keeps Claude from working)
gt session stop testrig/polecats/rust

# Alternative: Let polecat idle at prompt
# (If deacon is paused, polecat won't receive nudges = no work = no tokens)

# RESUMING: Start session again
gt session start testrig/polecats/rust
# Or resume with pre-assigned work:
gt session start testrig/polecats/rust --issue hq-xyz
```

**Token Impact**: Polecats consume tokens when working. Stop session or pause deacon.

#### Mayor (Town Coordinator)

```bash
# Mayor is started automatically by daemon
# Cannot be paused directly - it's the daemon itself

# To minimize mayor token usage:
# 1. Pause deacon (mayor's watchdog helper)
# 2. Don't send mail to mayor
# 3. Mayor is mostly idle when deacon paused
```

**Token Impact**: Mayor consumes tokens when processing mail or escalations.

### Running vs Stopped: What's the Difference?

**Important**: For proper UI testing, agents should be **RUNNING** (not killed).
The UI needs to display real running agent states.

| State | `running` | Token Usage | UI Shows | Use For |
|-------|-----------|-------------|----------|---------|
| Active | true | High | Running agents | Production |
| Paused (deacon pause) | true | **Zero** | Running agents | **UI Testing** |
| Stopped (session stop) | false | Zero | Stopped agents | Not recommended |
| Killed (session kill) | false | Zero | Missing agents | Cleanup only |

**Key Insight**: `gt deacon pause` keeps ALL agents running but idle.
They appear as `running: true, has_work: false` - perfect for UI testing.

### Recommended: Low-Token UI Test Setup

```bash
# 1. Start daemon
gt daemon start

# 2. Pause deacon FIRST (prevents autonomous actions)
gt deacon pause --reason="UI testing"

# Now all agents are RUNNING but IDLE (zero tokens)
# - Mayor: running, idle at prompt
# - Deacon: running, paused (no patrols)
# - Witness: running, idle (no surveys)
# - Refinery: running, idle (no merges)

# 3. Create MINIMAL test data (all FREE - local beads operations)
#    Keep beads to absolute minimum (1-2 max)
bd create --type=task --priority=1 --title="Test task"
# Note the bead ID, e.g., hq-xyz

# 4. Create 1-2 polecats MAX (each costs ~500-1000 tokens to initialize)
gt sling hq-xyz testrig --create   # Creates ONE polecat

# ⚠️ IMPORTANT: Start with 1 polecat for testing
# Only add second polecat if specifically testing multi-polecat UI features
# Each polecat = one Claude session = one-time init cost

# 5. Polecat initializes (one-time cost) then idles
#    Because deacon is paused, polecat won't receive work nudges
#    It stays running but idle - zero ongoing tokens

# 6. Verify: ALL agents running but idle
gt status --json | jq '.rigs[].agents[] | {name, running, has_work}'
# Should show: running: true, has_work: false for all

# NOW: Full UI testing with real running agents
# - /agents shows all running agents with green status
# - /health shows all healthy running agents
# - /watchdog shows active three-tier chain
# - Zero ongoing token consumption

# 7. When done testing
gt deacon resume  # Re-enables autonomous actions
```

### Alternative: Stopped Agents (Limited Testing)

If you absolutely need zero initial token cost, you can stop agent sessions.
But this limits what the UI can show:

```bash
# Stop all sessions (agents show as "not running")
gt session stop testrig/witness
gt session stop testrig/refinery
gt session stop testrig/polecats/*

# UI will show:
# - /agents: agents with "stopped" status (gray badges)
# - /health: may show "degraded" status
# - Not a full test of running agent display
```

**Recommendation**: Use `gt deacon pause` for proper testing with running agents.

### Clean Up After Testing

```bash
# Close test beads (prevents accidental processing)
bd list --json | jq -r '.[] | select(.title | contains("[UI-TEST]")) | .id' | \
  xargs -I{} bd close {}

# Stop all test polecat sessions
gt session stop testrig/polecats/*

# Resume normal operations
gt deacon resume
```

---

## Quick Reference

### Agent Lifecycle (Spawn & Pause)

| Agent | Spawn Command | Pause Command | Token Cost When Running |
|-------|---------------|---------------|-------------------------|
| Mayor | `gt daemon start` (auto) | N/A (pause deacon instead) | Low (idle mostly) |
| Deacon | `gt daemon start` (auto) | `gt deacon pause` | ~100-200/patrol |
| Witness | `gt witness spawn <rig>` | `gt session stop <rig>/witness` | ~500-1000/patrol |
| Refinery | `gt refinery spawn <rig>` | `gt session stop <rig>/refinery` | Variable (on work) |
| Polecat | `gt sling <bead> <rig> --create` | `gt session stop <rig>/polecats/<name>` | High (active work) |

### Session Commands
```bash
gt sling <bead> <rig> --create    # Create polecat + assign work
gt session stop <agent>           # Stop session (zero tokens)
gt session start <agent>          # Resume session
gt session start <agent> --issue <id>  # Resume with pre-assigned work
gt deacon pause --reason="..."    # Pause ALL autonomous actions
gt deacon resume                  # Resume autonomous actions
```

### Zero-Token Testing Quick Start
```bash
# Tier 0/1: Zero cost
gt daemon start && gt deacon pause --reason="testing"
GT_DEGRADED=true gt daemon start  # Alternative: degraded mode
./setup-test-data.sh              # Creates beads (no agents)
./verify-ui.sh                    # HTTP checks only

# Tier 2: With agent (costs ~500-1000 tokens ONCE)
./setup-tier2.sh                  # Creates 1 polecat
# Test UI with running polecat
# Polecat idles (deacon paused) - no ongoing cost
```

### Cost Summary by Tier

| Tier | Setup Cost | Ongoing Cost | Total for Full Run |
|------|------------|--------------|---------------------|
| 0 | Zero | Zero | **Zero** |
| 1 | Zero | Zero | **Zero** |
| 2 | ~500-1000 tokens | Zero (paused) | **~500-1000 tokens** |

### Data Sources by Page
| Page | CLI Command | Notes |
|------|-------------|-------|
| Dashboard | `gt status --json` | Agents/rigs counts from status |
| Agents | `gt status --json` | Uses `.agents[]` and `.rigs[].agents[]` |
| Work | `bd list --json` | Uses ProcessSupervisor (needs PATH fix) |
| Queue | `gt mq list <rig>` | NOT `bd list --type=merge_request` |
| Convoys | `gt convoy list/status` | Works without `bd` |
| Mail | `gt mail inbox/send` | Works without `bd` |
| Escalations | `bd list --label=escalation` | Uses ProcessSupervisor (needs PATH fix) |
| Rigs | `gt status --json` | Uses `.rigs[]` |
| Health | `gt status --json` | Checks agent running states |
| Watchdog | `gt status` + heartbeat files | Three-tier health chain |
| Activity | Event log (internal) | Shows merge, spawn, test pass events |
| Workflows | `bd mol list --json` | Uses ProcessSupervisor (needs PATH fix) |

---

## Lessons Learned / Pitfalls to Avoid

### 1. ProcessSupervisor vs execGt - Two Different CLI Handlers

**Problem**: The codebase has TWO separate CLI execution mechanisms:
- `src/lib/server/gt.ts` - Uses `execGt()` for some pages
- `src/lib/server/cli/process-supervisor.ts` - Used by other pages (Work, Queue, Escalations)

**Pitfall**: Fixing one doesn't fix the other! We fixed `execGt` first but ProcessSupervisor
was still broken. Always check BOTH files when fixing CLI path issues.

**Which pages use which**:
| Handler | Pages |
|---------|-------|
| `execGt()` | Agents, Health (partial) |
| `ProcessSupervisor` | Work, Queue, Escalations, Dashboard (bead counts) |

### 2. PATH Must Include Both CLI Locations

**Problem**: `bd` is in `~/.local/bin`, `gt` is in `~/go/bin`. Neither is in standard PATH.

**Fix**: Both CLI handlers must prepend these paths:
```typescript
const additionalPaths = [
  `${homedir}/.local/bin`,  // bd location
  `${homedir}/go/bin`       // gt location
];
```

### 3. GT_TOWN Working Directory is Critical

**Problem**: `bd` commands fail with "not in a Gas Town workspace" if run from wrong directory.

**Fix**: ProcessSupervisor must use `GT_TOWN` as cwd:
```typescript
function getTownCwd(): string | undefined {
  return process.env.GT_TOWN || undefined;
}
// Then in executeCommand:
cwd: config.cwd || getTownCwd()
```

### 4. Circuit Breaker Trips and Stays Tripped

**Problem**: After CLI failures, circuit breaker opens and ALL subsequent calls fail,
even after fixing the underlying issue.

**Fix**: Added circuit breaker reset endpoint:
```bash
curl "http://localhost:5176/api/gastown/diagnostics?reset-circuit=true"
```

### 5. Beads Database Sync Issues

**Problem**: Database can get out of sync with JSONL, causing import failures.

**Symptoms**:
- "LEGACY DATABASE DETECTED" error
- "Database out of sync with JSONL" error
- "Database locked" errors

**Fix**:
```bash
cd $GT_TOWN
bd daemon stop                    # Stop any running daemon
rm -f .beads/*.db .beads/*.db-*   # Remove database files
bd init --prefix=hq               # Reinitialize
bd sync --import-only             # Import from JSONL
```

### 6. Invalid Issue Types Cause Import Failures

**Problem**: Agents sometimes create beads with invalid types like "message" which
causes database import to fail.

**Valid types**: task, bug, feature, epic, chore
**Invalid types**: message, merge_request, convoy, agent

**Fix**: Clean JSONL file or reinitialize database with fresh beads.

### 7. Route Groups Changed File Paths

**Problem**: Routes were moved to `(app)` route group, changing paths:
- Old: `src/routes/+page.svelte`
- New: `src/routes/(app)/+page.svelte`

**Impact**: When searching for route files, check both locations.

### 8. UI Server Port May Vary

**Problem**: If port 5174 is in use, vite picks 5175, 5176, etc.

**Fix**: Check server output for actual port:
```
VITE v6.4.1  ready in 817 ms
  ➜  Local:   http://localhost:5176/   <-- actual port
```

### 9. Always Pause Deacon Before Testing

**Problem**: Running deacon consumes tokens and can interfere with testing.

**Fix**: Always start with:
```bash
gt deacon pause --reason="UI testing"
```

### 10. Test Pages in Browser, Not Just HTTP

**Problem**: HTTP 200 doesn't mean page works - content may show errors.

**Fix**: Use Claude in Chrome to visually verify page content, not just status codes.

---

## Revision History

| Date | Changes |
|------|---------|
| 2025-01-24 | Initial plan created |
| 2025-01-24 | Added testing session discoveries, token conservation |
| 2025-01-24 | **Major revision**: Added test tiers, fixtures, health gate, parameterized paths, detail page tests, form validation, error states, Claude in Chrome, model selection, improved scripts |
| 2025-01-24 | **Session results**: All pages passing after ProcessSupervisor fix (bb9ca56). Added Activity and Workflows pages. Added "Lessons Learned" section with 10 pitfalls to avoid. |

---

*Gas Town UI Version: Development*
*Test Environment: Parameterized (see Phase 1)*
*Browser Testing: Claude in Chrome (MCP)*

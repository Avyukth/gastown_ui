# Gas Town UI - Design Improvement Plan

> Comprehensive improvement roadmap based on desktop, tablet, and mobile design audit.
> Each item includes acceptance criteria for verification.

---

## Table of Contents

1. [Global Design System](#1-global-design-system)
2. [Dashboard](#2-dashboard)
3. [Work](#3-work)
4. [Agents](#4-agents)
5. [Mail](#5-mail)
6. [Queue](#6-queue)
7. [Convoys](#7-convoys)
8. [Workflows](#8-workflows)
9. [Rigs](#9-rigs)
10. [Alerts](#10-alerts)
11. [Health](#11-health)
12. [Activity](#12-activity)
13. [Watchdog](#13-watchdog)
14. [Crew](#14-crew)
15. [Dogs](#15-dogs)
16. [Settings](#16-settings)
17. [Logs](#17-logs)
18. [Responsive Layout System](#18-responsive-layout-system)
19. [Search Button & Touch Target Fixes](#19-search-button--touch-target-fixes)

---

## 1. Global Design System

### 1.1 Icon System Overhaul

**Priority:** High

**Current Issues:**
- Work icon (target) doesn't convey tasks
- Workflows icon (flask) suggests chemistry, not workflows
- Dogs icon (gear) conflicts with Settings
- Rigs icon (chart) doesn't convey project containers

**Changes Required:**

| Current Icon | New Icon | Rationale |
|--------------|----------|-----------|
| Work (target) | Briefcase or checkbox-list | Better conveys tasks/work items |
| Workflows (flask) | Git-branch or flow-chart | Represents process flows |
| Dogs (gear) | Shield or dog | Matches "Deacon Dogs" security theme |
| Rigs (chart) | Server or folder-tree | Represents project containers |

**Acceptance Criteria:**
- [ ] All sidebar icons use consistent 20px size
- [ ] All icons use 1.5px stroke weight
- [ ] Active state uses orange (#F97316) fill or stroke
- [ ] Inactive state uses gray (#6B7280)
- [ ] Icons are from same icon library (Lucide recommended)
- [ ] Hover state shows subtle color transition (200ms)
- [ ] All icons have appropriate aria-label for accessibility

---

### 1.2 Page Title Standardization

**Priority:** Medium

**Current Issues:**
- Inconsistent casing: "GASTOWN" vs "Mail Inbox" vs "WORKFLOWS"
- Some pages use orange accent bar, others don't

**Acceptance Criteria:**
- [ ] All page titles use Title Case (e.g., "Mail Inbox", "Merge Queue")
- [ ] Page title font: 24px semi-bold on desktop, 20px on mobile
- [ ] Consistent left alignment across all pages
- [ ] Orange accent bar removed or applied consistently to all pages
- [ ] Subtitle/description text uses muted gray (#6B7280), 14px

---

### 1.3 Color System Enhancement

**Priority:** Medium

**Current Issues:**
- Design is overly monochromatic
- Unread indicators too subtle
- CTA buttons appear washed out

**Acceptance Criteria:**
- [ ] Primary orange CTA buttons use #F97316 (not lighter variants)
- [ ] Unread indicators use bold blue dot (8px) + semi-bold text
- [ ] Status colors defined and consistent:
  - Success/Healthy: #22C55E
  - Warning/Degraded: #F59E0B
  - Error/Critical: #EF4444
  - Info/Neutral: #3B82F6
- [ ] Background patterns (dots) removed or opacity reduced to < 5%
- [ ] Card backgrounds use subtle elevation (shadow-sm) instead of patterns

---

### 1.4 Typography Scale

**Priority:** Low

**Acceptance Criteria:**
- [ ] Heading 1: 24px/1.2 semi-bold
- [ ] Heading 2: 20px/1.3 semi-bold
- [ ] Heading 3: 16px/1.4 medium
- [ ] Body: 14px/1.5 regular
- [ ] Small/Caption: 12px/1.4 regular
- [ ] Monospace (code): JetBrains Mono, 13px
- [ ] Section labels: 10px uppercase, letter-spacing 0.1em, muted color

---

## 2. Dashboard

### 2.1 Agent Cards Enhancement

**Priority:** High

**Current Issues:**
- Cards lack visual hierarchy
- All information appears equally weighted
- No differentiation between agent types

**Acceptance Criteria:**
- [ ] Agent name displayed as primary text (16px semi-bold)
- [ ] Role displayed with role-specific icon (12px muted)
- [ ] Status badge (IDLE/RUNNING) uses appropriate color coding
- [ ] Running agents show green pulse animation on status dot
- [ ] Cards have hover state with subtle elevation increase
- [ ] Role-specific accent color on left border (4px):
  - Coordinator: Blue
  - Health-check: Green
  - Witness: Purple
  - Refinery: Orange
  - Crew: Gray

---

### 2.2 Workflow Progress Visualization

**Priority:** Medium

**Current Issues:**
- Workflow items show text only (65%, Pending, Completed)
- No visual progress indication

**Acceptance Criteria:**
- [ ] Percentage workflows display circular progress ring (24px diameter)
- [ ] Progress ring uses brand orange for fill
- [ ] "Pending" status shows clock icon + yellow dot
- [ ] "Completed" status shows checkmark icon + green dot
- [ ] Hover reveals tooltip with workflow details
- [ ] Click navigates to workflow detail page

---

### 2.3 System Stats Cards

**Priority:** Medium

**Current Issues:**
- Stats on right side lack context
- Percentage changes (+12.0%) lack baseline

**Acceptance Criteria:**
- [ ] Each stat card includes descriptive icon
- [ ] Stat value uses 32px bold font
- [ ] Percentage change shows up/down arrow indicator
- [ ] Tooltip explains comparison period ("vs. yesterday")
- [ ] Sparkline graph (48px wide) shows 7-day trend
- [ ] Cards are clickable, navigate to relevant detail page

---

## 3. Work

### 3.1 Form Layout Optimization

**Priority:** High

**Current Issues:**
- Form spans full width (excessive)
- No required field indicators
- Select dropdowns lack visual distinction

**Acceptance Criteria:**
- [ ] Form container max-width: 640px
- [ ] Form centered on page with adequate margins
- [ ] Required fields marked with red asterisk (*)
- [ ] Select dropdowns have chevron-down icon
- [ ] Select dropdowns have distinct border style from text inputs
- [ ] Form sections have 24px vertical spacing
- [ ] Input fields have 12px vertical spacing within sections

---

### 3.2 CTA Button Enhancement

**Priority:** High

**Current Issues:**
- "Create Issue" button color is washed out
- No loading state indication

**Acceptance Criteria:**
- [ ] Primary CTA uses #F97316 background, white text
- [ ] Button has hover state: darken 10%
- [ ] Button has active state: darken 15%
- [ ] Loading state shows spinner icon replacing text
- [ ] Disabled state uses 50% opacity
- [ ] Button minimum width: 120px
- [ ] Button padding: 12px 24px

---

### 3.3 Issue Type Selection

**Priority:** Medium

**Current Issues:**
- Checkbox items lack hover feedback
- No visual grouping

**Acceptance Criteria:**
- [ ] Checkbox items have hover background (#F3F4F6)
- [ ] Selected items have orange left border (3px)
- [ ] Checkmark uses brand orange color
- [ ] Items grouped in card with subtle border
- [ ] Each issue type has descriptive icon

---

## 4. Agents

### 4.1 Agent Card Redesign

**Priority:** High

**Current Issues:**
- Cards feel sparse
- No differentiation between agent types
- Uptime lacks label

**Acceptance Criteria:**
- [ ] Card displays agent avatar/icon (40px) - generated or role-based
- [ ] Agent name uses 16px semi-bold
- [ ] Role displayed below name with icon (14px muted)
- [ ] Status badge positioned top-right of card
- [ ] Uptime displays with clock icon and "Uptime:" label
- [ ] Cards show action buttons on hover (Start, Stop, Configure)
- [ ] Card minimum height: 120px

---

### 4.2 Filtering & Sorting

**Priority:** Medium

**Current Issues:**
- No filtering or sorting options
- Can't quickly find specific agents

**Acceptance Criteria:**
- [ ] Filter dropdown: All, Running, Idle, Error
- [ ] Sort dropdown: Name (A-Z), Name (Z-A), Uptime, Status
- [ ] Search input for agent name filtering
- [ ] Active filters shown as removable pills
- [ ] Filter state persisted in URL params
- [ ] Empty state shows "No agents match filters" with clear button

---

### 4.3 Grid Layout Optimization

**Priority:** Low

**Acceptance Criteria:**
- [ ] Desktop: 3-column grid (min-width: 280px per card)
- [ ] Tablet: 2-column grid
- [ ] Mobile: 1-column stack
- [ ] Gap between cards: 16px
- [ ] Cards have equal height within row (CSS Grid)

---

## 5. Mail

### 5.1 Split-View Layout (Desktop)

**Priority:** Critical

**Current Issues:**
- Single column wastes screen space
- No compose button visible
- Excessive empty space

**Acceptance Criteria:**
- [ ] Desktop (>1024px): Two-panel layout
  - Left panel (mail list): 380px fixed width
  - Right panel (reading pane): Remaining space
- [ ] Panel divider is draggable (min 300px, max 500px for list)
- [ ] Selected mail highlighted in list with orange left border
- [ ] Reading pane shows "Select a message" when none selected
- [ ] Keyboard navigation: Up/Down arrows change selection
- [ ] Panel layout preference saved to localStorage

---

### 5.2 Compose Button & Actions

**Priority:** Critical

**Current Issues:**
- No visible compose button on desktop
- Missing common mail actions

**Acceptance Criteria:**
- [ ] Desktop: "Compose" button in header (primary style with + icon)
- [ ] Mobile/Tablet: Floating Action Button (FAB) bottom-right, 56px
- [ ] FAB uses brand orange, white + icon
- [ ] FAB has shadow-lg for elevation
- [ ] Header includes action buttons: Refresh, Mark All Read, Filter
- [ ] Bulk selection mode with checkbox column
- [ ] Bulk actions: Delete, Mark Read, Archive

---

### 5.3 Mail List Item Redesign

**Priority:** High

**Current Issues:**
- "MESSAGE" badge is redundant
- Metadata lacks hierarchy
- Unread indicator too subtle

**Acceptance Criteria:**
- [ ] Remove generic "MESSAGE" badge
- [ ] Show message type badge only for special types (ESCALATION, HANDOFF, ERROR)
- [ ] Unread messages:
  - Bold sender name and subject
  - Blue dot indicator (8px)
  - Subtle background tint (#EFF6FF)
- [ ] Read messages: Regular weight, no indicator
- [ ] Timestamp right-aligned, muted color
- [ ] Preview text: 1 line, truncated with ellipsis
- [ ] Hover state: Light gray background

---

### 5.4 Empty State Design

**Priority:** Medium

**Current Issues:**
- "No messages in inbox" lacks visual appeal
- No guidance for users

**Acceptance Criteria:**
- [ ] Empty state includes illustration (inbox icon, 64px)
- [ ] Primary text: "Your inbox is empty" (18px semi-bold)
- [ ] Secondary text: "New messages will appear here" (14px muted)
- [ ] Optional CTA: "Send a test message" link
- [ ] Centered vertically and horizontally in content area

---

### 5.5 Remove Background Pattern

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Dotted background pattern removed from mail page
- [ ] Background uses solid color (#FAFAFA light mode, #0A0A0B dark mode)
- [ ] Content area has subtle border or shadow for definition

---

## 6. Queue

### 6.1 Queue Visualization

**Priority:** High

**Current Issues:**
- No queue visualization when items exist
- Empty state lacks illustration

**Acceptance Criteria:**
- [ ] Queue items displayed as cards with:
  - Position number (#1, #2, etc.) in circle
  - Branch/PR name as primary text
  - Author avatar and name
  - Time in queue
  - Progress bar showing merge status
  - Action buttons: Promote, Remove, View Details
- [ ] Queue header shows total count and estimated time
- [ ] Auto-refresh every 30 seconds with indicator
- [ ] New items animate in from top

---

### 6.2 Empty State Enhancement

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Empty state illustration (queue/list icon, 64px)
- [ ] Primary text: "Merge queue is empty" (18px semi-bold)
- [ ] Secondary text: "Branches ready to merge will appear here" (14px muted)
- [ ] Link to documentation: "Learn about the merge queue"

---

### 6.3 Queue Statistics Header

**Priority:** Low

**Acceptance Criteria:**
- [ ] Stats bar shows even when queue empty:
  - Total processed today
  - Average wait time
  - Success rate
- [ ] Stats update in real-time
- [ ] Clicking stat shows historical chart

---

## 7. Convoys

### 7.1 Code Snippet Styling

**Priority:** Medium

**Current Issues:**
- Code snippet lacks proper styling
- No copy button

**Acceptance Criteria:**
- [ ] Code block has dark background (#1F2937)
- [ ] Monospace font (JetBrains Mono)
- [ ] Syntax highlighting for command
- [ ] Copy button in top-right corner
- [ ] "Copied!" tooltip on successful copy
- [ ] Border radius: 8px
- [ ] Padding: 16px

---

### 7.2 Empty State with Onboarding

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Illustration showing convoy concept (truck/batch icon)
- [ ] "What are Convoys?" expandable section
- [ ] Step-by-step guide: 1. Create, 2. Add items, 3. Execute
- [ ] "Create Convoy" CTA button (primary style)
- [ ] Link to full documentation

---

### 7.3 Convoy List Design

**Priority:** High (when convoys exist)

**Acceptance Criteria:**
- [ ] Convoy card shows:
  - Convoy name/ID
  - Item count
  - Status (Pending, In Progress, Complete)
  - Progress bar
  - Created timestamp
  - Creator name
- [ ] Expandable to show convoy items
- [ ] Actions: Start, Pause, Cancel, Delete

---

## 8. Workflows

### 8.1 Loading State Fix

**Priority:** Critical

**Current Issues:**
- "..." doesn't indicate loading
- No skeleton states

**Acceptance Criteria:**
- [ ] Loading state shows skeleton loaders (pulsing gray bars)
- [ ] Skeleton matches final content layout
- [ ] Loading spinner for actions (not content)
- [ ] Error state shows retry button
- [ ] Loading timeout: Show error after 10 seconds

---

### 8.2 Stats Cards Enhancement

**Priority:** High

**Acceptance Criteria:**
- [ ] Each stat card includes:
  - Descriptive icon (matching stat type)
  - Stat label (14px muted)
  - Stat value (24px bold)
  - Trend indicator (if applicable)
- [ ] Tooltips explain each stat:
  - Active: Currently running workflows
  - Wisps: Ephemeral/temporary workflows
  - Stale: Workflows not updated recently
- [ ] Cards link to filtered workflow list

---

### 8.3 Workflow List

**Priority:** High

**Acceptance Criteria:**
- [ ] Below stats, show list of workflows
- [ ] Workflow item shows:
  - Name
  - Type (Molecule/Formula)
  - Status
  - Last run timestamp
  - Actions (Run, Edit, Delete)
- [ ] Tabs filter: All, Molecules, Formulas
- [ ] Search input for workflow name
- [ ] Pagination or infinite scroll for long lists

---

## 9. Rigs

### 9.1 Rig Card Enhancement

**Priority:** Medium

**Current Issues:**
- "G" avatar is inconsistent
- Links lack visual context

**Acceptance Criteria:**
- [ ] Rig avatar uses generated icon or first letter with colored background
- [ ] Avatar color based on rig name hash (consistent)
- [ ] Witness link has eye icon prefix
- [ ] Refinery link has factory icon prefix
- [ ] Rig details expandable inline
- [ ] Expanded view shows:
  - Full path
  - Creation date
  - Associated agents
  - Quick actions

---

### 9.2 Add Rig Form

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Form in modal or slide-over panel
- [ ] Fields: Rig name, Path, Description
- [ ] Path field has folder browser button
- [ ] Validation: Name required, path must exist
- [ ] Cancel and Create buttons
- [ ] Success creates rig and shows in list

---

### 9.3 Rig Structure Visualization

**Priority:** Low

**Acceptance Criteria:**
- [ ] Optional tree view showing rig hierarchy
- [ ] Visual connection lines between components
- [ ] Color coding by component type
- [ ] Toggle between list and tree view

---

## 10. Alerts

### 10.1 Terminology Consistency

**Priority:** High

**Current Issues:**
- Sidebar says "Alerts", page says "Escalations"

**Acceptance Criteria:**
- [ ] Consistent terminology throughout (choose one: Alerts or Escalations)
- [ ] Sidebar label matches page title
- [ ] All references in code and UI updated

---

### 10.2 Alert History

**Priority:** Medium

**Acceptance Criteria:**
- [ ] "View History" link below current status
- [ ] History shows last 50 alerts
- [ ] Each alert shows:
  - Timestamp
  - Severity (icon + color)
  - Message
  - Resolution status
  - Resolver (if applicable)
- [ ] Filter by: All, Critical, Warning, Info
- [ ] Filter by: Resolved, Unresolved

---

### 10.3 Alert Card Design (When Alerts Exist)

**Priority:** High

**Acceptance Criteria:**
- [ ] Alert card shows:
  - Severity icon (warning triangle, error circle, info circle)
  - Severity color coding (red/yellow/blue border)
  - Alert title (bold)
  - Alert message
  - Timestamp
  - Source/origin
  - Action buttons: Acknowledge, Resolve, Snooze
- [ ] Critical alerts have red background tint
- [ ] Unacknowledged alerts pulse subtly

---

## 11. Health

### 11.1 Status Icons in Cards

**Priority:** Medium

**Current Issues:**
- Status cards lack icons
- All caps headers inconsistent

**Acceptance Criteria:**
- [ ] Each status card has relevant icon:
  - Overall: Heart or shield
  - Boot Triage: Boot/startup icon
  - Chain Link: Chain icon
- [ ] Status icon color matches status (green/yellow/red)
- [ ] Headers use Title Case, not ALL CAPS

---

### 11.2 Health History Graph

**Priority:** Low

**Acceptance Criteria:**
- [ ] Sparkline or area chart showing 24-hour health
- [ ] Green = healthy, Yellow = degraded, Red = unhealthy
- [ ] Hover shows timestamp and status
- [ ] Chart height: 48px
- [ ] Positioned below status cards

---

### 11.3 Last Updated Indicator

**Priority:** Medium

**Acceptance Criteria:**
- [ ] "Last updated: X seconds ago" in header
- [ ] Auto-refresh every 30 seconds
- [ ] Refresh button for manual update
- [ ] Stale indicator (>2 min) shows warning

---

## 12. Activity

### 12.1 Event Icon Differentiation

**Priority:** Medium

**Current Issues:**
- Event icons are small and similar
- Hard to scan quickly

**Acceptance Criteria:**
- [ ] Event icons increased to 24px
- [ ] Each event type has distinct icon:
  - session_start: Play circle (green)
  - session_end: Stop circle (gray)
  - nudge: Bell (orange)
  - handoff: Arrow-right-left (blue)
  - error: Alert circle (red)
- [ ] Icon has colored background circle (32px)

---

### 12.2 Expandable Event Details

**Priority:** Medium

**Current Issues:**
- Long descriptions truncated
- No way to see full details

**Acceptance Criteria:**
- [ ] Event row clickable to expand
- [ ] Expanded view shows:
  - Full message (no truncation)
  - Metadata (actor, target, duration)
  - Related events link
  - Copy event ID button
- [ ] Smooth expand/collapse animation (200ms)

---

### 12.3 Sticky Date Headers

**Priority:** Low

**Acceptance Criteria:**
- [ ] Date headers (TODAY, YESTERDAY, etc.) sticky on scroll
- [ ] Header has subtle background blur
- [ ] Shows current section date when scrolling
- [ ] Smooth transition between dates

---

### 12.4 Load More / Pagination

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Initial load: 50 events
- [ ] "Load more" button at bottom
- [ ] Or: Infinite scroll with loading indicator
- [ ] Total event count shown in header
- [ ] Option to jump to specific date

---

## 13. Watchdog

### 13.1 Tier Icons

**Priority:** Low

**Current Issues:**
- Tier boxes lack function icons

**Acceptance Criteria:**
- [ ] Each tier has descriptive icon:
  - Tier 1 (Daemon): Gear/cog icon
  - Tier 2 (Boot): Boot/startup icon
  - Tier 3 (Deacon): Shield icon
- [ ] Icons positioned in tier box header
- [ ] Icon color matches tier status

---

### 13.2 Error State Design

**Priority:** High

**Acceptance Criteria:**
- [ ] Broken chain shows red X between tiers
- [ ] Failed tier has red border and background tint
- [ ] Error message displayed below failed tier
- [ ] "Troubleshoot" button links to docs
- [ ] Recovery actions shown (Restart, Reset)

---

### 13.3 Chain Status Banner

**Priority:** Medium

**Current Issues:**
- Green-on-green is low contrast

**Acceptance Criteria:**
- [ ] Success banner: Green icon + dark text on light green bg
- [ ] Warning banner: Yellow icon + dark text on light yellow bg
- [ ] Error banner: Red icon + white text on red bg
- [ ] Banner includes status text and timestamp
- [ ] Dismissible with X button (reappears on status change)

---

## 14. Crew

### 14.1 Empty State Enhancement

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Illustration: Team/people icon (64px)
- [ ] Primary text: "No crew workspaces yet"
- [ ] Secondary text: "Create a workspace to collaborate with your team"
- [ ] CTA button: "Create Crew Workspace" (primary style)
- [ ] Link: "Learn about crew workspaces"

---

### 14.2 Crew Member Card Design

**Priority:** High (when crew exists)

**Acceptance Criteria:**
- [ ] Card shows:
  - Avatar (generated from name)
  - Member name
  - Role/title
  - Status indicator (Online, Away, Offline)
  - Last active timestamp
  - Quick actions: Message, View Profile
- [ ] Cards in responsive grid (same as Agents)
- [ ] Online members sorted first

---

### 14.3 About Section Formatting

**Priority:** Low

**Current Issues:**
- Bullet points styled inconsistently

**Acceptance Criteria:**
- [ ] Bullet points use consistent icon (check or arrow)
- [ ] Bold term followed by colon and description
- [ ] Consistent spacing between items (12px)
- [ ] Section collapsible with smooth animation

---

## 15. Dogs

### 15.1 Sidebar Icon Fix

**Priority:** High

**Current Issues:**
- Gear icon doesn't match "Deacon Dogs" theme

**Acceptance Criteria:**
- [ ] Sidebar icon changed to shield or dog icon
- [ ] Icon consistent with page content
- [ ] Active state uses brand orange

---

### 15.2 Unknown State Guidance

**Priority:** High

**Current Issues:**
- "Unknown" status lacks context
- No troubleshooting guidance

**Acceptance Criteria:**
- [ ] "Unknown" status shows info icon with tooltip
- [ ] Tooltip explains why status is unknown
- [ ] Link to troubleshooting documentation
- [ ] Suggested actions listed below status card

---

### 15.3 Historical Patrol Data

**Priority:** Low

**Acceptance Criteria:**
- [ ] "View History" link on patrol count card
- [ ] History shows last 50 patrols
- [ ] Each patrol shows: timestamp, duration, result
- [ ] Summary stats: Success rate, avg duration

---

## 16. Settings

### 16.1 Agent Selection Enhancement

**Priority:** Medium

**Current Issues:**
- Selected agent not obvious enough
- Command text truncated

**Acceptance Criteria:**
- [ ] Selected agent card has:
  - Orange border (2px)
  - Checkmark badge in corner
  - "Selected" label
- [ ] Full command visible (wrap or expand)
- [ ] Hover shows full command in tooltip
- [ ] Agent description/capabilities shown

---

### 16.2 Save Confirmation

**Priority:** High

**Current Issues:**
- No feedback after saving

**Acceptance Criteria:**
- [ ] Toast notification on successful save
- [ ] Toast: Green checkmark, "Settings saved" message
- [ ] Toast auto-dismisses after 3 seconds
- [ ] Error toast (red) if save fails
- [ ] Button shows loading spinner during save

---

### 16.3 CTA Button Styling

**Priority:** Medium

**Acceptance Criteria:**
- [ ] "Save" button uses primary orange (#F97316)
- [ ] Button has consistent styling with other pages
- [ ] Disabled state when no changes made
- [ ] Hover and active states defined

---

## 17. Logs

### 17.1 Log Level Visual Distinction

**Priority:** Medium

**Current Issues:**
- All log entries look similar except badge

**Acceptance Criteria:**
- [ ] Log entries have subtle background tint by level:
  - INF: No tint (default)
  - WRN: Light yellow (#FEF3C7)
  - ERR: Light red (#FEE2E2)
  - DBG: Light gray (#F3F4F6)
- [ ] Error entries have bold text
- [ ] Left border color matches log level (4px)

---

### 17.2 Copy Log Entry

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Copy button appears on hover (right side)
- [ ] Click copies full log entry to clipboard
- [ ] "Copied!" tooltip confirmation
- [ ] Button icon: Clipboard or copy icon

---

### 17.3 Timestamp Enhancement

**Priority:** Low

**Acceptance Criteria:**
- [ ] Timestamps more prominent (semi-bold)
- [ ] Relative time on hover ("2 minutes ago")
- [ ] Click timestamp to copy
- [ ] Option to toggle absolute/relative time

---

### 17.4 Line Numbers

**Priority:** Low

**Acceptance Criteria:**
- [ ] Optional line numbers column (toggleable)
- [ ] Line numbers in muted color
- [ ] Click line number to copy log entry
- [ ] Line numbers help with referencing specific logs

---

## 18. Responsive Layout System

### 18.1 Breakpoint Definitions

**Priority:** Critical

**Acceptance Criteria:**
- [ ] Breakpoints defined in CSS/Tailwind config:
  - `sm`: 480px (large phone)
  - `md`: 768px (tablet portrait)
  - `lg`: 1024px (tablet landscape)
  - `xl`: 1280px (desktop)
  - `2xl`: 1536px (large desktop)
- [ ] All pages tested at each breakpoint
- [ ] No horizontal scroll at any breakpoint
- [ ] Content readable without zooming

---

### 18.2 Mobile Layout (< 768px)

**Priority:** Critical

**Current Issues:**
- Content truncation at narrow widths
- Touch targets too small
- No FAB for compose

**Acceptance Criteria:**
- [ ] Bottom navigation height: 64px
- [ ] Touch targets minimum: 44x44px
- [ ] FAB for primary action (compose) on relevant pages
- [ ] FAB position: bottom-right, 16px margin, above bottom nav
- [ ] Single column content layout
- [ ] Full-width cards with 16px horizontal padding
- [ ] Header height: 56px
- [ ] Pull-to-refresh on all list pages

---

### 18.3 Tablet Layout (768px - 1024px)

**Priority:** High

**Acceptance Criteria:**
- [ ] Option for slim sidebar (60px icons only) + bottom nav
- [ ] OR: Full bottom nav without sidebar
- [ ] Split-view available for Mail, Queue pages
- [ ] Bottom nav height: 72px on tablet
- [ ] Touch targets: 48x48px minimum
- [ ] Two-column grid for card layouts
- [ ] Search in header (not FAB)

---

### 18.4 Desktop Layout (> 1024px)

**Priority:** High

**Acceptance Criteria:**
- [ ] Full sidebar visible (240px expanded)
- [ ] Sidebar collapsible to icon-only (60px)
- [ ] Collapse state saved to localStorage
- [ ] No bottom navigation
- [ ] Split-view default for Mail page
- [ ] Three-column grid for card layouts
- [ ] Keyboard shortcuts visible (⌘K, etc.)

---

### 18.5 Touch vs. Pointer Detection

**Priority:** Medium

**Acceptance Criteria:**
- [ ] CSS `@media (pointer: coarse)` for touch devices
- [ ] Touch: Larger tap targets, no hover states
- [ ] Pointer: Smaller targets OK, hover states enabled
- [ ] Hybrid devices handled gracefully
- [ ] No hover-only interactions (all accessible via tap)

---

### 18.6 Orientation Change Handling

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Smooth layout transition on rotation
- [ ] No content jump or flash
- [ ] Scroll position preserved
- [ ] Modal/drawer state preserved
- [ ] CSS transitions for layout changes (300ms)

---

### 18.7 PWA Enhancements

**Priority:** Medium

**Acceptance Criteria:**
- [ ] Offline indicator in header when disconnected
- [ ] Skeleton loading states for all async content
- [ ] apple-touch-icon for all device sizes
- [ ] Splash screens for tablet dimensions
- [ ] manifest.json includes tablet screenshots
- [ ] Service worker caches critical assets

---

## 19. Search Button & Touch Target Fixes

### 19.1 Floating Search Button Blocking Content

**Priority:** Critical

**Current Issues:**
- Floating search button (FAB style) positioned at bottom-right
- Overlaps with content cards and badges (e.g., "Running", "Degraded")
- Almost touches the bottom navigation
- Blocks scrollable content area

**Solution Options:**

#### Option A: Move Search to Header (Recommended)

```css
/* Remove floating search button on mobile */
@media (max-width: 768px) {
  .floating-search-btn {
    display: none;
  }

  /* Add search icon in header instead */
  .mobile-header-search {
    display: flex;
    width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: transparent;
    transition: background-color 0.15s ease;
  }

  .mobile-header-search:active {
    background: rgba(0, 0, 0, 0.05);
  }
}
```

#### Option B: Reposition FAB with Safe Area

```css
.floating-search-btn {
  position: fixed;
  /* Move higher to avoid bottom nav overlap */
  bottom: calc(70px + env(safe-area-inset-bottom) + 16px);
  right: 16px;
  z-index: 100;

  /* Proper sizing */
  width: 56px;
  height: 56px;
  border-radius: 16px;

  /* Add shadow for layering */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* On larger screens, reduce bottom offset */
@media (min-width: 769px) {
  .floating-search-btn {
    bottom: 24px;
  }
}
```

#### Option C: Expandable Search Bar

```svelte
<!-- Expandable search that slides in from top -->
<header>
  <button on:click={toggleSearch} class="search-trigger">
    <SearchIcon />
  </button>
  {#if searchOpen}
    <div class="search-overlay" transition:slide>
      <input
        type="search"
        bind:this={searchInput}
        placeholder="Search..."
        class="search-input"
      />
      <button on:click={closeSearch}>
        <XIcon />
      </button>
    </div>
  {/if}
</header>
```

**Acceptance Criteria:**
- [ ] Search button does not overlap any content at any viewport size
- [ ] Search button has minimum 16px clearance from bottom navigation
- [ ] Search button respects `env(safe-area-inset-bottom)` on iOS
- [ ] Search is accessible via header on mobile (< 768px)
- [ ] FAB style only used on tablet+ if needed
- [ ] Search input has proper focus management
- [ ] Escape key closes expanded search

---

### 19.2 Bottom Navigation Touch Targets

**Priority:** Critical

**Current Issues:**
- Icons appear to be ~24px with minimal padding
- Total touch area likely under 44x44px (Apple minimum) / 48x48dp (Material)
- Labels cut off on smaller screens
- "Stop Claude" button interferes with navigation

**CSS Solution:**

```css
.bottom-nav {
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
}

.bottom-nav-item {
  /* Minimum 48x48px touch target */
  min-width: 64px;
  min-height: 48px;
  padding: 8px 12px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;

  /* Visual feedback */
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.bottom-nav-item:active {
  background: rgba(0, 0, 0, 0.05);
}

.bottom-nav-item.active {
  color: var(--primary-orange);
}

.bottom-nav-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.bottom-nav-label {
  font-size: 10px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
  overflow: hidden;
}

/* Small phones (< 375px) */
@media (max-width: 374px) {
  .bottom-nav-item {
    min-width: 56px;
    padding: 6px 8px;
  }
  .bottom-nav-label {
    font-size: 9px;
  }
}

/* Tablet */
@media (min-width: 768px) {
  .bottom-nav {
    height: 72px;
  }
  .bottom-nav-item {
    min-width: 80px;
    gap: 6px;
  }
  .bottom-nav-label {
    font-size: 12px;
  }
}
```

**Acceptance Criteria:**
- [ ] All bottom nav items have minimum 48x48px touch target
- [ ] Bottom nav height is 64px on mobile, 72px on tablet
- [ ] Safe area inset respected on iOS devices with notch
- [ ] Labels visible and not truncated on screens ≥ 375px
- [ ] Active state clearly visible (orange color)
- [ ] Touch feedback visible on tap (background change)
- [ ] Icons centered within touch target

---

### 19.3 Sidebar Taking Space on Mobile

**Priority:** Critical

**Current Issues:**
- Sidebar partially visible on mobile
- Squeezes content into ~120px width
- Layout breaks at narrow viewports

**CSS Solution:**

```css
/* Hide sidebar completely on mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -100%;
    width: 280px;
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height */
    transition: left 0.3s ease;
    z-index: 200;
    background: var(--card-bg);
    border-right: 1px solid var(--border-color);
  }

  .sidebar.open {
    left: 0;
  }

  /* Overlay when sidebar is open */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 199;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }

  .sidebar-overlay.visible {
    opacity: 1;
    pointer-events: auto;
  }

  /* Main content should take full width */
  .main-content {
    margin-left: 0;
    width: 100%;
    min-width: 0; /* Prevent overflow */
  }
}

/* Tablet - optional slim sidebar */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar {
    width: 60px; /* Icon-only mode */
  }

  .sidebar-label {
    display: none;
  }

  .main-content {
    margin-left: 60px;
  }
}

/* Desktop - full sidebar */
@media (min-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .sidebar.collapsed {
    width: 60px;
  }

  .sidebar.collapsed .sidebar-label {
    display: none;
  }

  .main-content {
    margin-left: 240px;
    transition: margin-left 0.3s ease;
  }

  .sidebar.collapsed + .main-content {
    margin-left: 60px;
  }
}
```

**Acceptance Criteria:**
- [ ] Sidebar completely hidden on mobile (< 768px)
- [ ] Main content takes full viewport width on mobile
- [ ] No horizontal scrolling at any mobile viewport
- [ ] Sidebar accessible via hamburger menu on mobile
- [ ] Overlay appears when mobile sidebar open
- [ ] Tap overlay closes sidebar
- [ ] Escape key closes sidebar
- [ ] Focus trapped within open sidebar

---

### 19.4 Sidebar Navigation Touch Points

**Priority:** High

**Current Issues:**
- Sidebar nav items may have insufficient padding
- Active state highlight doesn't extend to full width

**CSS Solution:**

```css
.sidebar-nav-item {
  /* Full-width touch target */
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  min-height: 44px;
  width: calc(100% - 16px);
  margin: 2px 8px;

  /* Visual styling */
  border-radius: 8px;
  color: var(--muted-foreground);
  text-decoration: none;
  transition: all 0.15s ease;
}

.sidebar-nav-item:hover {
  background-color: rgba(249, 115, 22, 0.08);
  color: var(--foreground);
}

.sidebar-nav-item:active {
  background-color: rgba(249, 115, 22, 0.12);
}

.sidebar-nav-item.active {
  background-color: rgba(249, 115, 22, 0.15);
  color: #F97316;
}

.sidebar-nav-item.active .sidebar-nav-icon {
  color: #F97316;
}

.sidebar-nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.sidebar-nav-label {
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Badge for unread counts */
.sidebar-nav-badge {
  margin-left: auto;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background: #EF4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
```

**Acceptance Criteria:**
- [ ] All sidebar items have minimum 44px height
- [ ] Touch target extends full width of sidebar (minus padding)
- [ ] Hover state visible on desktop
- [ ] Active state clearly distinguishes current page
- [ ] Badge counts visible and properly positioned
- [ ] Smooth color transitions (150ms)
- [ ] Proper focus ring for keyboard navigation

---

### 19.5 "More" Menu Touch & UX

**Priority:** High

**Current Issues:**
- "More" button opens a grid of icons
- Many options require second tap
- No visual indication of current section when in "More" items

**CSS Solution:**

```css
.more-menu {
  position: fixed;
  bottom: 64px; /* Above bottom nav */
  left: 0;
  right: 0;
  background: var(--card-bg);
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
  max-height: 60vh;
  overflow-y: auto;

  /* Animation */
  transform: translateY(100%);
  transition: transform 0.3s cubic-bezier(0.32, 0.72, 0, 1);
  z-index: 150;
}

.more-menu.open {
  transform: translateY(0);
}

.more-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.more-menu-title {
  font-size: 16px;
  font-weight: 600;
}

.more-menu-close {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.more-menu-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  min-height: 52px;
  border-radius: 12px;
  color: var(--foreground);
  text-decoration: none;
  transition: background-color 0.15s ease;
}

.more-menu-item:active {
  background: rgba(0, 0, 0, 0.05);
}

.more-menu-item.active {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.more-menu-icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.more-menu-label {
  font-size: 15px;
  font-weight: 500;
}

/* Backdrop */
.more-menu-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 149;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.more-menu-backdrop.visible {
  opacity: 1;
  pointer-events: auto;
}
```

**Svelte Component Enhancement:**

```svelte
<script>
  // If current page is in "More" menu, show indicator on More button
  $: isMoreActive = moreMenuPages.includes($page.url.pathname);
</script>

<button
  class="bottom-nav-item"
  class:has-active-child={isMoreActive}
  on:click={toggleMoreMenu}
>
  <MoreIcon />
  {#if isMoreActive}
    <span class="active-dot" />
  {/if}
  <span class="bottom-nav-label">More</span>
</button>
```

**Acceptance Criteria:**
- [ ] More menu slides up smoothly from bottom
- [ ] Backdrop dims content behind menu
- [ ] Tap backdrop closes menu
- [ ] Menu items have minimum 52px height
- [ ] Active page highlighted in More menu
- [ ] More button shows indicator when active page is in menu
- [ ] Swipe down gesture closes menu
- [ ] Menu respects safe area insets
- [ ] Focus trapped within open menu
- [ ] Escape key closes menu

---

### 19.6 Touch Target Size Reference

**Priority:** Reference

| Element | Minimum Size | Recommended Size |
|---------|--------------|------------------|
| Bottom nav items | 48x48px | 64x48px |
| Sidebar nav items | 44x44px | Full width × 48px |
| FAB (Search/Compose) | 48x48px | 56x56px |
| Icon buttons | 44x44px | 48x48px |
| List items | 48px height | 56px height |
| Form inputs | 44px height | 48px height |
| Checkboxes/Radio | 44x44px tap area | 48x48px tap area |
| Close/dismiss buttons | 44x44px | 44x44px |

**Acceptance Criteria:**
- [ ] All interactive elements meet minimum touch target sizes
- [ ] Touch targets don't overlap (minimum 8px gap)
- [ ] Visual element can be smaller than touch target
- [ ] Touch target size verified with device testing

---

### 19.7 Quick CSS Fix Summary

**Priority:** Critical

```css
/* 1. Fix floating search position */
.floating-search {
  bottom: calc(80px + env(safe-area-inset-bottom));
  right: 16px;
}

/* 2. Hide sidebar on mobile */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: -100%;
    transition: left 0.3s ease;
  }
  .sidebar.open { left: 0; }
  .main-content {
    margin-left: 0;
    width: 100%;
  }
}

/* 3. Increase bottom nav touch targets */
.bottom-nav {
  height: 64px;
  padding-bottom: env(safe-area-inset-bottom);
}
.bottom-nav-item {
  min-width: 64px;
  min-height: 48px;
  padding: 8px 12px;
}

/* 4. Ensure content doesn't overflow */
.page-content {
  min-width: 0;
  overflow-x: hidden;
}

/* 5. Card content respects boundaries */
.card {
  max-width: 100%;
  overflow: hidden;
}
```

**Acceptance Criteria:**
- [ ] All quick fixes applied to global styles
- [ ] No content overflow on mobile
- [ ] Bottom nav properly sized
- [ ] Search button positioned correctly
- [ ] Sidebar hidden on mobile by default

---

### 19.8 Additional UX Recommendations

**Priority:** Medium

**Haptic Feedback:**
```javascript
// Add haptic feedback for important actions
function hapticFeedback(type = 'light') {
  if ('vibrate' in navigator) {
    const patterns = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      error: [30, 50, 30, 50, 30]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
}

// Usage on button tap
button.addEventListener('click', () => {
  hapticFeedback('light');
  // ... action
});
```

**Gesture Support:**
```javascript
// Swipe-to-go-back on mobile
import { swipe } from '$lib/actions/swipe';

<div use:swipe on:swiperight={goBack}>
  <!-- Page content -->
</div>
```

**Loading States:**
```svelte
{#if loading}
  <div class="skeleton-loader">
    <div class="skeleton-line" style="width: 60%" />
    <div class="skeleton-line" style="width: 80%" />
    <div class="skeleton-line" style="width: 40%" />
  </div>
{:else}
  <!-- Actual content -->
{/if}
```

**Acceptance Criteria:**
- [ ] Haptic feedback on primary actions (optional, device-dependent)
- [ ] Swipe gestures for navigation where appropriate
- [ ] Pull-to-refresh on list pages
- [ ] Skeleton loaders for async content
- [ ] Error states with retry buttons
- [ ] Loading indicators for actions

---

## Implementation Priority Summary

### Critical (Must Fix)
1. **Floating search button blocking content** - Move to header or reposition
2. **Sidebar taking space on mobile** - Hide completely, use drawer
3. **Bottom navigation touch targets** - Increase to 48x48px minimum
4. Mail split-view layout (Desktop)
5. Mobile responsive layout bug
6. Loading states (skeleton loaders)
7. Terminology consistency (Alerts/Escalations)

### High Priority
1. Compose button visibility
2. Icon system overhaul
3. **Sidebar navigation touch points** - 44px minimum height
4. **"More" menu UX improvements** - Slide-up sheet with proper targets
5. Unread indicators enhancement
6. Error state designs

### Medium Priority
1. Empty state illustrations
2. Page title standardization
3. Form layout optimization
4. Stats cards with icons
5. Event expansion/details
6. **Haptic feedback for touch actions**
7. **Gesture support (swipe, pull-to-refresh)**

### Low Priority
1. Sparkline charts
2. Line numbers in logs
3. Historical data views
4. Tree view for rigs
5. Advanced keyboard shortcuts

---

## Testing Checklist

Before marking any item complete, verify:

- [ ] Works on Chrome, Safari, Firefox
- [ ] Works on iOS Safari, Android Chrome
- [ ] Keyboard navigation functional
- [ ] Screen reader announces correctly
- [ ] Dark mode appearance correct
- [ ] Loading states visible
- [ ] Error states handled
- [ ] Empty states displayed
- [ ] Responsive at all breakpoints
- [ ] Touch interactions work
- [ ] No console errors
- [ ] Performance acceptable (< 3s load)

---

*Document Version: 1.0*
*Last Updated: January 2025*
*Author: Gas Town UI Team*

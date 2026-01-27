/**
 * Layout Components Module
 *
 * Layout scaffolding components for page structure and navigation patterns.
 * These components provide the structural foundation for pages.
 */

// Navigation components
export { default as BottomNav } from './BottomNav.svelte';
export { default as Sidebar } from './Sidebar.svelte';
export { default as SheetNav, type SheetNavItem } from './SheetNav.svelte';
export { default as NavigationLoader } from './NavigationLoader.svelte';

// Page structure components
export {
	default as PageHeader,
	pageHeaderVariants,
	type BackLink,
	type BreadcrumbItem,
	type LiveCount,
	type PageHeaderProps,
	type PageHeaderVariants
} from './PageHeader.svelte';
export { default as DashboardLayout } from './DashboardLayout.svelte';
export { default as Dashboard } from './Dashboard.svelte';
export { default as MobileDashboard } from './MobileDashboard.svelte';

// Specialized layout components
export { default as LogsLayout } from './LogsLayout.svelte';
export { default as QueueLayout } from './QueueLayout.svelte';
export { default as WorkflowLayout } from './WorkflowLayout.svelte';
export { default as SplitView } from './SplitView.svelte';
export { default as AgentDetailLayout } from './AgentDetailLayout.svelte';

// Accessibility components
export { default as SkipLink } from './SkipLink.svelte';
export { default as Announcer } from './Announcer.svelte';
export { default as LiveRegion } from './LiveRegion.svelte';

// Status and indicator components
export { default as OperationCenter } from './OperationCenter.svelte';
export { default as StatusCards } from './StatusCards.svelte';
export { default as QuickActions } from './QuickActions.svelte';
export { default as ActivityFeed, type ActivityEvent } from './ActivityFeed.svelte';

// Network status components (from status subdirectory)
export { default as OfflineIndicator } from './status/OfflineIndicator.svelte';
export { default as ConnectionLost } from './status/ConnectionLost.svelte';
export { default as DegradedModeBanner } from './status/DegradedModeBanner.svelte';

// PWA components (from status subdirectory)
export { default as UpdatePrompt } from './status/UpdatePrompt.svelte';

// Keyboard components (from status subdirectory)
export { default as KeyboardHelpDialog } from './status/KeyboardHelpDialog.svelte';
export { default as VimSequenceIndicator } from './status/VimSequenceIndicator.svelte';

// Search components
export { GlobalSearch } from '../global-search';
export { CommandPalette } from '../command-palette';

// Log components (from status subdirectory)
export { default as LogEntry } from './status/LogEntry.svelte';
export { default as LogEntrySkeleton } from './status/LogEntrySkeleton.svelte';

<script lang="ts">
	import { LogsLayout, LogEntry } from '$lib/components';

	// Mock log entries - in real app from +page.ts load function
	const logs = [
		{
			id: '1',
			timestamp: new Date().toISOString(),
			level: 'INF' as const,
			message: '[Mayor] Dispatched work to Polecat Nux: ga-6vy Code Splitting'
		},
		{
			id: '2',
			timestamp: new Date(Date.now() - 60000).toISOString(),
			level: 'INF' as const,
			message: '[Refinery] Merged branch polecat/rux-feature-123 to main'
		},
		{
			id: '3',
			timestamp: new Date(Date.now() - 120000).toISOString(),
			level: 'INF' as const,
			message: '[Witness] Health check passed for all polecats'
		},
		{
			id: '4',
			timestamp: new Date(Date.now() - 180000).toISOString(),
			level: 'WRN' as const,
			message: '[Polecat Nux] Context usage at 75%, consider handoff'
		},
		{
			id: '5',
			timestamp: new Date(Date.now() - 240000).toISOString(),
			level: 'INF' as const,
			message: '[Mayor] Received mail from gastownui/witness'
		},
		{
			id: '6',
			timestamp: new Date(Date.now() - 300000).toISOString(),
			level: 'ERR' as const,
			message: '[Refinery] Tests failed for branch polecat/vux-broken'
		},
		{
			id: '7',
			timestamp: new Date(Date.now() - 360000).toISOString(),
			level: 'DBG' as const,
			message: '[Witness] Nudging polecat-rux after 10m idle'
		}
	];

	function formatTime(isoString: string): string {
		return new Date(isoString).toLocaleTimeString('en-US', {
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});
	}

	const sources = ['Mayor', 'Witness', 'Refinery', 'Polecat Nux', 'Polecat Rux'];
</script>

<LogsLayout title="Activity Logs" {sources}>
	{#each logs as log, i}
		<LogEntry
			timestamp={formatTime(log.timestamp)}
			level={log.level}
			message={log.message}
			delay={i * 50}
		/>
	{/each}
</LogsLayout>

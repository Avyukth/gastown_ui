/**
 * Label metadata extraction utilities
 *
 * Parses gastown label-based metadata from bead labels array.
 * Labels follow prefix:value format for metadata extraction.
 */

export const GASTOWN_ISSUE_TYPES = [
	'task',
	'bug',
	'feature',
	'epic',
	'merge-request',
	'convoy',
	'agent',
	'gate',
	'message'
] as const;

export type GastownIssueType = (typeof GASTOWN_ISSUE_TYPES)[number];

export interface BeadMetadata {
	isMergeRequest?: boolean;
	isAgent?: boolean;
	sender?: string;
	threadId?: string;
	messageType?: string;
	queue?: string;
	channel?: string;
}

const ISSUE_TYPE_SET = new Set<string>(GASTOWN_ISSUE_TYPES);

export function isValidIssueType(type: string): type is GastownIssueType {
	return ISSUE_TYPE_SET.has(type);
}

export function extractLabelValue(labels: string[], prefix: string): string | undefined {
	const label = labels.find((l) => l.startsWith(prefix));
	return label ? label.slice(prefix.length) : undefined;
}

export function hasLabel(labels: string[], label: string): boolean {
	return labels.includes(label);
}

export function extractMetadataFromLabels(labels: string[]): BeadMetadata {
	const metadata: BeadMetadata = {};

	if (hasLabel(labels, 'gt:merge-request')) {
		metadata.isMergeRequest = true;
	}

	if (hasLabel(labels, 'gt:agent')) {
		metadata.isAgent = true;
	}

	const sender = extractLabelValue(labels, 'from:');
	if (sender) metadata.sender = sender;

	const threadId = extractLabelValue(labels, 'thread:');
	if (threadId) metadata.threadId = threadId;

	const messageType = extractLabelValue(labels, 'msg-type:');
	if (messageType) metadata.messageType = messageType;

	const queue = extractLabelValue(labels, 'queue:');
	if (queue) metadata.queue = queue;

	const channel = extractLabelValue(labels, 'channel:');
	if (channel) metadata.channel = channel;

	return metadata;
}

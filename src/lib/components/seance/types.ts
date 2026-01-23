/**
 * Seance component types
 * Re-exported from the page server types for component use
 */

export interface SessionMessage {
	id: string;
	role: 'user' | 'assistant' | 'tool';
	content: string;
	timestamp: string;
	toolName?: string;
	toolResult?: string;
}

export interface Session {
	id: string;
	agentName: string;
	agentType: 'polecat' | 'witness' | 'refinery' | 'mayor';
	rig: string;
	status: 'active' | 'completed' | 'crashed';
	startTime: string;
	endTime: string | null;
	duration: number; // minutes
	messageCount: number;
	toolCallCount: number;
	filesModified: string[];
	errors: string[];
	transcript: SessionMessage[];
}

export type MessageRoleFilter = 'all' | 'user' | 'assistant' | 'tool';

export interface SeanceFilters {
	agent: string;
	rig: string;
	status: string;
	search: string;
	dateFrom: string;
	dateTo: string;
}

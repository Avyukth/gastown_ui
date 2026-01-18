/**
 * CLI Contracts - Type-safe definitions for Gas Town CLI commands
 * Architecture Decision: D0.6 - CLI Contracts
 */

export type CLICommand = 'gt' | 'bd';

export interface CLIResult<T = unknown> {
	success: boolean;
	data: T | null;
	error: string | null;
	exitCode: number;
	duration: number;
	command: string;
}

export interface CLICommandConfig {
	command: CLICommand;
	args: string[];
	timeout?: number;
	cwd?: string;
	dedupe?: boolean;
}

export interface ProcessSupervisorConfig {
	defaultTimeout: number;
	maxConcurrency: number;
	circuitBreakerThreshold: number;
	circuitBreakerResetTime: number;
}

export const DEFAULT_CONFIG: ProcessSupervisorConfig = {
	defaultTimeout: 30_000,
	maxConcurrency: 4,
	circuitBreakerThreshold: 5,
	circuitBreakerResetTime: 60_000
};

export interface CapabilitiesResult {
	gtVersion: string | null;
	bdVersion: string | null;
	features: {
		jsonOutput: boolean;
		mail: boolean;
		work: boolean;
		convoys: boolean;
		workflows: boolean;
	};
	available: boolean;
	error: string | null;
}

export interface QueuedRequest {
	id: string;
	config: CLICommandConfig;
	resolve: (result: CLIResult) => void;
	reject: (error: Error) => void;
	enqueuedAt: number;
}

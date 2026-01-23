/**
 * Workflow component types
 */

export interface Formula {
	name: string;
	type: string;
	description: string;
	source: string;
	steps: number;
	vars: number;
}

export interface FormulaDetail {
	name: string;
	type: string;
	description: string;
	phase: string;
	source: string;
	variables: Array<{
		name: string;
		default?: string;
		required: boolean;
		description?: string;
	}>;
	steps: Array<{
		id: string;
		title: string;
		type: string;
		depends_on?: string[];
	}>;
}

export interface StaleMolecule {
	id: string;
	title: string;
	total_children: number;
	closed_children: number;
	blocking_count: number;
}

export interface Wisp {
	id: string;
	title: string;
	formula: string;
	steps_complete: number;
	steps_total: number;
}

export interface MoleculesResponse {
	stale: {
		stale_molecules: StaleMolecule[];
		total_count: number;
		blocking_count: number;
	};
	wisps: Wisp[];
	active: Array<{
		id: string;
		title: string;
		type: string;
		status: string;
		priority: number;
	}>;
}

export type TabId = 'molecules' | 'formulas';

export interface ActionMessage {
	type: 'success' | 'error';
	text: string;
}

/**
 * Client Hooks
 *
 * Handles client-side error processing:
 * - Unhandled errors
 * - Navigation errors
 * - Graceful error reporting
 */

import type { HandleClientError } from '@sveltejs/kit';

/**
 * Error categories for better error handling
 */
type ErrorCategory = 'network' | 'auth' | 'validation' | 'notFound' | 'server' | 'unknown';

/**
 * Categorize an error based on its properties
 */
function categorizeError(error: unknown, status?: number): ErrorCategory {
	if (status === 401 || status === 403) return 'auth';
	if (status === 404) return 'notFound';
	if (status === 422 || status === 400) return 'validation';
	if (status && status >= 500) return 'server';

	if (error instanceof Error) {
		const message = error.message.toLowerCase();
		if (message.includes('network') || message.includes('fetch') || message.includes('offline')) {
			return 'network';
		}
		if (message.includes('unauthorized') || message.includes('forbidden')) {
			return 'auth';
		}
		if (message.includes('not found')) {
			return 'notFound';
		}
	}

	return 'unknown';
}

/**
 * Get user-friendly error message based on category
 */
function getUserFriendlyMessage(category: ErrorCategory, originalMessage?: string): string {
	switch (category) {
		case 'network':
			return 'Unable to connect. Please check your internet connection.';
		case 'auth':
			return 'Your session has expired. Please log in again.';
		case 'validation':
			return originalMessage || 'The data provided is invalid.';
		case 'notFound':
			return 'The requested resource could not be found.';
		case 'server':
			return 'Something went wrong on our end. Please try again later.';
		default:
			return originalMessage || 'An unexpected error occurred.';
	}
}

/**
 * Log error to console with structured format
 */
function logError(
	error: unknown,
	errorId: string,
	category: ErrorCategory,
	context?: { status?: number; url?: string }
) {
	const timestamp = new Date().toISOString();

	console.group(`[Gas Town Error] ${errorId}`);
	console.log('Timestamp:', timestamp);
	console.log('Category:', category);
	if (context?.status) console.log('Status:', context.status);
	if (context?.url) console.log('URL:', context.url);
	console.error('Error:', error);
	if (error instanceof Error && error.stack) {
		console.log('Stack:', error.stack);
	}
	console.groupEnd();

	// In production, you would send this to an error tracking service
	// Example: Sentry, LogRocket, etc.
	// if (import.meta.env.PROD) {
	//   sendToErrorTracker({ errorId, category, error, context, timestamp });
	// }
}

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
	return `err_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Client error handler
 *
 * This hook is called when an error occurs on the client side.
 * It categorizes the error, logs it, and returns a user-friendly message.
 */
export const handleError: HandleClientError = ({ error, status, message }) => {
	const errorId = generateErrorId();
	const category = categorizeError(error, status);

	// Log the error
	logError(error, errorId, category, {
		status,
		url: typeof window !== 'undefined' ? window.location.href : undefined
	});

	// Return user-friendly error info
	const userMessage = getUserFriendlyMessage(category, message);

	return {
		message: userMessage,
		errorId,
		category
	};
};

/**
 * Global error handlers for uncaught errors
 */
if (typeof window !== 'undefined') {
	// Handle unhandled promise rejections
	window.addEventListener('unhandledrejection', (event) => {
		const errorId = generateErrorId();
		const category = categorizeError(event.reason);

		logError(event.reason, errorId, category, {
			url: window.location.href
		});

		// Prevent the default handling (console error)
		// event.preventDefault();
	});

	// Handle global errors
	window.addEventListener('error', (event) => {
		const errorId = generateErrorId();
		const category = categorizeError(event.error);

		logError(event.error || event.message, errorId, category, {
			url: window.location.href
		});
	});
}

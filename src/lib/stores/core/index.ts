/**
 * Core stores module
 *
 * Low-level, foundational stores that other modules depend on.
 */

export {
	// Network partition detection store
	networkStore,
	createNetworkStore,
	NetworkError,
	NetworkErrorCode,
	type NetworkErrorCodeType,
	type NetworkState,
	type NetworkStoreInstance,
	type NetworkStoreDeps,
	type QueuedRequest,
	type QueueRequestConfig,
	type HttpMethod,
	type StatusChangeCallback,
	type QueueProcessor
} from './network.svelte';

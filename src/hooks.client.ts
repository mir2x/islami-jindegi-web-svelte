import type { ClientInit, HandleClientError } from '@sveltejs/kit/hooks';
import { reportError, startTelemetry } from '#lib/telemetry.ts';

export const init: ClientInit = () => {
	try {
		startTelemetry();
	} catch {
		/* reporting must never stop the app from starting */
	}
};

/** Errors thrown while navigating or rendering in the browser; the server never sees these otherwise. */
export const handleError: HandleClientError = (input) => {
	if (input.kind === 'unknown') reportError(input.error, 'navigation');
};

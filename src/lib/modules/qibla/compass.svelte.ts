/**
 * The phone's compass as a heading in degrees clockwise from magnetic north (0 = north), smoothed.
 * Browsers only give it after a tap (iOS asks permission), over HTTPS, and on devices with a magnetometer.
 */
export type CompassStatus = 'idle' | 'starting' | 'live' | 'denied' | 'unsupported';

const norm = (d: number) => ((d % 360) + 360) % 360;
const rad = (d: number) => (d * Math.PI) / 180;

/**
 * Compass heading from the orientation angles. Lying flat, the top edge of the phone is the pointer; held
 * upright (camera style), the direction the back faces is. Each is undefined in the other pose, so pick by tilt.
 */
function headingFrom(alpha: number, beta: number, gamma: number): number {
	const [a, b, g] = [rad(alpha), rad(beta), rad(gamma)];
	const flat = Math.cos(b) * Math.cos(g) > 0.7;
	const east = flat ? -Math.sin(a) * Math.cos(b) : -Math.cos(a) * Math.sin(g) - Math.sin(a) * Math.sin(b) * Math.cos(g);
	const north = flat ? Math.cos(a) * Math.cos(b) : -Math.sin(a) * Math.sin(g) + Math.cos(a) * Math.sin(b) * Math.cos(g);
	return norm((Math.atan2(east, north) * 180) / Math.PI);
}

type OrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };

export function createCompass() {
	let status = $state<CompassStatus>('idle');
	/** Continuous (does not jump at 360 to 0), so a dial rotated by it never spins backwards. */
	let angle = $state<number | null>(null);
	let off: (() => void) | undefined;

	function push(h: number) {
		if (angle === null) angle = h;
		else {
			const diff = ((h - norm(angle) + 540) % 360) - 180;
			angle += diff * 0.25;
		}
		status = 'live';
	}

	function onEvent(e: Event) {
		const o = e as OrientationEvent;
		// iOS reports the compass heading itself.
		if (typeof o.webkitCompassHeading === 'number') return push(o.webkitCompassHeading);
		// Elsewhere only the absolute (north-referenced) reading is a compass; the relative one just drifts.
		if (e.type === 'deviceorientationabsolute' || o.absolute) {
			if (o.alpha !== null && o.beta !== null && o.gamma !== null) push(headingFrom(o.alpha, o.beta, o.gamma));
		}
	}

	async function start() {
		if (status === 'starting' || status === 'live') return;
		if (typeof window === 'undefined' || !('DeviceOrientationEvent' in window)) return void (status = 'unsupported');
		status = 'starting';
		const ask = (DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
		if (typeof ask === 'function') {
			try {
				if ((await ask()) !== 'granted') return void (status = 'denied');
			} catch {
				return void (status = 'denied');
			}
		}
		window.addEventListener('deviceorientationabsolute', onEvent, true);
		window.addEventListener('deviceorientation', onEvent, true);
		const timer = setTimeout(() => {
			// No reading arrived: a desktop, or a phone without a magnetometer.
			if (angle === null) {
				stop();
				status = 'unsupported';
			}
		}, 2500);
		off = () => {
			clearTimeout(timer);
			window.removeEventListener('deviceorientationabsolute', onEvent, true);
			window.removeEventListener('deviceorientation', onEvent, true);
		};
	}

	function stop() {
		off?.();
		off = undefined;
	}

	return {
		get status() {
			return status;
		},
		/** For rotating the dial. */
		get angle() {
			return angle;
		},
		/** 0 to 360, north up. */
		get heading() {
			return angle === null ? null : norm(angle);
		},
		start,
		stop
	};
}

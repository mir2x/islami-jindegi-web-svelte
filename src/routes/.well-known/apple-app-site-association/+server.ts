import aasa from '#lib/assets/apple-app-site-association.json?raw';
import { rawAsset } from '#lib/server/raw-asset.ts';

export const GET = () => rawAsset(aasa, 'application/json', 'public, max-age=3600');

import assetlinks from '#lib/assets/assetlinks.json?raw';
import { rawAsset } from '#lib/server/raw-asset.ts';

export const GET = () => rawAsset(assetlinks, 'application/json', 'public, max-age=3600');

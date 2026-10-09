/** Response for a text asset bundled into the server, with explicit type and cache headers. */
export const rawAsset = (body: string, contentType: string, cacheControl: string) =>
	new Response(body, { headers: { 'content-type': contentType, 'cache-control': cacheControl } });

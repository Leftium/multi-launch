import type { Reroute } from '@sveltejs/kit'
const translated: Record<string, string> = {
	'/svelte': '/',
	'/korea': '/',
	'/kr': '/',
}
export const reroute: Reroute = ({ url }) => {
	if (url.pathname in translated) {
		return translated[url.pathname]
	}
}

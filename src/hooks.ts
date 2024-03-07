import type { Reroute } from '@sveltejs/kit'
const translated: Record<string, string> = {
	'/svelte': '/',
}
export const reroute: Reroute = ({ url }) => {
	if (url.pathname in translated) {
		return translated[url.pathname]
	}
}

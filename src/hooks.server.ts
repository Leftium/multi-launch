import type { Handle } from '@sveltejs/kit'
import { createHandler } from 'web-sentinel/hooks'

const sentinel = createHandler({ log: false, preview: false, http_status: 418 })

export const handle: Handle = async (input) => {
	const response = await sentinel(input)
	if (response.status === 418) {
		console.error(`[web-sentinel] ${input.event.request.method} ${input.event.url.pathname}`)
	}
	return response
}

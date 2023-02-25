import type { PageServerLoad, Actions } from './$types'

import { redirect } from '@sveltejs/kit'

import lzString from 'lz-string'
const { decompressFromEncodedURIComponent } = lzString

import * as SE from '$lib/search-engines'

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData()
		const query = data.get('query') as string
		const planText =
			decompressFromEncodedURIComponent((data.get('lz-plan') as string) || '') || ''

		let planJson
		let planError: Error

		try {
			planJson = JSON.parse(planText)
		} catch (error) {
			planError = error as Error
		}

		const queryTrimmedEncoded = encodeURIComponent(query.trim())
		const urlTemplateSelector = SE.makeUrlTemplateSelector(planJson)
		const urlTemplate = urlTemplateSelector(query) || planJson.default
		let url = urlTemplate.replace('QUERY', queryTrimmedEncoded)

		if (!url) {
			url = `/?q=${queryTrimmedEncoded}`
		}

		throw redirect(303, url)
	},
} satisfies Actions

export const load = (async () => {
	return {}
}) satisfies PageServerLoad

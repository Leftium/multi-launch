import { fail } from '@sveltejs/kit'
import debugFactory from 'debug'
const log = debugFactory('/+page.server')

import lzString from 'lz-string'

import defaultPlanToml from '$lib/plans/default.toml?raw'

const SECONDS_PER_DAY = 24 * 60 * 60

export const load = async ({ cookies, url }) => {
	const planTomlLz = url.searchParams.get('p') || cookies.get('planTomlLz') || ''
	const planToml = lzString.decompressFromEncodedURIComponent(planTomlLz) || defaultPlanToml

	return { planToml }
}

export const actions = {
	edit: async ({ request, cookies, url }) => {
		const formData = await request.formData()

		const operation = formData.get('operation')
		const planToml = formData.get('planToml') as string

		const planTomlLz = lzString.compressToEncodedURIComponent(planToml)

		let successMessage = ''
		let errorMessage = ''

		log(planToml.length, planTomlLz.length, planTomlLz.length / planToml.length)

		log({ operation })

		try {
			if (operation === 'save') {
				log('do save')
				cookies.set('planTomlLz', planTomlLz, {
					path: '/',
					httpOnly: false,
					maxAge: 400 * SECONDS_PER_DAY,
				})
				successMessage = 'Plan successfully saved to browser cookie.'
			}
			if (operation === 'share') {
				const shareLink = `${url.origin}?p=${planTomlLz}`

				successMessage = `Share this launch plan with this <a href="${shareLink}" data-sveltekit-reload>link</a>. (Right click, "Copy link address")`
				return fail(400, { successMessage, planToml })
			}
			if (operation === 'add') {
				const cookiePlanTomlLz = cookies.get('planTomlLz') as string
				const cookiePlanToml =
					lzString.decompressFromEncodedURIComponent(cookiePlanTomlLz) || ''

				const noTitlePlanToml = planToml.replace(/title\s*=\s*/, '# $&')

				const combinedPlanToml =
					cookiePlanToml && noTitlePlanToml
						? `${cookiePlanToml}\n\n${noTitlePlanToml}`
						: planToml

				successMessage = `Added to browser cookie plan. (Not saved, yet.)`
				return fail(400, { successMessage, planToml: combinedPlanToml })
			}
		} catch (error) {
			errorMessage = (error as Error).message
			return fail(400, { errorMessage, planToml })
		}

		return { successMessage, fromEditOperation: true }
	},
}

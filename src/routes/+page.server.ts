import { fail } from '@sveltejs/kit'
import debugFactory from 'debug'
const log = debugFactory('/+page.server')

import lzString from 'lz-string'
const { compressToEncodedURIComponent } = lzString

const SECONDS_PER_DAY = 24 * 60 * 60

export const load = async () => {
	return {}
}

export const actions = {
	edit: async ({ request, cookies }) => {
		const formData = await request.formData()

		const operation = formData.get('operation')
		const planToml = formData.get('planToml') as string

		const planTomlLz = compressToEncodedURIComponent(planToml)

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
		} catch (error) {
			errorMessage = (error as Error).message
			return fail(400, { errorMessage })
		}

		return { successMessage }
	},
}

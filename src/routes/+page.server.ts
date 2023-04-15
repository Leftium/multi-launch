import debugFactory from 'debug'
const log = debugFactory('/+page.server')

export const load = async () => {
	return {}
}

export const actions = {
	edit: async ({ request }) => {
		const formData = await request.formData()

		log(formData.get('operation'))
	},
}

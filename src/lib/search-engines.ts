import _ from 'lodash'

export type UrlTemplateSelector = (query: string) => string

export type SearchEnginePlan = {
	noquery?: string
	link?: string
	lang_ko?: string
	default: string
}

export type SearchGroupPlans = Record<string, SearchEnginePlan>

export type SearchEngine = {
	name: string
	getUrlTemplate: (query: string) => string
	clickHandler: EventHandler
}

export type SearchGroup = {
	name: string
	engines: SearchEngine[]
	handleClickAll: EventHandler
}

// Makes function that returns a (string) url from plan based on query contents.
// inputs: query, plan
// output: urlTemplate
export const makeUrlTemplateSelector = (plan: SearchEnginePlan) => {
	const urlRegex = /^https?:/iu
	const koreanRegex = /[\u3131-\uD79D]/giu // https://stackoverflow.com/a/38156301/117030

	return (text: string) => {
		text = text.trim()

		let urlTemplate = plan.default

		if (urlRegex.test(text)) {
			urlTemplate = plan.link ?? urlTemplate
		}

		if (koreanRegex.test(text)) {
			urlTemplate = plan.lang_ko ?? urlTemplate
		}

		if (text === '') {
			urlTemplate = plan.noquery ?? urlTemplate
		}
		return urlTemplate
	}
}

type EventHandler = (e: Event) => void

export const makeSearchGroup = (
	groupName: string,
	plans: SearchGroupPlans,
	makeSearchEngine: (name: string, plan: SearchEnginePlan) => SearchEngine
) => {
	const engines = _.map(plans, (plan: SearchEnginePlan, name: string) =>
		makeSearchEngine(name, plan)
	)

	const handleClickAll = (e: Event) => {
		const enginesList = (e as MouseEvent).altKey ? [...engines].reverse() : engines
		enginesList.map((engine) => engine.clickHandler(e))
	}

	return {
		name: groupName,
		engines,
		handleClickAll,
	}
}

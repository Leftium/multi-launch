import _ from 'lodash'
import lzString from 'lz-string'

export type UrlTemplateSelector = (query: string) => string

export type SearchEnginePlan = {
	target?: string
	exclude?: boolean
	ifquery?: string
	iflink?: string
	lang_ko?: string
	default: string
}

export type SearchGroupPlans = Record<string, SearchEnginePlan>

export type SearchEngine = {
	name: string
	target: string
	exclude: boolean
	plan: any
	lzEngines: string

	getUrlTemplate: (query: string, avoidEmptyUrl?: boolean) => string
	clickHandler: EventHandler
}

export type SearchGroup = {
	name: string
	engines: SearchEngine[]
	handleClickAll: LaunchButtonClickHandler
}

// Makes function that returns a (string) url from plan based on query contents.
// inputs: query, plan
// output: urlTemplate
export const makeUrlTemplateSelector = (plan: SearchEnginePlan) => {
	const urlRegex = /^https?:/iu
	const koreanRegex = /[\u3131-\uD79D]/giu // https://stackoverflow.com/a/38156301/117030

	return (text: string, isClickAll = false) => {
		text = text.trim()

		let urlTemplate = plan.default

		if (text) {
			urlTemplate = plan.ifquery ?? urlTemplate
		}

		if (urlRegex.test(text)) {
			urlTemplate = plan.iflink ?? urlTemplate
		}

		if (koreanRegex.test(text)) {
			urlTemplate = plan.lang_ko ?? urlTemplate
		}

		if (urlTemplate === '' && !isClickAll) {
			urlTemplate = plan.default
		}

		return urlTemplate
	}
}

type EventHandler = (e: Event) => void
type LaunchButtonClickHandler = (e: Event, isClickAll: boolean) => void

export const makeSearchGroup = (
	groupName: string,
	plans: SearchGroupPlans,
	makeSearchEngine: (groupName: string, name: string, plan: SearchEnginePlan) => SearchEngine
) => {
	const engines = _.map(plans, (plan: SearchEnginePlan, name: string) =>
		makeSearchEngine(groupName, name, plan)
	)

	const handleClickAll = (e: Event) => {
		const enginesList = (e as MouseEvent).altKey ? [...engines].reverse() : engines
		enginesList.map((engine) => (engine.clickHandler as LaunchButtonClickHandler)(e, true))
	}

	return {
		name: groupName,
		engines,
		handleClickAll,
	}
}

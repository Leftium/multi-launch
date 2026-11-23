/** Browser-local metadata only. TOML and Automerge history live elsewhere. */
export const LOCAL_PLAN = 'local'
export const DEFAULT_SYNC_SERVER = 'wss://sync.automerge.org'
export const REGISTRY_STORAGE_KEY = 'multi-launch.plan-registry.v1'
const DRAFT_STORAGE_PREFIX = 'multi-launch.plan-draft.v1.'

export interface SyncedPlanReference {
	key: string
	documentId: string
	serverUrl: string
	title?: string
	label?: string // Legacy custom name used by earlier previews.
}

export interface PlanRegistry {
	active: typeof LOCAL_PLAN | string
	synced: SyncedPlanReference[]
}

export interface PlanDraft {
	/** Saved TOML at the time editing started; used to detect incoming changes. */
	base: string
	text: string
}

export interface JoinTarget {
	documentId: string
	serverUrl: string
}

/** This is a *local reference* registry, not a document index synced to peers. */
export function emptyRegistry(): PlanRegistry {
	return { active: LOCAL_PLAN, synced: [] }
}

/** Do not silently replace malformed registry metadata and lose document references. */
export function readRegistry(storage: Pick<Storage, 'getItem'>): PlanRegistry {
	const raw = storage.getItem(REGISTRY_STORAGE_KEY)
	if (raw === null) return emptyRegistry()

	let value: unknown
	try {
		value = JSON.parse(raw)
	} catch {
		throw new Error('Plan registry is invalid JSON; no changes were made.')
	}
	if (!isRegistry(value)) {
		throw new Error('Plan registry has an unsupported structure; no changes were made.')
	}
	return value
}

export function writeRegistry(storage: Pick<Storage, 'setItem'>, registry: PlanRegistry): void {
	if (!isRegistry(registry)) throw new Error('Cannot persist an invalid plan registry.')
	storage.setItem(REGISTRY_STORAGE_KEY, JSON.stringify(registry))
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isRegistry(value: unknown): value is PlanRegistry {
	if (!isRecord(value) || typeof value.active !== 'string' || !Array.isArray(value.synced)) {
		return false
	}
	const keys = new Set<string>()
	const targets = new Set<string>()
	for (const entry of value.synced) {
		if (
			!isRecord(entry) ||
			typeof entry.key !== 'string' ||
			!entry.key ||
			entry.key === LOCAL_PLAN ||
			typeof entry.documentId !== 'string' ||
			!entry.documentId ||
			typeof entry.serverUrl !== 'string' ||
			(typeof entry.label !== 'undefined' && typeof entry.label !== 'string') ||
			(typeof entry.title !== 'undefined' && typeof entry.title !== 'string')
		)
			return false
		let serverUrl: string
		try {
			serverUrl = normalizeServerUrl(entry.serverUrl)
		} catch {
			return false
		}
		const target = JSON.stringify([serverUrl, entry.documentId])
		if (keys.has(entry.key) || targets.has(target)) return false
		keys.add(entry.key)
		targets.add(target)
	}
	return value.active === LOCAL_PLAN || keys.has(value.active)
}

/** Only secure WebSockets, except explicit loopback development servers. */
export function normalizeServerUrl(raw: string): string {
	let url: URL
	try {
		url = new URL(raw)
	} catch {
		throw new Error('Invalid sync server URL.')
	}
	const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)
	if (url.protocol !== 'wss:' && !(loopback && url.protocol === 'ws:')) {
		throw new Error('Sync server must use wss: (ws: is permitted only for localhost).')
	}
	if (url.username || url.password || url.hash) {
		throw new Error('Sync server URL cannot contain credentials or a fragment.')
	}
	return url.href
}

export function selectPlan(registry: PlanRegistry, key: string): PlanRegistry {
	if (key !== LOCAL_PLAN && !registry.synced.some((entry) => entry.key === key)) {
		throw new Error(`Unknown plan: ${key}`)
	}
	return { ...registry, active: key }
}

/** Call this *only after* Repo.find resolves and the document validates. Never seeds a doc. */
export function registerSyncedPlan(
	registry: PlanRegistry,
	entry: SyncedPlanReference
): { registry: PlanRegistry; key: string } {
	const serverUrl = normalizeServerUrl(entry.serverUrl)
	if (!entry.documentId || !entry.key || entry.key === LOCAL_PLAN) {
		throw new Error('A synced plan needs a document ID and a non-local registry key.')
	}
	const existing = registry.synced.find(
		(item) =>
			item.documentId === entry.documentId && normalizeServerUrl(item.serverUrl) === serverUrl
	)
	if (existing) return { registry, key: existing.key }
	if (registry.synced.some((item) => item.key === entry.key)) {
		throw new Error(`Plan registry key already exists: ${entry.key}`)
	}
	return {
		registry: { ...registry, synced: [...registry.synced, { ...entry, serverUrl }] },
		key: entry.key,
	}
}

/** Forgetting local metadata does not delete remote or cached Automerge history. */
export function forgetSyncedPlan(registry: PlanRegistry, key: string): PlanRegistry {
	if (key === LOCAL_PLAN) throw new Error('The Local plan cannot be removed.')
	return {
		active: registry.active === key ? LOCAL_PLAN : registry.active,
		synced: registry.synced.filter((entry) => entry.key !== key),
	}
}

/** Returns undefined for ordinary links; a malformed join link throws. */
export function parseJoinLink(url: URL): JoinTarget | undefined {
	const ids = url.searchParams.getAll('doc')
	if (!ids.length) return undefined
	if (ids.length !== 1 || !ids[0] || url.searchParams.getAll('server').length > 1) {
		throw new Error('Invalid live document link.')
	}
	return {
		documentId: ids[0],
		serverUrl: normalizeServerUrl(url.searchParams.get('server') || DEFAULT_SYNC_SERVER),
	}
}

export function liveLink(appOrigin: string, entry: SyncedPlanReference): string {
	const url = new URL('/', appOrigin)
	url.searchParams.set('doc', entry.documentId)
	const endpoint = normalizeServerUrl(entry.serverUrl)
	if (endpoint !== normalizeServerUrl(DEFAULT_SYNC_SERVER)) {
		url.searchParams.set('server', endpoint)
	}
	return url.toString()
}

function draftStorageKey(planKey: string): string {
	return `${DRAFT_STORAGE_PREFIX}${encodeURIComponent(planKey)}`
}

export function readDraft(
	storage: Pick<Storage, 'getItem'>,
	planKey: string
): PlanDraft | undefined {
	const raw = storage.getItem(draftStorageKey(planKey))
	if (raw === null) return undefined
	let value: unknown
	try {
		value = JSON.parse(raw)
	} catch {
		throw new Error('Saved editor draft is invalid JSON; no changes were made.')
	}
	if (!isRecord(value) || typeof value.base !== 'string' || typeof value.text !== 'string') {
		throw new Error('Saved editor draft has an unsupported structure; no changes were made.')
	}
	return { base: value.base, text: value.text }
}

export function writeDraft(
	storage: Pick<Storage, 'setItem' | 'removeItem'>,
	planKey: string,
	draft: PlanDraft,
	saved = draft.base
): void {
	if (draft.text === saved) {
		storage.removeItem(draftStorageKey(planKey))
	} else {
		storage.setItem(draftStorageKey(planKey), JSON.stringify(draft))
	}
}

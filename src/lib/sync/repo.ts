import { ImmutableString, initializeWasm, isImmutableString } from '@automerge/automerge/slim'
import wasmUrl from '@automerge/automerge/automerge.wasm?url'
import {
	Repo,
	isValidAutomergeUrl,
	isValidDocumentId,
	parseAutomergeUrl,
	stringifyAutomergeUrl,
	type DocHandle,
	type DocumentId,
} from '@automerge/automerge-repo/slim'
import { WebSocketClientAdapter } from '@automerge/automerge-repo-network-websocket'
import { IndexedDBStorageAdapter } from '@automerge/automerge-repo-storage-indexeddb'
import type { JoinTarget } from './registry.js'

type PlanDocument = { planToml: ImmutableString | string }
export type PlanHandle = DocHandle<PlanDocument>

const endpoints = new Map<
	string,
	{
		repo: Repo
		network: WebSocketClientAdapter
		remembered: Set<DocumentId>
		opening: Set<DocumentId>
	}
>()

let wasm: Promise<void> | undefined

export function documentUrl(raw: string) {
	if (isValidDocumentId(raw)) return stringifyAutomergeUrl(raw)
	if (isValidAutomergeUrl(raw) && !raw.includes('#')) return raw
	throw new Error('The live link needs a valid Automerge document ID.')
}

async function endpoint(serverUrl: string) {
	wasm ??= initializeWasm(wasmUrl).catch((error) => {
		wasm = undefined
		throw error
	})
	await wasm

	const existing = endpoints.get(serverUrl)
	if (existing) return existing

	const storage = new IndexedDBStorageAdapter(`multi-launch.automerge.v1.${serverUrl}`)
	await storage.load(['probe'])
	const opened = endpoints.get(serverUrl)
	if (opened) return opened

	const remembered = new Set<DocumentId>()
	const opening = new Set<DocumentId>()
	const canSync = async (_peer: unknown, id?: DocumentId) =>
		id !== undefined && (remembered.has(id) || opening.has(id))
	const network = new WebSocketClientAdapter(serverUrl)
	const repo = new Repo({
		storage,
		network: [network],
		shareConfig: { announce: canSync, access: canSync },
	})
	const created = { repo, network, remembered, opening }
	endpoints.set(serverUrl, created)
	return created
}

export function updateSharing(plans: JoinTarget[]) {
	for (const [serverUrl, { repo, remembered }] of endpoints) {
		remembered.clear()
		for (const plan of plans) {
			if (plan.serverUrl === serverUrl && isValidAutomergeUrl(plan.documentId)) {
				remembered.add(parseAutomergeUrl(plan.documentId).documentId)
			}
		}
		repo.shareConfigChanged()
	}
}

export async function openPlan(target: JoinTarget) {
	const url = documentUrl(target.documentId)
	const id = parseAutomergeUrl(url).documentId
	const { repo, opening } = await endpoint(target.serverUrl)
	opening.add(id)
	repo.shareConfigChanged()
	try {
		const signal = AbortSignal.timeout(8000)
		const handle = await repo.find<PlanDocument>(url, {
			signal,
			allowableStates: ['ready', 'unavailable'],
		})
		// A previously unavailable handle can become ready when its peer reconnects.
		if (!handle.isReady()) await handle.whenReady(['ready'], { signal })
		return handle
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('The live plan did not load. Check the server and try again.', {
				cause: error,
			})
		}
		throw error
	} finally {
		opening.delete(id)
		repo.shareConfigChanged()
	}
}

export function readPlan(handle: PlanHandle) {
	const value = handle.doc()?.planToml
	if (isImmutableString(value)) return value.toString()
	if (typeof value === 'string') return value
	throw new Error('This document has no planToml field.')
}

export async function createPlan(serverUrl: string, text: string) {
	const { repo } = await endpoint(serverUrl)
	const handle = repo.create<PlanDocument>({ planToml: new ImmutableString(text) })
	await repo.flush([handle.documentId])
	return handle
}

export async function savePlan(serverUrl: string, handle: PlanHandle, text: string) {
	if (readPlan(handle) !== text) {
		handle.change((doc) => {
			// A scalar replacement keeps concurrent Saves from merging character by character.
			doc.planToml = new ImmutableString(text)
		})
	}
	await endpoints.get(serverUrl)!.repo.flush([handle.documentId])
}

export function isConnected(serverUrl: string) {
	const network = endpoints.get(serverUrl)?.network
	return network?.socket?.readyState === WebSocket.OPEN && !!network.remotePeerId
}

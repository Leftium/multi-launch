import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
	DEFAULT_SYNC_SERVER, LOCAL_PLAN, REGISTRY_STORAGE_KEY,
	emptyRegistry, readRegistry, writeRegistry, registerSyncedPlan, selectPlan,
	forgetSyncedPlan, normalizeServerUrl, liveLink, parseJoinLink,
	readDraft, writeDraft,
} from '../src/lib/sync/registry.ts'

function memoryStorage() {
	const items = new Map()
	return {
		getItem(key) { return items.has(key) ? items.get(key) : null },
		setItem(key, value) { items.set(key, value) },
		removeItem(key) { items.delete(key) },
	}
}
const personal = {key:'personal', documentId:'automerge:abc123', serverUrl:DEFAULT_SYNC_SERVER}
const work = {key:'work', documentId:'automerge:def456', serverUrl:'wss://other.example/ws'}

test('Local always exists, even with no browser registry', () => {
	const storage = memoryStorage()
	assert.deepEqual(readRegistry(storage), {active:LOCAL_PLAN, synced:[]})
	writeRegistry(storage, emptyRegistry())
	assert.equal(JSON.parse(storage.getItem(REGISTRY_STORAGE_KEY)).active, LOCAL_PLAN)
})

test('registrations are idempotent; switching and removing never change other entries', () => {
	let registry = emptyRegistry()
	registry = registerSyncedPlan(registry, personal).registry
	registry = registerSyncedPlan(registry, work).registry
	const secondJoin = registerSyncedPlan(registry, {...personal, key:'duplicate'})
	assert.equal(secondJoin.key, 'personal')
	assert.equal(secondJoin.registry.synced.length, 2)
	registry = selectPlan(secondJoin.registry, 'personal')
	registry = forgetSyncedPlan(registry, 'personal')
	assert.equal(registry.active, LOCAL_PLAN)
	assert.deepEqual(registry.synced, [work])
	assert.throws(() => forgetSyncedPlan(registry, LOCAL_PLAN))
	assert.throws(() => selectPlan(registry, 'not-in-registry'))
})

test('server URL normalization accepts secure endpoints and loopback only', () => {
	assert.equal(normalizeServerUrl('wss://example.org'), 'wss://example.org/')
	assert.equal(normalizeServerUrl('ws://localhost:3030'), 'ws://localhost:3030/')
	assert.throws(() => normalizeServerUrl('ws://example.org'))
	assert.throws(() => normalizeServerUrl('https://example.org'))
	assert.throws(() => normalizeServerUrl('wss://secret:pass@example.org'))
	assert.throws(() => normalizeServerUrl('wss://example.org/#evil'))
})

test('live links carry document plus server; absent server uses the community endpoint', () => {
	assert.deepEqual(parseJoinLink(new URL(liveLink('https://multi.example', personal))), {
		documentId:'automerge:abc123', serverUrl:'wss://sync.automerge.org/'
	})
	assert.deepEqual(parseJoinLink(new URL(liveLink('https://multi.example', work))), {
		documentId:'automerge:def456', serverUrl:'wss://other.example/ws'
	})
	assert.equal(parseJoinLink(new URL('https://multi.example/?p=snapshot')), undefined)
	assert.throws(() => parseJoinLink(new URL('https://multi.example/?doc=one&doc=two')))
})

test('dirty drafts are per-plan; clearing a clean draft does not affect other plans', () => {
	const storage = memoryStorage()
	writeDraft(storage, 'local', {base:'saved local',text:'edited local'})
	writeDraft(storage, 'personal', {base:'saved remote',text:'edited remote'})
	assert.deepEqual(readDraft(storage, 'local'), {base:'saved local',text:'edited local'})
	assert.deepEqual(readDraft(storage, 'personal'), {base:'saved remote',text:'edited remote'})
	writeDraft(storage, 'local', {base:'saved local',text:'saved local'})
	assert.equal(readDraft(storage, 'local'), undefined)
	assert.equal(readDraft(storage, 'personal').text, 'edited remote')
})

test('damaged local registry is rejected rather than overwritten', () => {
	const storage = memoryStorage()
	storage.setItem(REGISTRY_STORAGE_KEY,'{oops')
	assert.throws(() => readRegistry(storage))
	assert.equal(storage.getItem(REGISTRY_STORAGE_KEY),'{oops')
})

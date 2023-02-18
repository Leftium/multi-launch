<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	let query = ' QUERY '

	const handleClick = (e: Event) => {
		const queryTrimmed = query.trim()
		log('handleClick', queryTrimmed, e)
	}
</script>

<main class="container">
	<textarea rows="2" bind:value={query} />

	<div>
		<button class="primary">All Translate</button>
		<button class="secondary" on:click={handleClick}>Google</button>
		<button class="secondary">Papago</button>
	</div>

	<div>
		<button class="primary">All Shopping</button>
		<button class="secondary">Danawa</button>
		<button class="secondary">Naver</button>
		<button class="secondary">Kakao</button>
		<button class="secondary">Enuri</button>
	</div>

	<div>
		<button class="primary">All Search</button>
		<button class="secondary">Google</button>
		<button class="secondary">Naver</button>
		<button class="secondary">Daum</button>
		<button class="secondary">Bing</button>
		<button class="secondary">Yandex</button>
	</div>
</main>

<style>
	main > div {
		margin-bottom: var(--spacing);
	}

	button.primary {
		width: 8rem;
	}

	/* Undo pico css button styling */
	button {
		width: auto;
		display: inline;
	}

	button {
		margin-bottom: 0.1rem;
	}
</style>

<script lang="ts">
	import '@picocss/pico'

	import debugFactory from 'debug'
	const log = debugFactory('log')

	log('Hello')

	let query = 'QUERY'
</script>

<main class="container">
	<textarea rows="2" bind:value={query} />

	<div>
		<span role="button" class="primary">All Translate</span>
		<span role="button" class="secondary">Google</span>
		<span role="button" class="secondary">Papago</span>
	</div>

	<div>
		<span role="button" class="primary">All Shopping</span>
		<span role="button" class="secondary">Danawa</span>
		<span role="button" class="secondary">Naver</span>
		<span role="button" class="secondary">Kakao</span>
		<span role="button" class="secondary">Enuri</span>
	</div>

	<div>
		<span role="button" class="primary">All Search</span>
		<span role="button" class="secondary">Google</span>
		<span role="button" class="secondary">Naver</span>
		<span role="button" class="secondary">Daum</span>
		<span role="button" class="secondary">Bing</span>
		<span role="button" class="secondary">Yandex</span>
	</div>
</main>

<style>
	main > div {
		margin-bottom: var(--spacing);
	}

	:is([role='button']).primary {
		width: 8rem;
	}

	span {
		margin-bottom: 0.1rem;
	}
</style>

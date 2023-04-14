<script lang="ts">
	import '../app.scss'

	import debugFactory from 'debug'
	const log = debugFactory('log')
	log('Hello')

	import defaultPlanToml from '$lib/plans/default.toml?raw'
</script>

<main class="container">
	<pre>{defaultPlanToml}</pre>
</main>

<script lang="ts">
	import '../app.scss'

	import debugFactory from 'debug'
	const log = debugFactory('log')
	log('Hello')

	import TOML from '@ltd/j-toml'

	import defaultPlanToml from '$lib/plans/default.toml?raw'

	const defaultPlanJson = TOML.parse(defaultPlanToml)

	log(defaultPlanJson)
</script>

<main class="container">
	<pre>{defaultPlanToml}</pre>
</main>

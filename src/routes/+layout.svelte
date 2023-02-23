<script lang="ts">
	import '@picocss/pico'
</script>

<nav class="container">
	<h1>
		<a class="brand" href="/">MultiLaunch</a>
		<small><a href="/settings">Settings</a> <a href="/doc">Help&Tips</a></small>
	</h1>
</nav>

<slot />

<style>
	.brand {
		color: var(--primary-color);
		text-decoration: none;
	}

	h1 {
		margin-bottom: 0;
	}
	small {
		font-size: 42%;
		font-weight: normal;
	}
</style>

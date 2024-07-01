<script>
	import { onMount } from 'svelte';

	let count = 0
	
	const incrementCount = () => {
		count++
	}
	onMount(async () => {
		setTimeout(incrementCount,1000)
	});
</script>

<style>
	h3, button {
		font-family: Verdana, Arial, sans-serif;
	}
</style>
<div class="border-pink-400 border-solid border-2 p-1 m-3">
<h3>
	Svelte Button was clicked {count} {count === 1 ? 'time' : 'times'}
</h3>

<button on:click|preventDefault={incrementCount} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
	Increment count Svelte
</button>
</div>
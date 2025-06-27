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
	.svelte-component{
		border: pink solid 2px;
		padding: 1rem;
		margin: 3rem;
	}
	.svelte-button{
		background: hsl(from pink h s calc(l*1.02));
		font-weight:bold;
		padding: 0.5rem 1rem;
  		border-radius:10px;
		color: white;
  
		&:hover{
			background: hsl(from pink h s calc(l*0.9));

		}
	}
</style>
<div class="svelte-component">
<h3>
	Svelte Button was clicked {count} {count === 1 ? 'time' : 'times'}
</h3>

<button on:click|preventDefault={incrementCount} class="svelte-button">
	Increment count Svelte
</button>
</div>
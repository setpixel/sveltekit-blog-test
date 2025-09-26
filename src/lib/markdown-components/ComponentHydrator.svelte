<script>
	import { onMount } from 'svelte';
	import { mount } from 'svelte';
	import { getComponent } from './registry.js';
	
	let { components = [] } = $props();
	
	onMount(() => {
		// Hydrate each client component
		components.forEach(({ id, name, props }) => {
			const element = document.getElementById(id);
			if (!element) {
				console.warn(`Element with id ${id} not found for component ${name}`);
				return;
			}
			
			const componentInfo = getComponent(name);
			if (!componentInfo || componentInfo.type !== 'client') {
				console.warn(`Client component ${name} not found in registry`);
				return;
			}
			
			// Clear the placeholder content
			element.innerHTML = '';
			
			// Mount the Svelte component
			mount(componentInfo.component, {
				target: element,
				props
			});
		});
	});
</script>
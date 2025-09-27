// Registry of all available markdown components
export const componentRegistry = {};

// Register a server-side component
export function registerServerComponent(name, renderFn, options = {}) {
	componentRegistry[name] = {
		type: 'server',
		render: renderFn,
		inline: options.inline || false
	};
}

// Register a client-side component
export function registerClientComponent(name, component, options = {}) {
	componentRegistry[name] = {
		type: 'client',
		component,
		inline: options.inline || false
	};
}

// Get a component from the registry
export function getComponent(name) {
	return componentRegistry[name];
}

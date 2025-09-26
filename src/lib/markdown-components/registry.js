// Registry of all available markdown components
export const componentRegistry = {};

// Register a server-side component
export function registerServerComponent(name, renderFn) {
	componentRegistry[name] = {
		type: 'server',
		render: renderFn
	};
}

// Register a client-side component
export function registerClientComponent(name, component) {
	componentRegistry[name] = {
		type: 'client',
		component
	};
}

// Get a component from the registry
export function getComponent(name) {
	return componentRegistry[name];
}

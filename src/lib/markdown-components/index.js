// Import and register server components
import './server/Section.js';
import './server/Alert.js';
import './server/Card.js';
import './server/YearsAgo.js';

// Import and register client components
import RelativeTime from './client/RelativeTime.svelte';
import Counter from './client/Counter.svelte';
import { registerClientComponent } from './registry.js';

// Register client components
registerClientComponent('RelativeTime', RelativeTime);
registerClientComponent('Counter', Counter);

// Export main functions
export { renderMarkdownWithComponents } from './renderer.js';
export { componentRegistry } from './registry.js';

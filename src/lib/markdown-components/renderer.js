import { Marked } from 'marked';
import { componentRegistry } from './registry.js';

// Store client components for each render
let clientComponents = [];
let componentCounter = 0;

// Simple hash function for generating deterministic IDs
function simpleHash(str) {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash).toString(36);
}

// Create marked extension for handling components
const componentExtension = {
	name: 'components',
	level: 'block',
	start(src) {
		// Look for component tags
		return src.match(/<[A-Z]/)?.index;
	},
	tokenizer(src) {
		// Match component tags like <ComponentName prop="value">content</ComponentName>
		const match = src.match(/^<([A-Z][A-Za-z0-9]*)\s*([^>]*)>(.*?)<\/\1>/s);
		const selfClosingMatch = src.match(/^<([A-Z][A-Za-z0-9]*)\s*([^/>]*)\s*\/>/);
		
		if (selfClosingMatch) {
			return {
				type: 'components',
				raw: selfClosingMatch[0],
				componentName: selfClosingMatch[1],
				propsString: selfClosingMatch[2],
				content: null
			};
		}
		
		if (match) {
			return {
				type: 'components',
				raw: match[0],
				componentName: match[1],
				propsString: match[2],
				content: match[3]
			};
		}
	},
	renderer(token) {
		const component = componentRegistry[token.componentName];
		
		if (!component) {
			console.warn(`Component ${token.componentName} not found in registry`);
			return `<!-- Unknown component: ${token.componentName} -->`;
		}
		
		// Parse props
		const props = {};
		const propPattern = /(\w+)=["']([^"']*)["']/g;
		let match;
		
		while ((match = propPattern.exec(token.propsString)) !== null) {
			props[match[1]] = match[2];
		}
		
		if (component.type === 'server') {
			// Server-side component - render immediately
			// Process content for nested components if it exists
			let processedContent = token.content;
			if (processedContent) {
				// Recursively render nested components
				const nestedResult = renderMarkdownWithComponentsInternal(processedContent, false);
				processedContent = nestedResult.html;
				// Client components from nested renders are already collected
			}
			return component.render(props, processedContent);
		} else if (component.type === 'client') {
			// Client-side component - create deterministic ID
			componentCounter++;
			const hashInput = `${token.componentName}-${componentCounter}-${token.propsString}`;
			const componentId = `md-component-${simpleHash(hashInput)}-${componentCounter}`;
			
			clientComponents.push({
				id: componentId,
				name: token.componentName,
				props,
				content: token.content
			});
			
			// Return a placeholder div that will be hydrated on client
			return `<div id="${componentId}" data-component="${token.componentName}" data-props='${JSON.stringify(props)}'>${token.content || ''}</div>`;
		}
		
		return '';
	}
};

// Create a new instance of marked for component rendering
const markedWithComponents = new Marked();
markedWithComponents.use({ extensions: [componentExtension] });
markedWithComponents.setOptions({
	breaks: true,
	gfm: true
});

// Get inline components dynamically from registry
function getInlineComponents() {
	return Object.keys(componentRegistry).filter(name => componentRegistry[name].inline);
}

// Internal function that doesn't reset client components
function renderMarkdownWithComponentsInternal(markdown, resetComponents = true) {
	if (resetComponents) {
		clientComponents = [];
		componentCounter = 0;
	}
	
	// Get inline components from registry
	const inlineComponents = getInlineComponents();
	
	// Pre-process markdown to handle inline components
	if (inlineComponents.length > 0) {
		const inlineComponentRegex = new RegExp(`<(${inlineComponents.join('|')})\\s*([^/>]*)\\s*/>`, 'g');
		const placeholders = [];
		let processedMarkdown = markdown.replace(inlineComponentRegex, (match, componentName, propsString) => {
			const placeholder = `%%%INLINE_COMPONENT_${placeholders.length}%%%`;
			placeholders.push({ match, componentName, propsString });
			return placeholder;
		});
		
		// Render the markdown
		let html = markedWithComponents.parse(processedMarkdown);
		
		// Replace placeholders with actual inline components
		placeholders.forEach(({ match, componentName, propsString }, index) => {
			const component = componentRegistry[componentName];
			const placeholder = `%%%INLINE_COMPONENT_${index}%%%`;
			
			if (component) {
				// Parse props
				const props = {};
				const propPattern = /(\w+)=["']([^"']*)["']/g;
				let propMatch;
				while ((propMatch = propPattern.exec(propsString)) !== null) {
					props[propMatch[1]] = propMatch[2];
				}
				
				if (component.type === 'server') {
					// Render the server component
					const rendered = component.render(props, null);
					html = html.replace(placeholder, rendered);
				} else if (component.type === 'client') {
					// Handle client-side component
					componentCounter++;
					const hashInput = `${componentName}-${componentCounter}-${propsString}`;
					const componentId = `md-component-${simpleHash(hashInput)}-${componentCounter}`;
					
					clientComponents.push({
						id: componentId,
						name: componentName,
						props,
						content: null
					});
					
					// Return a placeholder span that will be hydrated on client
					const rendered = `<span id="${componentId}" data-component="${componentName}" data-props='${JSON.stringify(props)}'></span>`;
					html = html.replace(placeholder, rendered);
				}
			} else {
				// If not found, put the original back
				html = html.replace(placeholder, match);
			}
		});
		
		return {
			html,
			clientComponents: [...clientComponents]
		};
	}
	
	// If no inline components, just render normally
	const html = markedWithComponents.parse(markdown);
	return {
		html,
		clientComponents: [...clientComponents]
	};
}

// Main function to render markdown with components
export function renderMarkdownWithComponents(markdown) {
	return renderMarkdownWithComponentsInternal(markdown, true);
}

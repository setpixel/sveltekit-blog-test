import { registerServerComponent } from '../registry.js';

// SSR Section component
function renderSection(props, content) {
	const { title, class: className = '' } = props;
	
	return `
		<section class="markdown-section ${className}">
			${title ? `<h3 class="section-title">${title}</h3>` : ''}
			<div class="section-content">
				${content || ''}
			</div>
		</section>
	`;
}

// Register the component
registerServerComponent('Section', renderSection);
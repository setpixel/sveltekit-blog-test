import { registerServerComponent } from '../registry.js';

function renderCard(props, content) {
	const { title, variant = 'default' } = props;
	
	return `
		<div class="markdown-card ${variant}">
			${title ? `<h4 class="card-title">${title}</h4>` : ''}
			<div class="card-content">
				${content || ''}
			</div>
		</div>
	`;
}

registerServerComponent('Card', renderCard);

import { registerServerComponent } from '../registry.js';

function renderAlert(props, content) {
	const { type = 'info', title } = props;
	
	const typeClasses = {
		info: 'alert-info',
		warning: 'alert-warning', 
		error: 'alert-error',
		success: 'alert-success'
	};
	
	return `
		<div class="markdown-alert ${typeClasses[type] || 'alert-info'}">
			${title ? `<strong class="alert-title">${title}</strong>` : ''}
			<div class="alert-content">
				${content || ''}
			</div>
		</div>
	`;
}

registerServerComponent('Alert', renderAlert);

import { registerServerComponent } from '../registry.js';

function renderYearsAgo(props, content) {
	const { date } = props;
	
	if (!date) {
		return '<span class="years-ago error">No date provided</span>';
	}
	
	try {
		const targetDate = new Date(date);
		const now = new Date();
		
		// Check if the date is valid
		if (isNaN(targetDate.getTime())) {
			return '<span class="years-ago error">Invalid date</span>';
		}
		
		// Calculate the difference in years
		const diffTime = now - targetDate;
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
		const years = Math.floor(diffDays / 365);
		
		// Handle edge cases
		if (years < 0) {
			return '<span class="years-ago future">in the future</span>';
		} else if (years === 0) {
			return '<span class="years-ago recent">this year</span>';
		} else if (years === 1) {
			return '<span class="years-ago">1 year ago</span>';
		} else {
			return `<span class="years-ago">${years} years ago</span>`;
		}
	} catch (error) {
		return '<span class="years-ago error">Invalid date format</span>';
	}
}

registerServerComponent('YearsAgo', renderYearsAgo);

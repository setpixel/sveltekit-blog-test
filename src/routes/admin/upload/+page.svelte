<script>
	import { onMount } from 'svelte';
	
	let files = $state([]);
	let loading = $state(false);
	let uploading = $state(false);
	let error = $state('');
	let success = $state('');
	let dragOver = $state(false);

	onMount(() => {
		loadFiles();
	});

	async function loadFiles() {
		loading = true;
		try {
			const response = await fetch('/api/upload');
			const data = await response.json();
			
			if (data.error) {
				error = data.error;
			} else {
				files = data.files;
			}
		} catch (err) {
			error = 'Failed to load files';
		}
		loading = false;
	}

	async function handleFileUpload(fileInput) {
		const file = fileInput.files[0];
		if (!file) return;

		uploading = true;
		error = '';
		success = '';

		try {
			const formData = new FormData();
			formData.append('file', file);
			formData.append('folder', 'uploads');

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (result.error) {
				error = result.error;
			} else {
				success = `File uploaded successfully! URL: ${result.url}`;
				loadFiles(); // Refresh file list
			}
		} catch (err) {
			error = 'Upload failed';
		}

		uploading = false;
		fileInput.value = ''; // Reset input
	}

	async function deleteFile(key) {
		if (!confirm('Are you sure you want to delete this file?')) return;

		try {
			const response = await fetch('/api/upload', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ key })
			});

			const result = await response.json();

			if (result.error) {
				error = result.error;
			} else {
				success = 'File deleted successfully';
				loadFiles(); // Refresh file list
			}
		} catch (err) {
			error = 'Delete failed';
		}
	}

	function handleDragOver(e) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(e) {
		e.preventDefault();
		dragOver = false;
	}

	function handleDrop(e) {
		e.preventDefault();
		dragOver = false;
		
		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileUpload({ files });
		}
	}

	function copyToClipboard(url) {
		navigator.clipboard.writeText(url);
		success = 'URL copied to clipboard!';
		setTimeout(() => success = '', 3000);
	}

	function formatFileSize(bytes) {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
	}
</script>

<svelte:head>
	<title>File Upload - Admin</title>
</svelte:head>

<div class="upload-container">
	<h1>File Upload</h1>

	{#if error}
		<div class="error">{error}</div>
	{/if}

	{#if success}
		<div class="success">{success}</div>
	{/if}

	<!-- Upload Area -->
	<div 
		class="upload-area" 
		class:drag-over={dragOver}
		on:dragover={handleDragOver}
		on:dragleave={handleDragLeave}
		on:drop={handleDrop}
	>
		<div class="upload-content">
			<svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
				<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
				<polyline points="7,10 12,15 17,10"/>
				<line x1="12" y1="15" x2="12" y2="3"/>
			</svg>
			<h3>Drop files here or click to upload</h3>
			<p>Supports: JPG, PNG, GIF, WebP, PDF (max 10MB)</p>
			<input 
				type="file" 
				accept="image/*,.pdf"
				on:change={(e) => handleFileUpload(e.target)}
				disabled={uploading}
			/>
		</div>
	</div>

	{#if uploading}
		<div class="uploading">Uploading...</div>
	{/if}

	<!-- File List -->
	<div class="files-section">
		<div class="section-header">
			<h2>Uploaded Files</h2>
			<button on:click={loadFiles} disabled={loading}>
				{loading ? 'Loading...' : 'Refresh'}
			</button>
		</div>

		{#if loading}
			<div class="loading">Loading files...</div>
		{:else if files.length === 0}
			<div class="no-files">No files uploaded yet</div>
		{:else}
			<div class="files-grid">
				{#each files as file}
					<div class="file-card">
						{#if file.key.includes('.jpg') || file.key.includes('.jpeg') || file.key.includes('.png') || file.key.includes('.gif') || file.key.includes('.webp')}
							<img src={file.url} alt="Uploaded image" class="file-preview" />
						{:else}
							<div class="file-icon">📄</div>
						{/if}
						
						<div class="file-info">
							<div class="file-name">{file.key.split('/').pop()}</div>
							<div class="file-meta">
								{formatFileSize(file.size)} • 
								{new Date(file.lastModified).toLocaleDateString()}
							</div>
						</div>
						
						<div class="file-actions">
							<button on:click={() => copyToClipboard(file.url)} class="btn-copy">
								Copy URL
							</button>
							<button on:click={() => deleteFile(file.key)} class="btn-delete">
								Delete
							</button>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.upload-container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem 1rem;
	}

	h1 {
		margin-bottom: 2rem;
		color: #333;
	}

	.error {
		background: #fee;
		color: #c33;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #fcc;
	}

	.success {
		background: #efe;
		color: #363;
		padding: 0.75rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #cfc;
	}

	.upload-area {
		border: 2px dashed #ddd;
		border-radius: 8px;
		padding: 3rem;
		text-align: center;
		margin-bottom: 2rem;
		transition: all 0.2s;
		cursor: pointer;
		position: relative;
	}

	.upload-area:hover,
	.upload-area.drag-over {
		border-color: #007acc;
		background-color: #f8f9ff;
	}

	.upload-area input[type="file"] {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		cursor: pointer;
	}

	.upload-content {
		pointer-events: none;
	}

	.upload-icon {
		width: 48px;
		height: 48px;
		color: #666;
		margin-bottom: 1rem;
	}

	.upload-content h3 {
		margin: 0 0 0.5rem 0;
		color: #333;
	}

	.upload-content p {
		margin: 0;
		color: #666;
	}

	.uploading {
		text-align: center;
		color: #007acc;
		font-weight: 500;
		margin-bottom: 2rem;
	}

	.files-section {
		margin-top: 3rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.section-header h2 {
		margin: 0;
		color: #333;
	}

	.section-header button {
		background: #007acc;
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		cursor: pointer;
	}

	.section-header button:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	.loading, .no-files {
		text-align: center;
		color: #666;
		padding: 2rem;
	}

	.files-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 1rem;
	}

	.file-card {
		border: 1px solid #ddd;
		border-radius: 8px;
		padding: 1rem;
		background: white;
		transition: transform 0.2s;
	}

	.file-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.file-preview {
		width: 100%;
		height: 150px;
		object-fit: cover;
		border-radius: 4px;
		margin-bottom: 0.75rem;
	}

	.file-icon {
		font-size: 3rem;
		text-align: center;
		margin-bottom: 0.75rem;
	}

	.file-info {
		margin-bottom: 1rem;
	}

	.file-name {
		font-weight: 500;
		color: #333;
		margin-bottom: 0.25rem;
		word-break: break-all;
	}

	.file-meta {
		font-size: 0.875rem;
		color: #666;
	}

	.file-actions {
		display: flex;
		gap: 0.5rem;
	}

	.btn-copy, .btn-delete {
		flex: 1;
		padding: 0.5rem;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.875rem;
	}

	.btn-copy {
		background: #28a745;
		color: white;
	}

	.btn-delete {
		background: #dc3545;
		color: white;
	}

	.btn-copy:hover {
		background: #218838;
	}

	.btn-delete:hover {
		background: #c82333;
	}
</style>

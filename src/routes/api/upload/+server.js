import { json } from '@sveltejs/kit';
import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { isAdmin } from '$lib/admin.js';

// R2 client configuration
function getR2Client(env) {
	return new S3Client({
		region: 'auto',
		endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: env.R2_ACCESS_KEY_ID,
			secretAccessKey: env.R2_SECRET_ACCESS_KEY
		}
	});
}

export async function POST({ request, locals, platform }) {
	if (!locals.session || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file');
		const folder = formData.get('folder') || 'uploads';

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
		if (!allowedTypes.includes(file.type)) {
			return json({ error: 'File type not allowed' }, { status: 400 });
		}

		// Validate file size (10MB max)
		if (file.size > 10 * 1024 * 1024) {
			return json({ error: 'File too large (max 10MB)' }, { status: 400 });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const extension = file.name.split('.').pop();
		const filename = `${timestamp}-${randomString}.${extension}`;
		const key = `${folder}/${filename}`;

		console.log('Uploading file:', { filename, key, size: file.size, type: file.type });

		// Get R2 client
		const r2Client = getR2Client(platform.env);

		// Convert file to Uint8Array for better compatibility
		const arrayBuffer = await file.arrayBuffer();
		const uint8Array = new Uint8Array(arrayBuffer);

		// Upload to R2
		const uploadCommand = new PutObjectCommand({
			Bucket: platform.env.PUBLIC_R2_BUCKET_NAME,
			Key: key,
			Body: uint8Array,
			ContentType: file.type,
			ContentLength: uint8Array.length,
			Metadata: {
				originalName: file.name,
				uploadedBy: locals.user.id,
				uploadedAt: new Date().toISOString()
			}
		});

		console.log('Sending upload command...');
		const result = await r2Client.send(uploadCommand);
		console.log('Upload result:', result);

		// Generate public URL using custom domain
		const publicUrl = `${platform.env.PUBLIC_R2_URL}/${key}`;

		console.log('Generated URL:', publicUrl);

		return json({
			success: true,
			url: publicUrl,
			filename: filename,
			originalName: file.name,
			size: file.size,
			type: file.type
		});

	} catch (error) {
		console.error('Upload error:', error);
		return json({ error: `Upload failed: ${error.message}` }, { status: 500 });
	}
}

export async function GET({ locals, platform }) {
	if (!locals.session || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const r2Client = getR2Client(platform.env);
		
		const listCommand = new ListObjectsV2Command({
			Bucket: platform.env.PUBLIC_R2_BUCKET_NAME,
			Prefix: 'uploads/',
			MaxKeys: 100
		});

		const response = await r2Client.send(listCommand);
		console.log('List response:', response);
		
		const files = (response.Contents || []).map(obj => ({
			key: obj.Key,
			size: obj.Size,
			lastModified: obj.LastModified,
			url: `${platform.env.PUBLIC_R2_URL}/${obj.Key}`
		}));

		console.log('Files found:', files.length);

		return json({ files });

	} catch (error) {
		console.error('List files error:', error);
		return json({ error: 'Failed to list files' }, { status: 500 });
	}
}

export async function DELETE({ request, locals, platform }) {
	if (!locals.session || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		const { key } = await request.json();
		
		if (!key) {
			return json({ error: 'No file key provided' }, { status: 400 });
		}

		const r2Client = getR2Client(platform.env);
		
		const deleteCommand = new DeleteObjectCommand({
			Bucket: platform.env.PUBLIC_R2_BUCKET_NAME,
			Key: key
		});

		await r2Client.send(deleteCommand);

		return json({ success: true });

	} catch (error) {
		console.error('Delete file error:', error);
		return json({ error: 'Failed to delete file' }, { status: 500 });
	}
}

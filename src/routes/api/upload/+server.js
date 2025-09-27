import { json } from '@sveltejs/kit';
import { isAdmin } from '$lib/admin.js';

// Helper function to get R2 configuration
function getR2Config(locals, platform) {
	// Check if we're in production (ENVIRONMENT must be explicitly set to "production")
	const env = locals?.runtime?.env || platform?.env || {};
	const isProduction = env.ENVIRONMENT === 'production';
	
	console.log('Environment:', isProduction ? 'production' : 'development');
	
	if (isProduction) {
		// Production: use Cloudflare Workers bindings
		if (!env.R2_BUCKET || !env.PUBLIC_R2_URL) {
			throw new Error('R2 bucket or public URL not configured in production');
		}
		
		console.log('Using Cloudflare Workers bindings');
		return {
			type: 'workers',
			bucket: env.R2_BUCKET,
			publicUrl: env.PUBLIC_R2_URL
		};
	} else {
		// Development: use AWS SDK with environment variables
		console.log('Checking development environment variables...');
		
		if (!process.env.PUBLIC_R2_URL || !process.env.R2_ACCOUNT_ID || 
			!process.env.R2_ACCESS_KEY_ID || !process.env.R2_SECRET_ACCESS_KEY || 
			!process.env.PUBLIC_R2_BUCKET_NAME) {
			console.error('Missing environment variables:', {
				PUBLIC_R2_URL: !!process.env.PUBLIC_R2_URL,
				R2_ACCOUNT_ID: !!process.env.R2_ACCOUNT_ID,
				R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
				R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
				PUBLIC_R2_BUCKET_NAME: !!process.env.PUBLIC_R2_BUCKET_NAME
			});
			throw new Error('R2 configuration missing in .env file');
		}
		
		console.log('Using AWS SDK for development');
		return {
			type: 'sdk',
			accountId: process.env.R2_ACCOUNT_ID,
			accessKeyId: process.env.R2_ACCESS_KEY_ID,
			secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
			bucketName: process.env.PUBLIC_R2_BUCKET_NAME,
			publicUrl: process.env.PUBLIC_R2_URL
		};
	}
}

// Helper function to create R2 client for SDK mode
async function createR2Client(config) {
	// Dynamically import AWS SDK only when needed
	const { S3Client } = await import('@aws-sdk/client-s3');
	
	return new S3Client({
		region: 'auto',
		endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
		credentials: {
			accessKeyId: config.accessKeyId,
			secretAccessKey: config.secretAccessKey
		}
	});
}

export async function POST({ request, locals, platform }) {
	console.log('=== UPLOAD REQUEST START ===');
	
	if (!locals.session || !locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Check if user is admin
	const userIsAdmin = await isAdmin(locals.user);
	if (!userIsAdmin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	try {
		// Get R2 configuration
		const r2Config = getR2Config(locals, platform);

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

		const arrayBuffer = await file.arrayBuffer();

		if (r2Config.type === 'workers') {
			// Production: Upload using Cloudflare Workers binding
			await r2Config.bucket.put(key, arrayBuffer, {
				httpMetadata: {
					contentType: file.type,
				},
				customMetadata: {
					originalName: file.name,
					uploadedBy: locals.user.id,
					uploadedAt: new Date().toISOString()
				}
			});
			console.log('File uploaded via Workers binding');
		} else {
			// Development: Upload using AWS SDK
			const { PutObjectCommand } = await import('@aws-sdk/client-s3');
			const r2Client = await createR2Client(r2Config);
			
			const command = new PutObjectCommand({
				Bucket: r2Config.bucketName,
				Key: key,
				Body: Buffer.from(arrayBuffer),
				ContentType: file.type,
				Metadata: {
					originalName: file.name,
					uploadedBy: locals.user.id,
					uploadedAt: new Date().toISOString()
				}
			});

			console.log('Uploading to R2 via SDK:', {
				bucket: r2Config.bucketName,
				key: key
			});

			await r2Client.send(command);
			console.log('File uploaded via AWS SDK');
		}

		const fileUrl = `${r2Config.publicUrl}/${key}`;
		console.log('File available at:', fileUrl);

		return json({
			success: true,
			url: fileUrl,
			filename: filename,
			originalName: file.name,
			size: file.size,
			type: file.type
		});

	} catch (error) {
		console.error('Upload error:', error);
		console.error('Error stack:', error.stack);
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
		// Get R2 configuration
		const r2Config = getR2Config(locals, platform);

		let files = [];

		if (r2Config.type === 'workers') {
			// Production: List using Cloudflare Workers binding
			const listed = await r2Config.bucket.list({
				prefix: 'uploads/',
				limit: 100
			});

			files = listed.objects.map(obj => ({
				key: obj.key,
				size: obj.size,
				lastModified: obj.uploaded,
				url: `${r2Config.publicUrl}/${obj.key}`
			}));
		} else {
			// Development: List using AWS SDK
			const { ListObjectsV2Command } = await import('@aws-sdk/client-s3');
			const r2Client = await createR2Client(r2Config);
			
			const command = new ListObjectsV2Command({
				Bucket: r2Config.bucketName,
				Prefix: 'uploads/',
				MaxKeys: 100
			});

			const response = await r2Client.send(command);
			
			files = (response.Contents || []).map(obj => ({
				key: obj.Key,
				size: obj.Size,
				lastModified: obj.LastModified?.toISOString(),
				url: `${r2Config.publicUrl}/${obj.Key}`
			}));
		}

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

		// Get R2 configuration
		const r2Config = getR2Config(locals, platform);

		if (r2Config.type === 'workers') {
			// Production: Delete using Cloudflare Workers binding
			await r2Config.bucket.delete(key);
		} else {
			// Development: Delete using AWS SDK
			const { DeleteObjectCommand } = await import('@aws-sdk/client-s3');
			const r2Client = await createR2Client(r2Config);
			
			const command = new DeleteObjectCommand({
				Bucket: r2Config.bucketName,
				Key: key
			});

			await r2Client.send(command);
		}

		console.log('File deleted:', key);

		return json({ success: true });

	} catch (error) {
		console.error('Delete file error:', error);
		return json({ error: 'Failed to delete file' }, { status: 500 });
	}
}

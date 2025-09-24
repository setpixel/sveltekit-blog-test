import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const r2 = new S3Client({
	region: 'auto',
	endpoint: `https://${PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
	credentials: {
		accessKeyId: R2_ACCESS_KEY_ID,
		secretAccessKey: R2_SECRET_ACCESS_KEY
	}
});

export async function uploadToR2(file, key) {
	const command = new PutObjectCommand({
		Bucket: PUBLIC_R2_BUCKET_NAME,
		Key: key,
		Body: file,
		ContentType: file.type
	});
	
	return await r2.send(command);
}

export function getR2Url(key) {
	return `https://${PUBLIC_R2_BUCKET_NAME}.${PUBLIC_R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
}
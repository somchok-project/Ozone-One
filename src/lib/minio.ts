import { Client } from "minio";

const endpoint = process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000";
const url = new URL(endpoint);

const globalForMinio = globalThis as unknown as { minio?: Client };

export const minio =
    globalForMinio.minio ??
    new Client({
        endPoint: url.hostname,
        port: url.port ? parseInt(url.port) : (url.protocol === "https:" ? 443 : 9000),
        useSSL: url.protocol === "https:",
        accessKey: process.env.MINIO_ACCESS_KEY ?? "minioadmin",
        secretKey: process.env.MINIO_SECRET_KEY ?? "minioadmin",
    });

if (process.env.NODE_ENV !== "production") {
    globalForMinio.minio = minio;
}

export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? "ozone-one";

/** Ensure the bucket exists, creating it if not */
export async function ensureBucket() {
    const exists = await minio.bucketExists(MINIO_BUCKET);
    if (!exists) {
        await minio.makeBucket(MINIO_BUCKET, "us-east-1");
        // Set public read policy so URLs work directly
        const policy = JSON.stringify({
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${MINIO_BUCKET}/*`],
                },
            ],
        });
        await minio.setBucketPolicy(MINIO_BUCKET, policy);
    }
}

/** Upload a buffer and return the public URL */
export async function uploadToMinio(
    objectName: string,
    buffer: Buffer,
    contentType: string,
): Promise<string> {
    await ensureBucket();
    await minio.putObject(MINIO_BUCKET, objectName, buffer, buffer.length, {
        "Content-Type": contentType,
    });
    const endpoint = process.env.MINIO_ENDPOINT ?? "http://127.0.0.1:9000";
    return `${endpoint}/${MINIO_BUCKET}/${objectName}`;
}

// utils/media.ts
export function getS3Url(media: unknown): string | undefined {
    if (typeof media === 'object' && media !== null && 's3_url' in media) {
        return (media as any).s3_url;
    }
    return undefined;
}

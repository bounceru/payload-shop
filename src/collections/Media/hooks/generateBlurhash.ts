import sharp from 'sharp';
import { encode } from 'blurhash';

export const generateBlurhash = async ({ filename }: { filename: string }) => {
    const cdnUrl = process.env.DO_CDN_URL;
    if (!cdnUrl) {
        throw new Error('Environment variable DO_CDN_URL is not set.');
    }

    const url = `${cdnUrl}/${encodeURIComponent(filename)}`;
    console.log(`Attempting to fetch image from URL: ${url}`);

    try {
        // Retry fetching the image up to 3 times
        const response = await retryFetch(url, 3, 1000);
        console.log(`Successfully fetched image from URL: ${url}`);

        const buffer = Buffer.from(await response.arrayBuffer());

        // Generate Blurhash
        const image = sharp(buffer).raw().ensureAlpha();
        const { data, info } = await image.toBuffer({ resolveWithObject: true });
        const blurhash = encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
        console.log('Blurhash generated successfully.');

        return blurhash;
    } catch (error) {
        console.error(`Error generating Blurhash for URL: ${url}`, error);
        throw error;
    }
};

// Helper function to retry fetching the image
const retryFetch = async (url: string, retries = 3, delay = 1000): Promise<Response> => {
    for (let attempt = 1; attempt <= retries; attempt++) {
        console.log(`Attempt ${attempt} to fetch image from URL: ${url}`);
        const response = await fetch(url);
        if (response.ok) {
            console.log(`Image fetched successfully on attempt ${attempt} from URL: ${url}`);
            return response;
        }
        console.warn(`Attempt ${attempt} failed for URL: ${url}, status: ${response.status}`);
        if (attempt < retries) {
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error(`Failed to fetch image from ${url} after ${retries} attempts.`);
};

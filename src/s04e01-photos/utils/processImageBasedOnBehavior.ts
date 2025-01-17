import { verifyResults } from '../../utils/verifyResults';

export const processImageBasedOnBehavior = async (
    imageBehavior: string,
    imageUrl: string,
): Promise<string | null> => {
    const basePath = 'https://centrala.ag3nts.org/dane/barbara';
    const validBehaviors = ['REPAIR', 'DARKEN', 'BRIGHTEN'];
    if (!validBehaviors.includes(imageBehavior)) {
        console.error(`Invalid image behavior: ${imageBehavior}`);

        return null;
    }

    const fileName = extractFileName(imageUrl);
    if (!fileName) {

        console.error('Failed to extract file name from URL.');
        return null;
    }

    const prompt = `${imageBehavior} ${fileName}`;
    console.log(`Processing image with prompt: ${prompt}`);

    try {
        // verifyResults function used as a photo processing API
        const response = await verifyResults(prompt, 'photos');

        if (!response || !response.message) {
            console.error('Invalid response from verifyResults.');

            return null;
        }

        const newImageUrl = extractNewImageFromResponse(response.message, basePath);
        if (!newImageUrl) {
            console.error('Failed to extract new image URL or file name.');

            return null;
        }

        return newImageUrl;
    } catch (error) {
        console.error(`Error while processing image: ${error}`);

        return null;
    }
};

const extractFileName = (imageUrl: string): string | null => {
    try {
        const { pathname } = new URL(imageUrl);
        return pathname.split('/').pop() || null;
    } catch (error) {
        console.error(`Error extracting file name: ${error}`);

        return null;
    }
};

const extractNewImageFromResponse = (
    responseMessage: string,
    basePath: string
): string | null => {
    try {
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlMatch = responseMessage.match(urlRegex);

        if (urlMatch) {
            return urlMatch[0];
        }

        const fileNameRegex = /\b\w+\.\w{3,4}\b/g;
        const fileNameMatch = responseMessage.match(fileNameRegex);

        if (fileNameMatch) {
            return `${basePath.replace(/\/$/, '')}/${fileNameMatch[0]}`; // Ensure basePath does not end with '/'
        }

        console.error('Response did not contain a valid URL or filename.');

        return null;
    } catch (error) {
        console.error(`Error extracting new image URL or filename: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return null;
    }
};

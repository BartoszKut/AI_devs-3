import { verifyResults } from '../utils/verifyResults';
import { OpenAIService } from '../modules/OpenAIService';
import { ChatCompletion } from 'openai/resources/chat/completions';
import { extractImages } from './utils/extractImages';
import { processImageBasedOnBehavior } from './utils/processImageBasedOnBehavior';

const callOpenAI = async (
    openAiservice: OpenAIService,
    prompt: string,
    additionalMessages: any = []
): Promise<ChatCompletion | null> => {
    try {
        return await openAiservice.completion({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: prompt },
                ...additionalMessages,
            ],
        }) as ChatCompletion;
    } catch (error) {
        console.error('[OpenAI] Error:', error);

        return null;
    }
};

const fixImage = async (
    imageUrl: string,
    openAiservice: OpenAIService,
    maxRetries = 5
): Promise<string> => {
    const prompt = `You are a helpful assistant who helps with image repair.
        <rules>
            1. Your role is to classify the given image to indicate what should be done to make it more readable.
            2. You can use one of 4 groups:
                - REPAIR if the picture needs to be repaired (e.g., blurry, damaged, or corrupted images).
                - DARKEN if the picture needs to be darkened (e.g., overly bright or washed-out images).
                - BRIGHTEN if the picture needs to be brightened (e.g., too dark or underexposed images).
                - OK if the picture is fine and could be described in detail (e.g., clear and properly exposed images).
            3. Return ALWAYS ONLY one word: REPAIR, DARKEN, BRIGHTEN, or OK.
        </rules>
        <examples>
            Example 1: A blurry image with visible artifacts.
            AI: REPAIR

            Example 2: An image that is too bright and lacks contrast.
            AI: DARKEN

            Example 3: An image that is too dark and hard to see.
            AI: BRIGHTEN

            Example 4: A clear and well-exposed image.
            AI: OK
        </examples>`;

    let retries = 0;
    let currentImageUrl = imageUrl;

    while (retries < maxRetries) {
        try {
            console.log(`Fixing image: ${currentImageUrl}, Attempt: ${retries + 1}`);
            const promptResult = await callOpenAI(openAiservice, prompt, [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image_url',
                            image_url: { url: currentImageUrl },
                        },
                    ],
                },
            ]);

            if (!promptResult) throw new Error('OpenAI service failed.');

            const imageBehavior = promptResult.choices[0]?.message?.content?.trim() || '';

            if (imageBehavior === 'OK') return currentImageUrl;

            const newImageUrl = await processImageBasedOnBehavior(imageBehavior, currentImageUrl);
            if (!newImageUrl) {
                retries++;

                continue;
            }
            currentImageUrl = newImageUrl;
        } catch (error) {
            console.error(`Error during fixImage attempt ${retries + 1}:`, error);

            retries++;
        }
    }

    throw new Error('Max retries reached for fixing the image.');
};

export const generatePersonDescription = async (
    imageUrls: string[],
    openAiservice: OpenAIService
): Promise<string> => {
    const prompt = `You are a helpful assistant who describes the person based on the provided images.
        <rules>
            1. Your role is to describe the person in the image.
            2. You SHOULD describe the person's appearance, clothing, and any other relevant details.
            3. Description MUST contain hair color.
            4. Focus on one person, who is on the multiple images.
            5. Provide a detailed description of the person in the image, including her:
                - special signs
                - tattoos
                - scars
                - HAIR COLOR
                - etc.
            6. Descriptions should be in Polish.
        </rules>`;

    try {
        const response = await callOpenAI(
            openAiservice,
            prompt,
            [
                {
                    role: 'user',
                    content: imageUrls.map((url) => ({
                        type: 'image_url',
                        image_url: { url },
                    })),
                },
            ]
        );

        if (response?.choices?.[0]?.message?.content) {
            return response.choices[0]?.message?.content?.trim() || '';
        } else {
            console.error('No valid description generated by OpenAI.');

            return '';
        }
    } catch (error) {
        console.error('Error during description generation:', error);

        throw error;
    }
};

export const photos = async () => {
    const openAiService = new OpenAIService();
    const images = await extractImages(openAiService);

    if (!images || images.length === 0) {
        throw new Error('No images found to process.');
    }

    const correctedImages = await Promise.all(
        images.map((image) => fixImage(image, openAiService))
    );

    const personDescription = await generatePersonDescription(correctedImages, openAiService);

    const { message } = await verifyResults(personDescription, 'photos');

    return message;
};
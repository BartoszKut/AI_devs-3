import fs from 'fs';
import path from 'path';
import { OpenAIService } from '../modules/OpenAIService';
import { ChatCompletion } from 'openai/resources/chat/completions';

const PROMPT = `You are a helpful assistant who is an expert in recognizing cities based on pieces of maps.

    <rules>
        - Analyze the provided map images carefully.
        - Focus on identifying unique landmarks, street patterns, and other geographical features.
        - The city name should be in Polish.
        - Provide a single city name as the answer.
        - If unsure, provide the most likely city name based on the available information.
        - Consider that in the past, granaries and fortresses could be found in the city.
    </rules>
    
    <instructions>
        - Use your knowledge and the provided map images to determine the city.
        - Ensure the city name is accurate and complete.
        - Do not include any additional text or explanations in your response.
        - If multiple cities are possible, choose the one with the most distinctive features.
    </instructions>
`;

const encodeImageToBase64 = (filePath: string): string => {
    const fileBuffer = fs.readFileSync(filePath);

    return fileBuffer.toString('base64');
};

const prepareImagesForLLM = async (directory: string): Promise<{ type: string, image_url: { url: string } }[]> => {
    const images = await fs.promises.readdir(directory);
    const formattedImages: { type: string, image_url: { url: string } }[] = [];

    for (const image of images) {
        const imagePath = path.join(directory, image);

        if (fs.lstatSync(imagePath).isFile()) {
            const base64Image = encodeImageToBase64(imagePath);
            formattedImages.push({
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Image}` }
            });
        }
    }

    return formattedImages;
}

export const city = async () => {
    const openAiService = new OpenAIService();

    const preparedImages = await prepareImagesForLLM('src/s02e02-city/maps');

    const cityResponse = await openAiService.completion({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: PROMPT
            },
            {
                role: 'user',
                // @ts-ignore
                content: [...preparedImages]
            },
        ],
    }) as ChatCompletion;

    return cityResponse.choices[0].message.content;
}

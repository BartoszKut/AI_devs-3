import path from "path";
import fs from 'fs';

import { OpenAIService } from '../modules/OpenAIService';
import { ChatCompletion } from 'openai/resources/chat/completions';
import { prepareImagesForLLM } from '../utils/prepareImagesForLLM';

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
                content: [...preparedImages.map(image => ({ type: image.type, image_url: image.image_url }))],
            },
        ],
    }) as ChatCompletion;

    return cityResponse.choices[0].message.content;
};

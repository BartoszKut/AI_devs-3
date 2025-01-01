import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

import { CloudflareMistralService } from '../modules/CloudflareMistralService';
import { OpenAIService } from '../modules/OpenAIService';
import { verifyResults } from '../utils/verifyResults';

const getDescriptionKeyWords = async (description: string): Promise<string> => {
    const prompt = `You are a helpful assistant who extracts key phrases from the description of a robot.

    <rules>
        - Extract key phrases from the description of the robot.
        - Focus on the robot's abilities, features, and appearance.
        - Do not include any unnecessary phrases.
        - The provided description is in Polish, but the key phrases should be in english.
    </rules>
    
    <examples>
        USER: Te roboty, to teraz bardzo dziwne budują. Ten chodził na wielu nogach jak pająk jakiś. Ale odwłoka nie miał. Sama kamera na takich nogach. Ta kamera wszystko widziała, bo bez końca mu się obracała. Jak na mnie zooma zrobił, to aż mnie ciarki przeszły!
        AI:  legs like a spider, no trunk, rotating camera on legs, zoom
    </examples>
    `;

    const mistralResponse = await CloudflareMistralService.completion(prompt, description);

    return mistralResponse[0].response.response;
};

const generateRobotImage = async (keyWords: string) => {
    const prompt = `Impressing robot in post apocalyptic world, realistic, destroyed city in the background, ${keyWords}`;

    const openAiService = new OpenAIService();

    return await openAiService.imageGeneration({ prompt });
}

const downloadImage = async (url: string) => {
    let counter = 1;
    let filePath = path.join(__dirname, 'robotImages', `robot${counter}.png`);

    while (fs.existsSync(filePath)) {
        counter++;
        filePath = path.join(__dirname, 'robotImages', `robot${counter}.png`);
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    fs.writeFileSync(filePath, buffer);
    console.log(`Image saved to ${filePath}`);
};

const fetchRobotDescription = async (): Promise<string> => {
    const apiKey = process.env.AI_DEVS_API_KEY;
    if (!apiKey) {
        throw new Error('AI_DEVS_API_KEY is not defined');
    }

    const url = `https://centrala.ag3nts.org/data/${apiKey}/robotid.json`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch robot description: ${response.statusText}`);
    }

    const data = await response.json();

    return data.description;
};

export const robot = async () => {
    try {
        const robotDescription = await fetchRobotDescription();
        const robotKeyWords = await getDescriptionKeyWords(robotDescription);
        const robotImageUrl = await generateRobotImage(robotKeyWords)
            .then(response => response.data[0].url);

        if (!robotImageUrl) {
            throw new Error('Failed to generate image');
        }

        await downloadImage(robotImageUrl);

        const { message } = await verifyResults(robotImageUrl, 'robotid');

        return message;
    } catch (error) {
        console.error('Error in robot function:', error);

        throw error;
    }
};

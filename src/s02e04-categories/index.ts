import fs from 'fs';
import path from 'path';

import { prepareImagesForLLM } from '../utils/prepareImagesForLLM';
import { OpenAIService } from '../modules/OpenAIService';
import { ChatCompletion } from 'openai/resources/chat/completions';
import { transcriptAudioFiles } from '../utils/transcriptAudioFiles';
import { verifyResults } from '../utils/verifyResults';

import type { ImageForLLM } from '../utils/prepareImagesForLLM';

interface FileContent {
    fileName: string;
    text: string;
}

const getTextFilesContent = (directory: string): FileContent[] => {
    const files = fs.readdirSync(directory);
    const textFilesContent: FileContent[] = [];

    files.forEach(file => {
        const filePath = path.join(directory, file);

        if (file.endsWith('.txt')) {
            const text = fs.readFileSync(filePath, 'utf-8');

            textFilesContent.push({ fileName: file, text });
        }
    });

    return textFilesContent;
};

const convertPngToTxt = async (openAiService: OpenAIService): Promise<FileContent[]> => {
    const preparedImages: ImageForLLM[] = await prepareImagesForLLM('src/s02e04-categories/filesFromFactory');
    const convertedImages: FileContent[] = [];

    const prompt = `Please extract all readable text from the PNG file provided. 
        Ensure accuracy by recognizing the layout and structure of the document. 
        Ignore images, formatting, or non-text elements, focusing only on plain text content. 
        Output the extracted text in a simple, unformatted plain text format.
    `;

    for (const image of preparedImages) {
        const { type, image_url } = image;

        const convertedImage = await openAiService.completion({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: prompt
                },
                {
                    role: 'user',
                    // @ts-ignore
                    content: [{ type, image_url }],
                },
            ],
        }) as ChatCompletion;

        if (!convertedImage.choices[0].message.content) {
            throw new Error('No content in converted image');
        }

        convertedImages.push({
            fileName: image.fileName,
            text: convertedImage.choices[0].message.content,
        });
    }

    return convertedImages;
}

const filterFiles = async(files: FileContent[], openAiService: OpenAIService) => {
    const prompt = `You are a helpful assistant and an expert in categorizing text content.

        <rules>
            - Analyze the provided text content carefully.
            - Determine if the text includes information about:
                1. Captured people or traces of their presence - categorize as 'people'
                2. Hardware information, including the repair of any tools, sensors, or components - categorize as 'hardware'
            - If the text matches a category, return a JSON object with:
                - 'result': 'true' and 'category' indicating the category name.
            - Ignore notes created by people.
            - Ignore notes about software updates or changes.
            - If there is no match, return a JSON object with 'result': 'false'.
            - Provide no other output or additional information.
        </rules>
        
        <examples>
            User: Wykryto jednostkę organiczną w pobliżu północnego skrzydła fabryki. Osobnik przedstawił się jako Aleksander Ragowski. Przeprowadzono skan biometryczny, zgodność z bazą danych potwierdzona. Jednostka przekazana do działu kontroli. Patrol kontynuowany.
            AI: { 'result': 'true', 'category': 'people' }
        
            User: Naprawiono uszkodzenie w module zasilania. Usterka została usunięta i sprzęt działa poprawnie.
            AI: { 'result': 'true', 'category': 'hardware' }
            
            User: Wprowadzono aktualizację oprogramowania systemu. Zmiany obejmują nowe protokoły komunikacyjne oraz zwiększoną wydajność.
            AI: { 'result': 'false' }
        </examples>
    `;
    
    const filteredFiles: { people: string[], hardware: string[] } = {
        people: [],
        hardware: [],
    };

    for (const file of files) {
        const filterResultResponse = await openAiService.completion({
            messages: [
                {
                    role: 'user',
                    content: file.text,
                },
                {
                    role: 'system',
                    content: prompt,
                },
            ],
        }) as ChatCompletion;

        const filterResult = JSON.parse(filterResultResponse.choices[0].message.content || '');

        if (filterResult.result === 'true') {
            filterResult.category === 'people'
                ? filteredFiles.people.push(file.fileName)
                : filteredFiles.hardware.push(file.fileName);
        }
    }

    filteredFiles.people.sort();
    filteredFiles.hardware.sort();

    return filteredFiles;
};

export const categories = async () => {
    const openAiService = new OpenAIService();

    const imagesDescription = await convertPngToTxt(openAiService);
    const transcribedRecords = await transcriptAudioFiles('src/s02e04-categories/filesFromFactory', openAiService);
    const textFiles = getTextFilesContent('src/s02e04-categories/filesFromFactory');

    const filteredFiles = await filterFiles([...imagesDescription, ...transcribedRecords, ...textFiles], openAiService);
    const { message } = await verifyResults(filteredFiles, 'kategorie');

    return message;
}

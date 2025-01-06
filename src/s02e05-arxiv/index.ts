import * as fs from 'fs';
import * as path from 'path';

import { OpenAIService } from '../modules/OpenAIService';
import { Readable } from 'stream';
import { verifyResults } from '../utils/verifyResults';

import type { ChatCompletion } from 'openai/resources/chat/completions';

const DOCUMENT_URL = 'https://centrala.ag3nts.org/dane/arxiv-draft.html';
const QUESTION_URL = `https://centrala.ag3nts.org/data/${process.env.AI_DEVS_API_KEY}/arxiv.txt`;

type Question = {
    id: string;
    question: string;
}

const fetchDocument = async (url: string): Promise<string> => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch document: ${response.statusText}`);
    }

    return response.text();
};

const getBaseUrl = (url: string): string => {
    const urlObj = new URL(url);

    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname.substring(0, urlObj.pathname.lastIndexOf('/') + 1)}`;
};

const fetchQuestions = async (): Promise<Question[]> => {
    const response = await fetch(QUESTION_URL);
    if (!response.ok) {
        throw new Error(`Failed to fetch questions: ${response.statusText}`);
    }

    const questions = await response.text();

    return questions
        .split('\n')
        .map((line) => {
            const [id, question] = line.split('=');
            return { id, question };
        });
};

const generateAnswers = async (
    content: string,
    questions: Question[],
    openAiService: OpenAIService,
): Promise<Record<string, string>> => {
    const prompt = `You are a helpful assistant. Answer the question based on the provided documents, audio transcriptions, and image descriptions.
    
        <rules>
            - The response should be in Polish.
            - Keep the answer as concrete short as possible.
        </rules>
        
        <examples>
            USER: Jaki kolor ma truskawka?
            AI: Czerwony.
            
            USER: Gdzie znajduje się Wawel?
            AI: W Krakowie.
        </examples>
    `;

    const answers: Record<string, string> = {};

    for (const question of questions) {
        if (!question.id) {
            continue;
        }

        const response = await openAiService.completion({
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content },
                { role: 'user', content: `${question.question}` },
            ],
        }) as ChatCompletion;

        answers[question.id] = response.choices[0].message.content?.trim() || '';
    }

    return answers;
};

const extractImagesDescriptionFromDocument = async (html: string, openAiService: OpenAIService): Promise<string[]> => {
    const GET_IMAGE_DESCRIPTION_PROMPT = `You are an intelligent assistant. Describe the content of this image briefly.
        <rules>
            - Focus only on the most important details.
            - Ignore any irrelevant information.
            - Provide descriptions in Polish.
            - Keep the descriptions concise.
            - If the image contains a view, aim to identify where it was taken by analyzing:
              - Architectural styles.
              - Uncommon landmarks or details visible in the background.
              - Text, language, or any inscriptions visible (e.g., on signs, posters, or buildings).
              - Landscape features unique to specific locations (e.g., riverbanks, hills, bridges).
            - Always explicitly state the name of the city if the image contains a recognizable view or landmark, like pigeons in Kraków.
        </rules>
    `;

    const CONCAT_DESCRIPTION_WITH_CAPTION_PROMPT = `You are an intelligent assistant. Based on the image description and metadata, provide a short, complete description of the image.`;

    const imgTagContentRegex = /<figure[^>]*>(.*?)<\/figure>/gs;
    const figcaptionTagRgx = /<figcaption[^>]*>(.*?)<\/figcaption>/gs;
    const imgTagRgx = /<img[^>]*src='([^']*)'[^>]*>/gs;

    const contentBetweenImgTags = [...html.matchAll(imgTagContentRegex)].map(match => match[1]);

    const baseUrl = getBaseUrl(DOCUMENT_URL);

    const validImageUrls = contentBetweenImgTags.flatMap(content => {
        const matches = [...content.matchAll(imgTagRgx)];
        return matches.map(match => `${baseUrl}${match[1]}`);
    });

    return await Promise.all(validImageUrls.map(async imageUrl => {
        const content = contentBetweenImgTags.find(content => content.includes(imageUrl)) || '';
        const imageCaption = figcaptionTagRgx.exec(content)?.[1] || '';

        const imageDescriptionResponse = await openAiService.completion({
            model: 'gpt-4o',
            messages: [
                { role: 'system', content: GET_IMAGE_DESCRIPTION_PROMPT },
                { role: 'user', content: [{ type: 'image_url', image_url: { url: imageUrl } }] },
            ],
        }) as ChatCompletion;

        const aiImageDescription = imageDescriptionResponse.choices[0].message.content;

        const concatenatedDescriptionResponse = await openAiService.completion({
            messages: [
                { role: 'system', content: CONCAT_DESCRIPTION_WITH_CAPTION_PROMPT },
                { role: 'user', content: `${aiImageDescription} ${imageCaption}` },
            ],
        }) as ChatCompletion;

        return concatenatedDescriptionResponse.choices[0].message.content ?? '';
    }));
};

function readableStreamToNodeReadable(stream: ReadableStream<Uint8Array>): Readable {
    return Readable.from(stream as any);
}

async function downloadAudioFile(url: string, outputPath: string): Promise<void> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to download audio file: ${response.statusText}`);
    }

    const nodeReadable = readableStreamToNodeReadable(response.body!);
    const fileStream = fs.createWriteStream(outputPath);

    return new Promise((resolve, reject) => {
        nodeReadable.pipe(fileStream);
        nodeReadable.on('error', reject);
        fileStream.on('finish', resolve);
    });
}

const extractAndTranscribeAudioFromDocument = async (html: string, openAiService: OpenAIService): Promise<string> => {
    const audioTagRgx = /<source[^>]*src='([^']*)'[^>]*>/gs;
    const baseUrl = getBaseUrl(DOCUMENT_URL);
    const audioSrc = `${baseUrl}${audioTagRgx.exec(html)?.[1] || ''}`;

    const outputDir = path.join(__dirname, 'downloads');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'audio.mp3');

    try {
        await downloadAudioFile(audioSrc, outputPath);
    } catch (error) {
        console.error('Error downloading audio file:', error);
    }

    const transcribedSTT = await openAiService.sttTranscription({ pathToFile: outputPath });

    return transcribedSTT.text;
};

const replaceTagsWithContent = (html: string, transcribedAudio: string, imagesDescription: string[]): string => {
    const updatedHtml = html.replace(/<audio[^>]*>.*?<\/audio>/gs, `<audio>${transcribedAudio}</audio>`);

    const figureTags = updatedHtml.match(/<figure[^>]*>.*?<\/figure>/gs) || [];
    let updatedHtmlWithImages = updatedHtml;

    figureTags.forEach((figureTag, index) => {
        if (imagesDescription[index]) {
            updatedHtmlWithImages = updatedHtmlWithImages.replace(figureTag, `<figure>${imagesDescription[index]}</figure>`);
        }
    });

    return updatedHtmlWithImages;
};

export const arxiv = async () => {
    const openAiService = new OpenAIService();
    const questions = await fetchQuestions();

    const documentHtml = await fetchDocument(DOCUMENT_URL);

    const imagesDescription = await extractImagesDescriptionFromDocument(documentHtml, openAiService);
    const transcribedAudio = await extractAndTranscribeAudioFromDocument(documentHtml, openAiService);

    const updatedDocumentHtml = replaceTagsWithContent(documentHtml, transcribedAudio, imagesDescription);

    const answers = await generateAnswers(
        updatedDocumentHtml,
        questions,
        openAiService,
    );

    const { message } = await verifyResults(answers, 'arxiv');

    return message;
};

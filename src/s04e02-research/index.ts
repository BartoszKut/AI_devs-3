import * as fs from 'fs';
import * as readline from 'readline';
import path from 'path';

import { OpenAIService } from '../modules/OpenAIService';
import { verifyResults } from '../utils/verifyResults';

import type { ChatCompletion } from 'openai/resources/chat/completions';

const processFile = async (filePath: string, role: string) => {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    const lines: { role: string; content: string }[] = [];
    for await (const line of rl) {
        lines.push({ role, content: line });
    }
    return lines;
};

const createJSONLData = (lines: { role: string; content: string }[], label: string) => {
    return lines.map((line) => ({
        messages: [
            { role: 'system', content: 'Check if it is CORRECT or NOT' },
            line,
            { role: 'assistant', content: label },
        ],
    }));
};

const generateJSONL = async () => {
    const correctLines = await processFile(
        path.join(__dirname, 'researches', 'correct.txt'),
        'user',
    );
    const incorrectLines = await processFile(
        path.join(__dirname, 'researches', 'incorrect.txt'),
        'user',
    );

    const jsonlData = [
        ...createJSONLData(correctLines, 'correct'),
        ...createJSONLData(incorrectLines, 'incorrect'),
    ];

    const jsonlContent = jsonlData.map((obj) => JSON.stringify(obj)).join('\n');
    fs.writeFileSync(path.join(__dirname, 'finetuning_data.jsonl'), jsonlContent);
};

const readVerifyFile = async () => {
    const fileStream = fs.createReadStream(path.join(__dirname, 'researches', 'verify.txt'));
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
    });

    const lines: string[] = [];
    for await (const line of rl) {
        lines.push(line);
    }
    return lines;
};

const extractIdAndValue = (input: string) => {
    const match = input.match(/^(\d+)=([-?\d,]+)$/);

    if (match) {
        const id = match[1];
        const value = match[2];
        return { id, value };
    }

    throw new Error('Input string is not in the expected format');
};

export const research = async () => {
    const openAiService = new OpenAIService();

    try {
        await generateJSONL();
        console.log('JSONL file has been generated successfully.');
    } catch (error) {
        console.error('Error generating JSONL file:', error);
    }

    return;

    const linesToVerify = await readVerifyFile();

    const results = await Promise.all(
        linesToVerify.map(async (line) => {
            const { id, value } = extractIdAndValue(line);

            const response = (await openAiService.completion({
                model: 'ft:gpt-4o-mini-2024-07-18:personal:ai-devs3-research-v2:ArmeLlcw',
                messages: [
                    {
                        role: 'system',
                        content: 'Check if it is CORRECT or NOT. Return only correct or incorrect.',
                    },
                    { role: 'user', content: value },
                ],
            })) as ChatCompletion;

            return { id, response: response.choices[0].message.content || '' };
        }),
    );

    const verifiedIds = results
        .filter((result) => result.response === 'correct')
        .map((result) => result.id);

    const { message } = await verifyResults(verifiedIds, 'research');

    return message;
};

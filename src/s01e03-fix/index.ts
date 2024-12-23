import * as fs from 'fs/promises';
import * as path from 'path';
import { OpenAIService } from '../modules/OpenAIService';
import { verifyResults } from '../utils/verifyResults';

import type { ChatCompletion } from 'openai/resources/chat/completions';

type TestData = {
    question: string;
    answer: number;
    test?: {
        q: string;
        a: string;
    };
};

type CalibrationFile = {
    apikey: string;
    description: string;
    copyright: string;
    'test-data': TestData[];
};

const PROMPT = `You are the helpful assistant who tries to answer the questions

<rules>
    - answer should be as short as possible
    - answer should come in JSON format: "q": question, "a": answer
</rules>

<examples>
    USER: What is the capital of Poland? What is the currency of Poland?
    AI: [
        {"q": "What is the capital of Poland?", "a": "Warsaw"},
        {"q": "What is the currency of Poland?", "a": "Zloty"}
    ]
</examples>
`;

const filePath = path.join(__dirname, '/calibration-file.txt');

const readCalibrationFile = async (): Promise<CalibrationFile> => {
    const fileContent = await fs.readFile(filePath, 'utf-8');

    return JSON.parse(fileContent);
};

const processTestData = (data: CalibrationFile): string[] => {
    const testQuestions: string[] = [];

    data['test-data'].forEach(item => {
        const [num1, num2] = item.question.split(' + ').map(Number);
        const correctAnswer = num1 + num2;

        if (item.answer !== correctAnswer) {
            item.answer = correctAnswer;
        }

        if (item.test?.q) {
            testQuestions.push(item.test.q);
        }
    });

    return testQuestions;
};

const updateCalibrationFile = (data: CalibrationFile, answers: { q: string, a: string }[]) => {
    const answerMap = new Map(answers.map(answer => [answer.q, answer.a]));

    data.apikey = process.env.AI_DEVS_API_KEY || '';

    data['test-data'].forEach(item => {
        if (item.test?.q) {
            const answer = answerMap.get(item.test.q);
            if (answer) {
                item.test.a = answer;
            }
        }
    });
};

export const fix = async () => {
    const openAiService = new OpenAIService();

    const calibrationFile = await readCalibrationFile();

    const questions = processTestData(calibrationFile);

    const generatedAiResponse = await openAiService.completion({
        messages: [
            {
                role: 'user',
                content: questions.join(' '),
            },
            {
                role: 'system',
                content: PROMPT,
            },
        ],
    }) as ChatCompletion;

    updateCalibrationFile(
        calibrationFile,
        JSON.parse(generatedAiResponse.choices[0].message.content || ''),
    );

    const { message } = await verifyResults(calibrationFile, 'JSON');

    return message;
};

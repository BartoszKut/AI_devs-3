import fs from 'fs';

import { OpenAIService } from '../modules/OpenAIService';
import { generateKeyWords } from './utils/generateKeyWords';
import { getFilesContent } from '../utils/getFilesContent';
import { verifyResults } from '../utils/verifyResults';

import type  { ChatCompletion } from 'openai/resources/chat/completions';

const findPersonFromReport = async(report: string, openAiService: OpenAIService): Promise<string> => {
    const prompt = `
        You are an expert in extracting information from text. Your task is to analyze the provided text and extract the name of the person who wrote the report.
        
        <rules>
            - Focus only on identifying the names of the people mentioned in the report.
            - The names should be in the format: First Name Last Name.
            - List all names separated by commas.
            - Ignore any other information or context in the text.
            - If no names are explicitly mentioned, return 'Names not found'.
            - Ensure the extracted names are accurate and correctly spelled.
        </rules>
        
        <example>
            User: 'Report by John Doe on the recent findings in the sector.'
            AI: 'John Doe'
            
            User: 'This report was prepared by Jane Smith regarding the latest updates. John Doe reviewed it.'
            AI: 'Jane Smith, John Doe'
            
            User: 'No author mentioned in this report.'
            AI: 'Name not found'
        </example>
    `;

    const personResponse = await openAiService.completion({
        messages: [
            {
                role: 'system',
                content: prompt
            },
            {
                role: 'user',
                content: report,
            },
        ],
    }) as ChatCompletion;

    return personResponse.choices[0].message.content || '';
}

const connectTextWithPerson = async(
    directory: string,
    openAiService: OpenAIService
): Promise<{fileName: string, persons: string[]}[]> => {
    const reportsContent = getFilesContent(directory);

    const reportsPersonList: { fileName: string, persons: string[] }[] = [];

    for (const report of reportsContent) {
        if (report.text.includes('entry deleted')) {
            continue;
        }

        const persons = await findPersonFromReport(report.text, openAiService);

        reportsPersonList.push({ fileName: report.fileName, persons: [persons] });
    }

    return reportsPersonList;
}

const generateKeywordsWithContext = async (
    reportsPersonDump: { fileName: string; persons: string[] }[],
    factsPersonDump: { fileName: string; persons: string[] }[],
    openAiService: OpenAIService
): Promise<Record<string, string>> => {
    const filesWithKeywords: Record<string, string> = {};

    for (const report of reportsPersonDump) {
        const reportPerson = report.persons.filter(person => person !== 'Names not found')[0];

        const matchingFacts = reportPerson
            ? factsPersonDump.filter(fact => {
                return fact.persons.some(person => {
                    console.log(person);

                    return person.includes(reportPerson);
                });
            })
            : [];

        const reportContent = fs.readFileSync(`assets/filesFromFactory/${report.fileName}`, 'utf8');

        const context = `
            Report File: ${report.fileName}
            Report Text: ${reportContent}
            Matching Facts: ${matchingFacts.length > 0 ? matchingFacts.map(fact => {
                const factContent = fs.readFileSync(`assets/filesFromFactory/facts/${fact.fileName}`, 'utf8');
                return `Fact File: ${fact.fileName}\nPersons: ${fact.persons.join(', ')}\nText: ${factContent}`;
            }).join('\n\n') : 'No matching facts'}
        `;

        filesWithKeywords[report.fileName] = await generateKeyWords(context, openAiService);
    }

    return filesWithKeywords;
};

export const documents = async () => {
    const openAiService = new OpenAIService();

    const factsPersonList = await connectTextWithPerson('assets/filesFromFactory/facts', openAiService);
    const reportsPersonList = await connectTextWithPerson('assets/filesFromFactory', openAiService);

    const reportsKeywords = await generateKeywordsWithContext(reportsPersonList, factsPersonList, openAiService);

    const { message } = await verifyResults(reportsKeywords, 'dokumenty');

    return message;
}

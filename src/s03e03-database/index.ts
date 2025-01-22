import { DbConnectService } from '../modules/DbConnectService';
import { OpenAIService } from '../modules/OpenAIService';
import { verifyResults } from '../utils/verifyResults';
import { sanitizeQuery } from './utils/sanitizeQuery';

import type { ChatCompletion } from 'openai/resources/chat/completions';

const fetchAvailableTables = async (
    dbService: DbConnectService,
    openAiService: OpenAIService,
): Promise<string[]> => {
    const prompt = `You are a helpful assistance who interprets the response from the database and provides a response in array.
    
    <rules>
        - Interpret the response from the database.
        - Provide the response in array of strings.
    </rules>>
    
    <examples>
        USER: {
            reply: [
                { Tables_in_fruit_salad: 'fruits' },
                { Tables_in_fruit_salad: 'ingredients' },
                { Tables_in_fruit_salad: 'recipes' },
                { Tables_in_fruit_salad: 'nutrition_info' },
            ],
            error: null
            }
        AI: [ 'fruits', 'ingredients', 'recipes', 'nutrition_info' ]
        </examples>
    `;

    const dbResponse = await dbService.showTables();
    const dbResponseString = JSON.stringify(dbResponse);

    const aiResponse = (await openAiService.completion({
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: dbResponseString },
        ],
    })) as ChatCompletion;

    return JSON.parse(aiResponse.choices[0].message.content || '');
};

const fetchTableStructures = async (
    tables: string[],
    dbService: DbConnectService,
): Promise<{ tableName: string; createTable: string }[]> => {
    const tablesStructures: { tableName: string; createTable: string }[] = [];

    for (const table of tables) {
        const dbResponse = await dbService.showCreateTable(table);

        tablesStructures.push({
            tableName: table,
            createTable: dbResponse.reply[0]['Create Table'],
        });
    }

    return tablesStructures;
};

const generateAndExecuteQueryForQuestion = async (
    tablesStructures: { tableName: string; createTable: string }[],
    dbService: DbConnectService,
    openAiService: OpenAIService,
) => {
    const question = `Które aktywne datacenter (DC_ID) są zarządzane przez pracowników, którzy są na urlopie (is_active=0)?`;

    const prompt = `You are a helpful assistance who prepare the SQL query to answer the question.

        <rules>
            - Query should be prepared based on the provided tables structures.
            - Return ONLY the SQL query.
            - Prepare the SQL query to answer the question.
            - Question is provided in Polish.
            - Question is: ${question}
        </rules> 
    `;

    const dbQueryResponse = (await openAiService.completion({
        messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: JSON.stringify(tablesStructures) },
        ],
    })) as ChatCompletion;

    const dbQuery = sanitizeQuery(dbQueryResponse.choices[0].message.content || '');

    const dbResponseObject = await dbService.select(dbQuery);

    const result = (await openAiService.completion({
        messages: [
            {
                role: 'system',
                content:
                    'You are a helpful assistance who interprets the response from the database and provides a response in array. Provide ONLY ids!.',
            },
            { role: 'user', content: JSON.stringify(dbResponseObject) },
        ],
    })) as ChatCompletion;

    return JSON.parse(result.choices[0].message.content || '');
};

export const database = async (): Promise<string> => {
    const openAiService = new OpenAIService();
    const dbService = new DbConnectService();

    const availableTables = await fetchAvailableTables(dbService, openAiService);
    const tablesStructures = await fetchTableStructures(availableTables, dbService);
    const results = await generateAndExecuteQueryForQuestion(
        tablesStructures,
        dbService,
        openAiService,
    );

    const { message } = await verifyResults(results, 'database');

    return message;
};

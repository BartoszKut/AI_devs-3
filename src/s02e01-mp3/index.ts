import { OpenAIService } from '../modules/OpenAIService';
import { verifyResults } from '../utils/verifyResults';
import { transcriptAudioFiles } from '../utils/transcriptAudioFiles';

import type { ChatCompletion } from 'openai/resources/chat/completions';

const getInstituteName = async (transcriptData: { text: string }[], openAiService: OpenAIService): Promise<string | null> => {
    const PROMPT = `
        You are a helpful assistant who helps figure out the institute's name from a given text.

        <rules>
            - The provided text is in Polish, so the institute name should be in Polish.
            - The provided text is a transcript of interrogations of witnesses.
            - Focus on extracting the most important information which is the institute where the professor currently teaches.
            - The answer should be a JSON object with the following structure: { 'institute': 'institute name' }
        </rules>
    `;

    const result = await openAiService.completion({
        messages: [
            { role: 'system', content: PROMPT },
            { role: 'user', content: transcriptData.map(data => data.text).join(' ') },
        ],
    }) as ChatCompletion;

    return result.choices[0].message.content;
};

const getStreetNameWhereProfessorTeaches = async (context: string, openAiService: OpenAIService): Promise<string | null> => {
    const promptToGetUniversity = `
        You are an intelligent and highly accurate assistant. Your sole task is to identify and provide the **exact name of the university** associated with a given institute.

        <context>
            - The university is located in **Kraków, Poland**.
            - There is a specific, prominent university in Kraków that the institute belongs to or is associated with.
            - The university in question is widely known and recognized.
        </context>

        <rules>
            - Analyze the context and determine the **one correct university** in Kraków, Poland.
            - Your response must include **only** the **full name of the university** (no extra text, comments, or explanations).
            - Ensure the name is complete, accurate, and consistent each time.
        </rules>

        <notes>
            - Double-check your internal knowledge to confirm the accuracy of your response.
            - Always provide the same correct university name for any repeat queries with the same context and instructions.
        </notes>
    `;

    const promptToGetStreetName = `
        You are an intelligent and highly accurate assistant. Your sole task is to identify and provide the **exact name of the street** where the specific provided institute is located.

        <context>
            - The institute is located in **Kraków, Poland**.
            - The provided text will include the name of the institute.
            - Use your internal knowledge and any context clues to determine the street name.
        </context>

        <rules>
            - Analyze the provided university and its institute name and determine the **exact street name** where it is located.
            - Your response must include **only** the **street name** (no extra text, comments, or explanations).
            - Ensure the street name is complete, accurate, and consistent each time.
        </rules>

        <notes>
            - Double-check your internal knowledge to confirm the accuracy of your response.
            - Always provide the same correct street name for any repeat queries with the same context and instructions.
        </notes>
    `;

    const universityNameResponse = await openAiService.completion({
        messages: [
            { role: 'system', content: promptToGetUniversity },
            { role: 'user', content: context },
        ],
    }) as ChatCompletion;

    const universityName = universityNameResponse.choices[0].message.content;

    const streetNameResponse = await openAiService.completion({
        messages: [
            { role: 'system', content: promptToGetStreetName },
            { role: 'user', content: `University - ${universityName}, Institute - ${context}` },
        ],
    }) as ChatCompletion;

    return streetNameResponse.choices[0].message.content;
};

export const mp3 = async () => {
    const openAiService = new OpenAIService();

    try {
        const transcribedRecords = await transcriptAudioFiles('src/s02e01-mp3/auditionRecords', openAiService);
        const instituteName = await getInstituteName(transcribedRecords, openAiService);

        if (!instituteName) {
            return 'No institute name found in the provided transcripts.';
        }

        const streetName = await getStreetNameWhereProfessorTeaches(instituteName, openAiService);
        const { message } = await verifyResults(streetName, 'mp3');

        return message;
    } catch (error) {
        console.error('Error in mp3 function:', error);
        throw error;
    }
};

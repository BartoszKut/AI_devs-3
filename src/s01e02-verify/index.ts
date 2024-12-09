import { OpenAIService } from '../modules/OpenAIService';

import type { ChatCompletion } from 'openai/resources/chat/completions';

type VerifyEndpointResponse = {
    text: string,
    msgID: string,
};

const PROMPT = `You are the helpful assistant who tries to help with identity verification

<rules>
    - answer always in english
    - answer always with only one world 
</rules>

<context>
    - the capital of Poland is Kraków
    - the famous number from the book 'The Hitchhiker's Guide to the Galaxy' is 69
    - the current year is 1999
</context>

<examples>
    USER: What is the color of the grass?
    AI: Green
    
    USER: What is the current year?
    AI: 1999
</examples>
`;

const fetchFromApi = (url: string, body: object) => (
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(response => response.json())
);

const getVerifyQuestionFromRobot = async (): Promise<VerifyEndpointResponse> => (
    await fetchFromApi('https://xyz.ag3nts.org/verify', {
        'msgID': 0,
        'text': 'READY',
    })
);

const verifyIdentity = async (answer: string, msgID: string): Promise<VerifyEndpointResponse> => (
    fetchFromApi('https://xyz.ag3nts.org/verify', {
        'msgID': msgID,
        'text': answer,
    })
);

export const verify = async () => {
    const openAiService = new OpenAIService();

    const { msgID, text: question } = await getVerifyQuestionFromRobot();

    const generatedAiResponse = await openAiService.completion({
        messages: [
            {
                role: 'user',
                content: question,
            },
            {
                role: 'system',
                content: PROMPT,
            },
        ],
        model: 'gpt-4o-mini'
    }) as ChatCompletion;

    const answer = generatedAiResponse.choices[0].message.content || '';

    const { text: flag } = await verifyIdentity(answer, msgID);

    return flag;
}

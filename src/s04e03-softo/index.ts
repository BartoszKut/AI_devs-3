import { OpenAIService } from '../modules/OpenAIService';
import { ChatCompletion } from 'openai/resources/chat/completions';
import { verifyResults } from '../utils/verifyResults';

const BASE_PAGE = 'https://softo.ag3nts.org';

const fetchQuestions = async () => {
    const url = `https://centrala.ag3nts.org/data/${process.env.AI_DEVS_API_KEY}/softo.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching questions:', error);
    }
};

const fetchPageContent = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        let html = await response.text();

        html = html.replace(/<head[\s\S]*?>[\s\S]*?<\/head>/gi, '');
        html = html.replace(/\sclass="[^"]*"/gi, '');

        return html;
    } catch (error) {
        console.error('Error fetching page content:', error);

        throw error;
    }
};

const getAnswerAvailability = async(
    question: string,
    pageContent: string,
    openAiService: OpenAIService
): Promise<{
    isAnswerAvailable: boolean,
    answer: string | null,
    href: string | null,
}> => {
    const prompt = `You are a helpful assistant who answers questions about Softo.
        Question: ${question}
        
        <rules>
            - If an answer is available in the content of the page, provide the answer.
            - If an answer is not available in the content of the page, provide the value of the href attribute that could contain the answer.
            - If href attribute is wrapped in element with hidden class, ignore it.
            - Answer should be as short as possible.
            - Analyze all context to ensure that the answer or href value is relevant to the question.
            - The answer should ALWAYS be an object with the following structure:
                {
                    "isAnswerAvailable": true,
                    "answer": "The answer to the question",
                    "href": null
                }
                or
                {
                    "isAnswerAvailable": false,
                    "answer": null,
                    "href": "/path/to/the/answer"
                }
        </rules>
        
        <examples>
            - Question: What is Softo?
                - Answer: {
                    "isAnswerAvailable": true,
                    "answer": "Platform that helps you to create AI assistants.",
                    "href": null
                }
            - Question: How can I create an AI assistant with Softo?
                - Answer: {
                    "isAnswerAvailable": false,
                    "answer": null,
                    "href": "/docs/getting-started"
                }
            - Question: What did we do on our last project?
                - Answer: {
                    "isAnswerAvailable": false,
                    "answer": null,
                    "href": "/projects/last-project"
                }
        </examples>
    `;

    const response = await openAiService.completion({
        messages: [
            {
                role: 'system',
                content: prompt
            },
            {
                role: 'user',
                content: pageContent
            }
        ],
    }) as ChatCompletion;

    console.log(response.choices[0].message.content)

    return JSON.parse(response.choices[0].message.content || '');
};

const fetchAnswerRecursively = async (
    question: string,
    pageContent: string,
    openAiService: OpenAIService,
    depth: number = 0,
    maxDepth: number = 4
): Promise<string> => {
    if (depth > maxDepth) {
        return '';
    }

    const { isAnswerAvailable, answer, href } = await getAnswerAvailability(question, pageContent, openAiService);

    if (isAnswerAvailable) {
        return answer ?? '';
    }

    if (href) {
        const url = href.includes(BASE_PAGE) ? href : `${BASE_PAGE}${href}`;

        const newPageContent = await fetchPageContent(url);
        return await fetchAnswerRecursively(question, newPageContent, openAiService, depth + 1, maxDepth);
    }

    return '';
};

export const softo = async () => {
    const openAiService = new OpenAIService();

    const questions = await fetchQuestions();
    const pageContent = await fetchPageContent(BASE_PAGE);

    const answers: { [key: string]: string } = {};

    for (const key in questions) {
        if (questions.hasOwnProperty(key)) {
            answers[key] = await fetchAnswerRecursively(questions[key], pageContent, openAiService);
        }
    }

    const { message } = await verifyResults(answers, 'softo');

    return message;
};

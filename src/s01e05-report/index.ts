import { CloudflareMistralService } from '../modules/CloudflareMistralService';
import { verifyResults } from '../utils/verifyResults';

const URL_TO_FILE = `https://centrala.ag3nts.org/data/${process.env.AI_DEVS_API_KEY}/cenzura.txt`;

const PROMPT = `You are the helpful assistant who change personal data to the word CENZURA

    <rules>
        - replace personal data (name + surname, street + number, city, age of a person) with the word CENZURA
        - take care of every dot, comma, space, etc. You must not rephrase the text
    </rules>
    
    <examples>
        USER: Tożsamość osoby podejrzanej: Piotr Lewandowski. Zamieszkały w Łodzi przy ul. Wspólnej 22. Ma 34 lata.
        AI: Tożsamość osoby podejrzanej: Cenzura. Zamieszkały w Cenzura przy ul. Cenzura. Ma Cenzura lata.
        
        USER: Dane osoby podejrzanej: Adam Małysz. Zamieszkały w Warszawie przy ul. Nijakiej 21. Ma 29 lat.
        AI: Tożsamość osoby podejrzanej: Cenzura. Zamieszkały w Cenzura przy ul. Cenzura. Ma Cenzura lat.
    </examples>
`;

async function readFileFromUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error fetching file from URL: ${response.statusText}`);
        }

        return await response.text();
    } catch (error) {
        console.error(`Error reading file from URL: ${error}`);

        throw error;
    }
}

export const censorship = async () => {
    const content = await readFileFromUrl(URL_TO_FILE);

    const mistralResponse = await CloudflareMistralService.completion(PROMPT, content);

    const censoredData = mistralResponse[0].response.response;

    const { message } = await verifyResults(censoredData, 'CENZURA');

    return message;
}

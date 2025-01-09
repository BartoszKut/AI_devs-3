import { OpenAIService } from '../../modules/OpenAIService';

import type { ChatCompletion } from 'openai/resources/chat/completions';

export const generateKeyWords = async (text: string, openAiService: OpenAIService): Promise<string> => {
    const prompt = `You are an expert in extracting keywords from text. Your task is to analyze provided text and generate a concise, high-quality list of keywords.     
        <rules>
            - Generated keywords must be in **correct Polish language**.
            - **Only use words in the nominative case (mianownik)**.
            - Keywords should **exclude stop words**, such as "i", "że", "w", "na", etc.
            - **Avoid duplicates**; every keyword should be unique.
            - Always generate keywords with **appropriate word form and spelling**.
            - Keywords should be **short and simple**, consisting of 1-3 words (e.g., "raport sprzedaży", "system zarządzania", "programista JavaScript").
            - Keywords must be **relevant to the meaning of the input text**, and must include **specific entities such as names of technologies, languages, or methodologies** mentioned in the text.
            - Separate keywords using **commas** (e.g., "energia słoneczna, technologia zielona, innowacja").
            - Only output **keywords**, avoid adding explanations, comments, or formatting.
            - Keywords will be used as **metadata** for simplifying searches in reports and databases.
        </rules>
             
        <examples to clarify expectations>
            User: "Report File: 2012-08-11_report-12-sektor_D11.txt. Report Text: Raport opisuje wyniki badań nad zastosowaniem technologii zielonych w miastach inteligentnych. Matching Facts: Jan słynie z umiejętności programowania. Najlepiej czuje się w technologiach JavaScript, Python oraz AI."
            AI: "D11, technologie zielone, miasta inteligentne, raport badań, wyniki badań, Python, JavaScript, AI"
            
            User: "Report File: 2012-03-21_report-02-sektor_O3.txt. Report Text: Analiza efektywności energetycznej związanej z wykorzystaniem paneli fotowoltaicznych w domach jednorodzinnych."
            AI: "efektywność energetyczna, panele fotowoltaiczne, domy jednorodzinne"
        </examples to clarify expectations>
        
        Please ensure all responses strictly conform to the rules and examples above.
    `;

    const keywordsResponse = await openAiService.completion({
        model: 'gpt-4o',
        messages: [
            {
                role: 'system',
                content: prompt
            },
            {
                role: 'user',
                content: text,
            },
        ],
    }) as ChatCompletion;

    return keywordsResponse.choices[0].message.content || '';
};

import { verifyResults } from '../../utils/verifyResults';

import type { ChatCompletion } from 'openai/resources/chat/completions';
import type { OpenAIService } from '../../modules/OpenAIService';

export const extractImages = async (openAiService: OpenAIService, imagesResponse?: string): Promise<string[]> => {
    if (!imagesResponse) {
        // verifyResult in this case used as api call to get the text
        const { message } = await verifyResults('START', 'photos')

        imagesResponse = message;
    }

    const prompt: string = `
        You are a highly intelligent assistant specialized in analyzing text. Your task is to identify and extract all image URLs from the provided text. These URLs may be directly included or constructed using a base path combined with relative paths. Follow these rules:

        <rules>
            1. Extract all fully qualified (absolute) image URLs directly mentioned in the text.
            2. If a base path is provided, combine it with any relative paths mentioned to construct full image URLs.
            3. If no base path is provided, assume the default base path is https://centrala.ag3nts.org/dane/barbara/.
            4. Ignore malformed URLs or non-image paths (e.g., paths without valid image extensions like .jpg, .png, .gif, etc.).
            5. Return the results as an array containing all valid image URLs.
        </rules>

        <examples>
            User: "Pyk, pyk, pyk, pytk jako tako i fajrant! Dałem z siebie całe 30% - proszę: IMG_1443_FT12.PN"
            AI: ["https://centrala.ag3nts.org/dane/barbara/IMG_1443_FT12.PN"]

            User: "NO! Teraz widać twarze i włosy. To był dobry pomysł! https://centrala.ag3nts.org/dane/barbara/IMG_1410_FXER.PNG"
            AI: ["https://centrala.ag3nts.org/dane/barbara/IMG_1410_FXER.PNG"]

            User: "Images: https://static.com/pic1.PNG, paths: /invalid, /path/to/image.png, base path: https://assets.com/"
            AI: ["https://static.com/pic1.PNG", "https://assets.com/path/to/image.png"]

            User: "Słuchaj! mam dla Ciebie fotki o które prosiłeś. https://centrala.ag3nts.org/dane/barbara/IMG_559.PNG https://centrala.ag3nts.org/dane/barbara/IMG_1410.PNG https://centrala.ag3nts.org/dane/barbara/IMG_1443.PNG https://centrala.ag3nts.org/dane/barbara/IMG_1444.PNG."
            AI: ["https://centrala.ag3nts.org/dane/barbara/IMG_559.PNG", "https://centrala.ag3nts.org/dane/barbara/IMG_1410.PNG", "https://centrala.ag3nts.org/dane/barbara/IMG_1443.PNG", "https://centrala.ag3nts.org/dane/barbara/IMG_1444.PNG"]
        </examples>

        Text to analyze: ${imagesResponse}

        Provide ONLY the final array as output.
    `;

    let extractedImages = '';

    try {
        const extractedImagesResponse = await openAiService.completion({
            model: 'gpt-4o',
            messages: [
                {
                    role: 'system',
                    content: prompt,
                },
            ],
        }) as ChatCompletion;

        extractedImages = extractedImagesResponse.choices[0].message.content || '';

        return JSON.parse(extractedImages);
    } catch (e) {
        throw new Error(`Failed to extract images: extractedImages - ${extractedImages}, ${e instanceof Error ? e.message : 'Unknown error'}`);
    }
}

import { OpenAIService } from '../modules/OpenAIService';
import { ChatCompletion } from 'openai/resources/chat/completions';
import { verifyResults } from '../utils/verifyResults';

const simplifyInstruction = async (
    instruction: string,
    openAiService: OpenAIService,
): Promise<string> => {
    const prompt = `You are a helpful assistant who simplifies the instructions after carefully reading them.

        <rules>
            - The instructions are always in the form of a string.
            - The instructions are always in Polish language.
            - Return only simplified instructions in Polish language.
            - Keep the important information like maximum, minimum, or specific values.
        </rules>
        
        <example>
            User: Dobra. To co? zaczynamy? Odpalam silniki. Czas na kolejny lot. Jesteś moimi oczami. Lecimy w dół, albo nie! nie! czekaaaaj. Polecimy wiem jak. W prawo i dopiero teraz w dół. Tak będzie OK. Co widzisz?
            AI: Lecimy w prawo i w dół.
            
            User: Idziemy na sam dół mapy. Albo nie! nie! nie idziemy. Zaczynamy od nowa. W prawo maksymalnie idziemy. Co my tam mamy?
            AI: Lecimy maksymalnie w prawo.
        </example>
    `;

    const simplifyInstructionResponse = (await openAiService.completion({
        messages: [
            {
                role: 'system',
                content: prompt,
            },
            {
                role: 'user',
                content: instruction,
            },
        ],
    })) as ChatCompletion;

    return simplifyInstructionResponse.choices[0].message.content || '';
};

const groundDescription = async (
    instruction: string,
    openAiService: OpenAIService,
): Promise<string> => {
    const prompt = `You are an AI assistant responsible for describing the ground under a drone based on a map and user-provided instructions. The **instruction** is always provided in Polish, and your response must also be in Polish.

        ### Map:
        The map contains 4 columns (A - first from right, B, C, D) and 4 rows (1 - first from top, 2, 3, 4). The drone always starts at position **A1**.
        
        ### Ground Details:
        - A2: trawa
        - A3: trawa
        - A4: skały
        - B1: trawa
        - B2: wiatrak
        - B3: trawa
        - B4: skały
        - C1: drzewo
        - C2: trawa
        - C3: skały
        - C4: samochód
        - D1: dom
        - D2: trawa
        - D3: dwa drzewa
        - D4: jaskinia
        
        ---
        
        ### Instructions:
        1. **Understand the user's input:** The instructions are always provided in Polish. Interpret the movements based on common Polish phrases:
           - "w dół" – move one step down (e.g., from A4 to A3),
           - "w górę" – move one step up (e.g., from A4 to A5),
           - "w lewo" – move one step left (e.g., from B4 to A4),
           - "w prawo" – move one step right (e.g., from A4 to B4),
           - "maksymalnie" – move as far as possible in the mentioned direction until the map’s boundary (e.g., "maksymalnie w prawo" from A1 to D1),
           - "x razy" or "dwa kroki" – execute the movement multiple times (e.g., "przesuń się dwa kroki w dół").
           
        2. **Calculate the drone’s position:** Determine the drone’s final position on the map by applying the user’s instruction sequentially. If the instruction asks for movement beyond the map's boundaries, stop the drone at the edge.
           
        3. **Describe the ground under the drone:** Use the map details to describe what is below the drone at its final position.
           
        4. **Explain your reasoning in Polish:** Provide a step-by-step explanation in Polish of how you calculated the drone's position and describe the ground under the drone.
        
        ---
        
        ### Example Input and Output:
        
        **Example 1:**
        **Input Instruction:** Lecimy w dół. Co widzisz?  
        **AI's Reasoning:**  
        Krok 1: Startuję na pozycji A1. 'W dół' oznacza ruch pionowy w dół o jedno pole. Przesuwam się na A2.  
        Krok 2: Na pozycji A2 teren zawiera: trawa.  
        **Response:** trawa.
        
        **Example 2:**
        **Input Instruction:** Lecimy maksymalnie w prawo. Co widzisz?  
        **AI's Reasoning:**  
        Krok 1: Startuję na pozycji A1. 'Maksymalnie w prawo' oznacza przesunięcie w poziomie na skraj mapy w prawo. Przesuwam się na D1.  
        Krok 2: Na pozycji D1 teren zawiera: dom.  
        **Response:** dom.
        
        **Example 3:**
        **Input Instruction:** Przesuń się dwa razy w dół. Co widzisz?  
        **AI's Reasoning:**  
        Krok 1: Startuję na pozycji A1. Pierwszy ruch 'w dół' przesuwa mnie na A2, drugi ruch 'w dół' przesuwa mnie na A3.  
        Krok 2: Na pozycji A3 teren zawiera: trawa.  
        **Response:** trawa.
        
        ---
        
        Now, interpret the following **Polish instruction** to determine the drone’s position. Follow the map rules, describe the position step-by-step, and provide your final response in Polish.
        
        **Instruction (in Polish):** "${instruction}"
        
        **Your Response (in Polish):**
    `;

    const groundedDescriptionResponse = (await openAiService.completion({
        messages: [
            {
                role: 'system',
                content: prompt,
            },
        ],
    })) as ChatCompletion;

    return groundedDescriptionResponse.choices[0].message.content || '';
};

export const webhookApi = async (body: { instruction: string }) => {
    const openAiService = new OpenAIService();

    const { instruction } = body;

    const simplifiedInstruction = await simplifyInstruction(instruction, openAiService);
    const groundedDescription = await groundDescription(simplifiedInstruction, openAiService);

    return {
        description: groundedDescription,
    };
};

export const webhook = async () => {
    const { message } = await verifyResults(
        'https://opportunity-evaluate-mas-transport.trycloudflare.com/webhookApi',
        'webhook',
    );

    return message;
};

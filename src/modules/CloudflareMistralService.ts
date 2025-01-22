type MistralCompletionResponse = {
    inputs: {
        messages: {
            role: string;
            content: string;
        }[];
    };
    response: {
        response: string;
    };
}[];

export class CloudflareMistralService {
    static async completion(prompt: string, query: string): Promise<MistralCompletionResponse> {
        const formData = new URLSearchParams();

        formData.append('prompt', prompt);
        formData.append('query', query);

        const response = await fetch('https://mistral.bartosz-kut93.workers.dev/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData.toString(),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        return response.json();
    }
}

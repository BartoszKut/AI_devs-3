import OpenAI from 'openai';
import fs from 'fs';

import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { APIPromise } from 'openai/core';

export class OpenAIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI();
    }

    async completion(config: {
        messages: ChatCompletionMessageParam[],
        model?: string,
        stream?: boolean,
        jsonMode?: boolean,
        maxTokens?: number
    }): Promise<OpenAI.Chat.Completions.ChatCompletion | AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>> {
        const { messages, model = 'gpt-4o-mini', stream = false, jsonMode = false, maxTokens = 8096 } = config;

        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages,
                model,
                ...(model !== 'o1-mini' && model !== 'o1-preview' && {
                    stream,
                    max_tokens: maxTokens,
                    response_format: jsonMode ? { type: 'json_object' } : { type: 'text' }
                })
            });

            return stream
                ? chatCompletion as AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>
                : chatCompletion as OpenAI.Chat.Completions.ChatCompletion;
        } catch (error) {
            console.error('Error in OpenAI completion:', error);
            throw error;
        }
    };

    async sttTranscription(config: {
        pathToFile: string,
        model?: string,
    }): Promise<APIPromise<OpenAI.Audio.Transcriptions.Transcription>> {
        const { pathToFile, model = 'whisper-1' } = config;

        try {
            return await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(pathToFile),
                model,
            });
        } catch (error) {
            console.error('Error in STT Transcription:', error);

            throw new Error('Failed to transcribe audio file');
        }
    };

    async imageGeneration(config: {
        prompt: string,
        model?: string,
        quality?: string,
        n?: number,
        size?: '1024x1024' | '1024x1792' | '1792x1024',
    }): Promise<APIPromise<OpenAI.Images.ImagesResponse>> {
        const { prompt, model = 'dall-e-3', quality = 'standard', n = 1, size = '1024x1024' } = config;

        try {
            return await this.openai.images.generate({
                model,
                prompt,
                n,
                size,
            });
        } catch (error) {
            console.error('Error in image generation:', error);

            throw new Error('Failed to generate image');
        }
    };
}

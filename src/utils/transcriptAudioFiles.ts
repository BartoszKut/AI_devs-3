import type { OpenAIService } from '../modules/OpenAIService';

import fs from 'fs';
import path from 'path';

interface Transcript {
    text: string;
    fileName: string;
}

export const transcriptAudioFiles = async (
    directory: string,
    openAiService: OpenAIService,
): Promise<Transcript[]> => {
    try {
        const files = await fs.promises.readdir(directory);
        const transcribedRecords: Transcript[] = [];

        for (const file of files) {
            const filePath = path.join(directory, file);

            if (
                fs.lstatSync(filePath).isFile() &&
                ['.mp3', '.wav', '.flac', '.m4a'].includes(path.extname(file).toLowerCase())
            ) {
                const transcribedSTT = await openAiService.sttTranscription({
                    pathToFile: filePath,
                });
                transcribedRecords.push({ ...transcribedSTT, fileName: file });
            }
        }

        return transcribedRecords;
    } catch (error) {
        console.error('Error reading directory:', error);
        throw error;
    }
};

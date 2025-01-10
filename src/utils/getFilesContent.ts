import fs from "fs";
import path from "path";

export interface FileContent {
    fileName: string;
    text: string;
}

export const getFilesContent = (directory: string): FileContent[] => {
    const files = fs.readdirSync(directory);
    const factFilesContent: FileContent[] = [];

    files.forEach(file => {
        const filePath = path.join(directory, file);

        if (file.endsWith('.txt')) {
            const text = fs.readFileSync(filePath, 'utf-8');
            factFilesContent.push({ fileName: file, text });
        }
    });

    return factFilesContent;
};

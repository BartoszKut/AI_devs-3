import fs from "fs";
import path from "path";

export interface ImageForLLM {
    type: string,
    image_url: {
        url: string,
    },
    fileName: string;
}

const encodeImageToBase64 = (filePath: string): string => {
    const fileBuffer = fs.readFileSync(filePath);

    return fileBuffer.toString('base64');
};

export const prepareImagesForLLM = async (directory: string): Promise<ImageForLLM[]> => {
    const images = await fs.promises.readdir(directory);
    const formattedImages: ImageForLLM[] = [];

    for (const image of images) {
        const imagePath = path.join(directory, image);

        if (fs.lstatSync(imagePath).isFile() && path.extname(image).toLowerCase() === '.png') {
            const base64Image = encodeImageToBase64(imagePath);

            formattedImages.push({
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${base64Image}` },
                fileName: image,
            });
        }
    }

    return formattedImages;
}

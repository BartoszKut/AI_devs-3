import { fetchFromApi } from './fetchFromApi';

export const verifyResults = async <T>(
    data: T,
    task: string,
): Promise<{ code: number; message: string }> =>
    fetchFromApi('https://centrala.ag3nts.org/report', {
        task,
        apikey: process.env.AI_DEVS_API_KEY,
        answer: data,
    });

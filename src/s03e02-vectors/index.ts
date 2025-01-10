import { OpenAIService } from '../modules/OpenAIService';
import { QdrantService } from '../modules/QdrantService';
import { getFilesContent } from '../utils/getFilesContent';
import { verifyResults } from '../utils/verifyResults';

const COLLECTION_NAME = 'weapons_test_embeddings_collection';
const QUESTION = 'W raporcie, z którego dnia znajduje się wzmianka o kradzieży prototypu broni?';

async function indexTextWithFileMetadata(
    text: string,
    fileName: string,
    openAiService: OpenAIService,
    qdrantService: QdrantService,
): Promise<void> {
    const embeddingResponse = await openAiService.createEmbedding({
        input: text,
    });
    const embedding = embeddingResponse.data[0].embedding;

    const metadata = {
        textSnippet: text.slice(0, 200),
        date: fileName.replace(/\.txt$/, ''),
        timestamp: new Date().toISOString(),
    };

    const point = {
        id: Date.now(),
        vector: embedding,
        payload: metadata,
    };

    await qdrantService.upsert(COLLECTION_NAME, [point]);
}

const queryVectorWithQuestion = async (openAiService: OpenAIService, qdrantService: QdrantService) => {
    const embeddingResponse = await openAiService.createEmbedding({
        input: QUESTION,
    });
    const embedding = embeddingResponse.data[0].embedding;

    return await qdrantService.search(
        COLLECTION_NAME,
        embedding,
        1,
    );
}

export const vectors = async (): Promise<string> => {
    const openAiService = new OpenAIService();
    const qdrantService = new QdrantService();

    const collections = await qdrantService.getCollections();
    const collectionExists = collections.collections.some((collection) => collection.name === COLLECTION_NAME);
    if (collectionExists) {
        await qdrantService.deleteCollection(COLLECTION_NAME);
    }

    await qdrantService.createCollection(COLLECTION_NAME);

    const files = getFilesContent('assets/filesFromFactory/do-not-share');

    const indexingPromises = files.map((file) => {
        const { fileName, text } = file;

        return indexTextWithFileMetadata(text, fileName, openAiService, qdrantService);
    });

    await Promise.all(indexingPromises);

    const results = await queryVectorWithQuestion(openAiService, qdrantService);
    const dateAsString = results[0].payload?.date as string;

    const { message } = await verifyResults(dateAsString.replace(/_/g, '-'), 'wektory');

    return message;
};

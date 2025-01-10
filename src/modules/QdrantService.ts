import { QdrantClient } from '@qdrant/js-client-rest';

export class QdrantService {
    private qdrantClient: QdrantClient

    constructor() {
        this.qdrantClient = new QdrantClient({
            url: process.env.QDRANT_HOST,
            apiKey: process.env.QDRANT_API_KEY,
        });
    };

    async getCollections(): Promise<{ collections: { name: string }[] }> {
        try {
            return await this.qdrantClient.getCollections();
        } catch (error) {
            console.error('Error in getting collections:', error);
            throw error;
        }
    }

    async deleteCollection(collectionName: string): Promise<void> {
        try {
            await this.qdrantClient.deleteCollection(collectionName);
        } catch (error) {
            console.error('Error in deleting collection:', error);
            throw error;
        }
    }

    async createCollection(collectionName: string): Promise<void> {
        try {
            await this.qdrantClient.createCollection(
                collectionName, {
                vectors: {
                    size: 3072,
                    distance: "Cosine",
                },
                shard_number: 1,
            });
        } catch (error) {
            console.error('Error in creating collection:', error);
            throw error;
        }
    }

    async upsert(collectionName: string, points: { id: number, vector: number[], payload: any }[]): Promise<void> {
        try {
            await this.qdrantClient.upsert(collectionName, { points });
        } catch (error) {
            console.error('Error in upserting points:', error);
            throw error;
        }
    }

    async search(collectionName: string, vector: number[], limit: number) {
        try {
            return await this.qdrantClient.search(collectionName, {
                vector,
                limit,
            });
        } catch (error) {
            console.error('Error in searching points:', error);
            throw error;
        }
    }
}

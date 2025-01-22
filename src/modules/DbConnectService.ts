interface IShowTables {
    reply: {
        Tables_in_banan: string;
    }[];
    error: string;
}

interface IShowCreateTable {
    reply: {
        Table: string;
        'Create Table': string;
    }[];
    error: string;
}

export class DbConnectService {
    private url: string;
    private apiKey: string;

    constructor() {
        this.url = process.env.DB_HOST || '';
        this.apiKey = process.env.AI_DEVS_API_KEY || '';

        if (!this.url || !this.apiKey) {
            throw new Error('DB_HOST or AI_DEVS_API_KEY is not set in the .env file');
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async makePostRequest<T>(path: string, body: any): Promise<T> {
        const response = await fetch(`${this.url}${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(
                `HTTP ${response.status}: ${response.statusText} - ${await response.text()}`,
            );
        }

        return response.json();
    }

    async select<T>(query: string): Promise<T> {
        const payload = {
            task: 'database',
            apikey: this.apiKey,
            query: query,
        };

        try {
            return this.makePostRequest('/query', payload);
        } catch (e) {
            throw new Error(`Failed to execute query: ${e}`);
        }
    }

    async showTables(): Promise<IShowTables> {
        try {
            return this.select('show tables');
        } catch (e) {
            throw new Error(`Failed to fetch tables: ${e}`);
        }
    }

    async showCreateTable(tableName: string): Promise<IShowCreateTable> {
        try {
            return this.select(`show create table ${tableName}`);
        } catch (e) {
            throw new Error(`Failed to fetch table structure: ${e}`);
        }
    }
}

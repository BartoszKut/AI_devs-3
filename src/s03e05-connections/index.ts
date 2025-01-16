import neo4j, { Session } from 'neo4j-driver';

import { DbConnectService } from '../modules/DbConnectService';
import { verifyResults } from '../utils/verifyResults';

type User = {
    id: string;
    username: string;
    access_level: string;
    is_active: string;
    lastlog: string;
};

type UserResponse = {
    reply: User[];
    error: string;
};

type Connection = {
    user1_id: string;
    user2_id: string;
};

type ConnectionResponse = {
    reply: Connection[];
    error: string;
};

const NEO4J_USER = 'neo4j';
const NEO4J_URI = process.env.NEO4J_URI || '';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || '';

const driver = neo4j.driver(NEO4J_URI, neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD));

const fetchAndSaveData = async () => {
    const dbConnectService = new DbConnectService();
    const usersResponse = await dbConnectService.select<UserResponse>('select * from users');
    const connectionsResponse = await dbConnectService.select<ConnectionResponse>('select * from connections');

    if (!usersResponse.reply || !connectionsResponse.reply) {
        throw new Error('Failed to fetch data from the database.');
    }

    return { users: usersResponse.reply, connections: connectionsResponse.reply };
};

const createGraphStructure = async (users: User[], connections: Connection[]) => {
    const session = driver.session();
    const tx = session.beginTransaction();

    try {
        for (const user of users) {
            await tx.run(
                'CREATE (u:User {id: $id, username: $username, access_level: $access_level, is_active: $is_active, lastlog: $lastlog})',
                {
                    id: user.id,
                    username: user.username,
                    access_level: user.access_level,
                    is_active: user.is_active,
                    lastlog: user.lastlog,
                }
            );
        }

        for (const connection of connections) {
            await tx.run(
                'MATCH (a:User {id: $user1_id}), (b:User {id: $user2_id}) ' +
                'CREATE (a)-[:KNOWS]->(b)',
                {
                    user1_id: connection.user1_id,
                    user2_id: connection.user2_id,
                }
            );
        }

        await tx.commit();
    } catch (error) {
        console.error('Error creating graph structure:', error);

        await tx.rollback();
    } finally {
        await session.close();
    }
};

const findShortestPath = async (session: Session) => {
    try {
        const result = await session.run(
            'MATCH (start:User {username: "Rafał"}), (end:User {username: "Barbara"}), ' +
            'p = shortestPath((start)-[:KNOWS*]->(end)) ' +
            'RETURN p'
        );

        if (result.records.length === 0) {
            console.log('No path found!');
            return null;
        }

        const path = result.records[0].get('p');
        // @ts-ignore
        const names = path.segments.map((segment) => segment.start.properties.username)
            .concat(path.end.properties.username);

        return names.join(', ');
    } catch (error) {
        console.error('Error finding shortest path:', error);
    }
};

export const connections = async () => {
    try {
        const { users, connections } = await fetchAndSaveData();
        await createGraphStructure(users, connections);

        const session = driver.session();
        const shortestPath = await findShortestPath(session);

        await session.close();

        const { message } = await verifyResults(shortestPath, 'connections');

        return message;
    } catch (error) {
        console.error('Error in connections:', error);
    } finally {
        await driver.close();
    }
};

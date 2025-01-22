export const sanitizeQuery = (sqlQuery: string) => {
    const trimmedQuery = sqlQuery.replace(/`/g, '').replace(/sql/g, '').trim();

    if (!trimmedQuery.toUpperCase().startsWith('SELECT')) {
        throw new Error('Wrong query: Expected SELECT query.');
    }

    return trimmedQuery;
};

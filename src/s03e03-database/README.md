# Database Task

## Task Overview
The objective of this task is to analyze a database from the BanAN company and retrieve specific datacenter IDs. Using the provided custom API, the goal is to identify active datacenters (DC_ID) managed by inactive managers (currently on leave) . This information will help the central agency assess potential vulnerabilities. The task is named database .

## Task Details
 - [API URL](https://centrala.ag3nts.org/apidb)
 - API Query Format:
```json
{
    "task": "database",
    "apikey": "Your API Key",
    "query": "select * from users limit 1"
}
```

## Steps to Solve
1. **Connect to the API**:
    - Establish a connection with the API using the provided URL.
    - Send and receive data in JSON format.

2. **Fetch Table Structures**:
   - Use the `show tables` command to retrieve a list of tables.
   - Use the `show create table TABLE_NAME` command to fetch the schema for relevant tables.
   
3. **Generate SQL Query**:
   - Use an LLM to generate the required SQL query.
   - Provide the LLM with:
     - Table structures.
     - The specific question: `Które aktywne datacenter (DC_ID) są zarządzane przez pracowników, którzy są na urlopie (is_active=0)?`
   - Ensure the query adheres to database structures and resolves the task requirements.
   
4. **Execute the Query**:
   - Run the generated SQL query against the database using the API.
   - Extract the response, which should include the IDs of the relevant datacenters.
   
5. **Format and Submit the Answer**:
   - Structure the output
   - Submit the result to the central agency for verification.
   
6. **Verify Results**:
   - Use the verifyResults function to confirm the correctness of your solution.
   - Upon verification, you will receive a flag.

# Connections Task

## Task Overview
The objective of this task is to find the shortest path from Rafał to Barbara using a graph database. The task involves creating a graph structure from user and connection data, and then querying the graph to find the shortest path. The task is named connections.  

## Task Details
- [Database Neo4j](https://neo4j.com/) is used as the graph database for this task.
- The Neo4j database is run locally using Docker. Ensure Docker is installed and running on your machine. Use the following commands to start and stop the Neo4j container:
```
# Start Neo4j container
docker run -d --name neo4j -p 7687:7687 -p 7474:7474 -e NEO4J_AUTH=neo4j/password neo4j

# Stop Neo4j container
docker stop neo4j

# Remove Neo4j container
docker rm neo4j
```

### Steps to Solve
1. **Fetch Data**:  
    - Retrieve user and connection data from the MySQL database.

2. **Create Graph Structure**:  
   - Use Neo4j to create nodes for each user and relationships for each connection.
   - Each user node contains properties such as id, username, access_level, is_active, and lastlog.

3. **Find Shortest Path**:
   - Query the Neo4j database to find the shortest path from Rafał to Barbara.
   - Return the path as a string of usernames separated by commas.

4. **Verify Results**:
   - Use the verifyResults function to confirm the correctness of the solution.
   - Upon verification, a flag will be returned.ss_level, is_active, and lastlog.

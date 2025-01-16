# AI_devs 3

This repository was created as part of the **AI_devs3** course. The goal is to develop and share solutions to various AI-related tasks while utilizing modern tools and frameworks.

## Tools & Technologies

- **[Bun](https://bun.sh/)**: A fast JavaScript runtime used for building and running the application.
- **[Elysia](https://elysiajs.com/)**: A lightweight and efficient framework used to structure the project and handle functionality.
- **[OpenAI](https://platform.openai.com/docs/overview)**: LLM suggested to use by course creators.
- **[Qdrant](https://qdrant.tech/)**: Vector database with 1GB free forever cluster and no credit card required.
- **[@qdrant/js-client-rest](https://github.com/qdrant/qdrant-js)**: Client to communicate with the Qdrant database.
- **[Neo4j](https://neo4j.com/)**: Graph database.
- **[neo4j-driver](https://www.npmjs.com/package/neo4j-driver)**: Official Neo4j driver for JavaScript.
- **[docker](https://www.docker.com/)**: Containerization platform used to run the Neo4j database.

## Project Structure

All solutions for the tasks are exposed via dedicated API endpoints. Each endpoint corresponds to a specific task and provides the logic to solve it. This setup makes it easy to interact with and test the solutions.

## Endpoints List

Below is a list of the available endpoints (tasks may be updated or expanded over time):

1. **`/`** - Base endpoint that returns a welcome message.
2. **`/verify`** - Solution for the "Verification Process Task" (human/robot verification - S01E02).
3. **`/fix`** - Solution for the "Fix Calibration File" (Fix robot's calibration file - S01E03).
4. **`/censorship`** - Solution for the "Personal Data Censorship" (Agent data censorship system - S01E05).
5. **`/mp3`** - Solution for the "Witness Interrogation Transcription Task" (Transcribe witness interrogations - S02E01).
6. **`/city`** - Solution for the "City Recognition Task" (City recognition based on map fragments - S02E02).
7. **`/robot`** - Solution for the "Robot Image Generation Task" (Generate robot image based on description - S02E03).
8. **`/categories`** - Solution for the "Categories Classification Task" (Classify text content into categories - S02E04).
9. **`/arxiv`** - Solution for the "Arxiv Multimodal Task" (Answer the questions - S02E05).
10. **`/documents`** - Solution for the "Documents Metadata Task" (Prepare metadata for reports - S03E01).
11. **`/vectors`** - Solution for the "Vectors Search Task" (Search for similar vectors - S03E02).
12. **`/database`** - Solution for the "Database Task" (Analyze database and retrieve specific datacenter IDs - S03E03).
13. **`/loop`** - Solution for the "Loop Task" (Locate Barbara Zawadzka using interconnected APIs - S03E04).
14. **`/connections`** - Solution for the "Connections Task" (Find the shortest path from Rafał to Barbara using a graph database - S03E05).

## Getting Started

### Prerequisites
- Ensure Node.js is installed.
- Install **Bun**: Follow the installation guide [here](https://bun.sh/).

### Installation

Clone this repository and install dependencies:

```bash
git clone https://github.com/BartoszKut/AI_devs-3.git
cd AI_devs-3
bun install
```

### Configuration

Copy the `.env-example` file to `.env`:
    
```bash
cp .env-example .env
```

Edit the `.env` file to add your `OpenAI API key`.
You can request the `AI_DEVS_API_KEY` via email - `bartosz.kut93@gmail.com`.

### Running the Application
Start the application (e.g., in development mode) with:

```bash
bun run dev
```

The API will now be available at http://localhost:3000.

### Testing Endpoints
To test an endpoint:
1. Send a request to the specific endpoint.
2. The server processes the request according to the task logic.
3. A FLAG is returned if the logic is implemented correctly.

For example:
```bash
curl http://localhost:3000/verify
```
should return a response with the FLAG, e.g.,
`{{FLG:MEMORIES}}%`

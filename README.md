# AI_devs 3

This repository was created as part of the **AI_devs3** course. The goal is to develop and share solutions to various AI-related tasks while utilizing modern tools and frameworks.

## Tools & Technologies

- **[Bun](https://bun.sh/)**: A fast JavaScript runtime used for building and running the application.
- **[Elysia](https://elysiajs.com/)**: A lightweight and efficient framework used to structure the project and handle functionality.

## Project Structure

All solutions for the tasks are exposed via dedicated API endpoints. Each endpoint corresponds to a specific task and provides the logic to solve it. This setup makes it easy to interact with and test the solutions.

## Endpoints List

Below is a list of the available endpoints (tasks may be updated or expanded over time):

1. **`/verify`** - Solution for the "Verification Process Task" (human/robot verification - S01E02).

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

### Running the Application
Start the application (e.g., in development mode) with:

```bash
bun run dev
```

The API will now be available at http://localhost:3000 (replace PORT with the configured port).

### Testing Endpoints
To test an endpoint:
1. Send a request to the specific endpoint.
2. The server processes the request according to the task logic.
3. A FLAG is returned if the logic is implemented correctly.

For example:
```bash
curl http://localhost:3000/verify
```
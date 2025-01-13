# Loop task

## Task Overview
The objective of this task is to locate Barbara Zawadzka using two interconnected APIs and a provided note. The APIs allow us to collect information on:
Places where specific individuals (e.g., Barbara) were last seen.
People spotted in given cities.

## Task Details
- [Person-to-City API](https://centrala.ag3nts.org/people) - Retrieve a list of cities associated with a given person's name (in nominative case, without Polish characters).
- [City-to-Person API](https://centrala.ag3nts.org/places) - Retrieve a list of people who were last seen in a specific city (no Polish characters).
- [Barbara's Note](https://centrala.ag3nts.org/dane/barbara.txt)

## Steps to Solve
1. **Extract Information**:
   - Start by downloading and analyzing the provided note.
   - Use an OpenAI-based assistant to parse names of people and cities from the text in a structured JSON format, ensuring nominative case and removal of Polish diacritic characters.
   
2. **Establish Links Between People and Cities**:
   - Use the Person-to-City API to identify cities associated with the extracted list of people.
   - Use the City-to-Person API to identify people associated with the extracted list of cities.
   - Collect all results dynamically in sets to avoid duplication.
   
3. **Iterative Refinement**:
   - Recursively process newly discovered cities and individuals:
     - Query the APIs for new people connected to newly discovered cities.
     - Query the APIs for new cities connected to newly discovered people.
   - Repeat this process until no new information is discovered (i.e., the response stabilizes).
   
4. **Locate Barbara**:
   - From the final list of potential cities, query the City-to-Person API to check where Barbara is located.
   - Identify Barbara's current location based on the API responses.
   
5. **Report Results**:
   - Format Barbara's location as specified by the API (uppercase, no Polish characters).
   - Submit the result via the /report endpoint for final validation.
   - If successful, retrieve the flag indicating task completion.
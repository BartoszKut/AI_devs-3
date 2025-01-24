# Webhook Task

## Task Overview
The objective of this task is to create an API that processes instructions in Polish, calculates the final position of a drone on a predefined map, and returns a description of the terrain in two words . The solution is validated when the central office successfully processes a series of simulated flight instructions.

## Steps to Solve
1. **Create an API**:
    - An HTTPS-enabled API was created to handle POST requests containing JSON data with flight instructions in Polish (e.g., "Lecimy maksymalnie w prawo").

2. **Process Instructions**:
   - Instructions are simplified for better clarity using a custom prompt for a language model.
   - The drone's position is calculated step-by-step based on the instructions.
   - The terrain under the final position of the drone is described using a prompt that includes map details.
   
3. **Return Response**:
   - The API responds with a JSON object that includes the field "description", containing a two-word description of the terrain (e.g., "trawa, skały").

## Technical Details
   - Hosting : The API is hosted locally and exposed via tunneling using Cloudflare to provide HTTPS access.

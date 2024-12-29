# City Recognition Task

## Task Overview
The objective of this task is to identify the city based on provided map fragments. One of the map fragments might be incorrect and could belong to a different city. Use a model capable of image recognition to determine the city name and submit it as a flag.  

## Steps to Solve
1. **Prepare Map Images**:  
    - four images with four map elements could be fined under the `maps` directory.

2. **Use Vision Module**:  
   - The `GPT-4o` model has been used with the prompt, and it should return the expected city.

3. **Submit the City Name**:
   - Report the obtained city name to the central office as a flag (through the UI. Do not use the API for this task).
   
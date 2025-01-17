# Photos Task

## Task Overview

The objective of this task is to prepare an accurate **description of Barbara** based on a set of damaged photos retrieved from a digital camera. These photos may contain Barbara, but we don't know what she actually looks like. That's where you come in.

The assistant supports the following operations on photos for analysis:
- **REPAIR**: Fixes damaged, blurry, or corrupted photos containing artifacts or glitches.
- **DARKEN**: Adjusts brightness for overly bright or washed-out photos, making them clearer.
- **BRIGHTEN**: Enhances underexposed or too dark photos by increasing brightness.

### Commands Recognized by the Assistant
To instruct the assistant on what to do with a specific photo, you can issue one of the following commands (e.g. `REPAIR` for a specific file):

- `REPAIR <FILE_NAME>`
- `DARKEN <FILE_NAME>`
- `BRIGHTEN <FILE_NAME>`

## Steps to Solve
1. **Initiate the Task**
   - Start the task by sending a request to the task endpoint named **`photos`**. The assistant will respond with four damaged photos . These photos were recovered from a digital camera. Barbara may be present in one or more of these photos. Some photos may contain irrelevant details.

2. **Analyze and Enhance the Photos**:
   - Based on the assistant's response decide which photos need fixing.
   Issue the appropriate commands for each photo to improve image quality (e.g., REPAIR IMG_1234.PNG).
3. **Iteratively Repair Photos**
   - For each photo, instruct the assistant which tool to use (REPAIR, DARKEN, or BRIGHTEN) based on the photo's condition.
   - The assistant will respond with a URL to the updated photo or an explanation of the result.
   - Repeat this process until the photo quality is sufficient for analysis.
   
4. **Generate Barbara's Description**:
   - Once the photos are in good enough use them to identify Barbara's features.
   - Prepare a detailed description of Barbara in Polish

5. **Report Results**:
    - Submit the description of Barbara via the `/report` endpoint for final validation.
    - If successful, retrieve the flag indicating task completion.

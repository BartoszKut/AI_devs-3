# Categories Classification Task

## Task Overview
The objective of this task is to classify text content from various file types (TXT, PNG, MP3) into categories: "people" or "hardware". 
The classification is based on the information contained within the files. 
If the information does not pertain to either category, it is ignored. 
The results are reported as a JSON list of file names.

## Steps to Solve
1. **Read File Contents**:
    - Read the contents of the TXT files.
    - Convert the PNG files to text using the OpenAIService.
    - Transcribe the MP3 files to text using the OpenAIService.

2. **Classify Text Content**:
    - Use a predefined prompt to analyze the text content and determine if it contains information about "people" or "hardware".

3. **Report Results**:
    - Create a JSON object with lists of file names categorized as "people" or "hardware".

4. **Verify Results**:
    - Verify the prepared data using the verifyResults utility function to obtain the flag.
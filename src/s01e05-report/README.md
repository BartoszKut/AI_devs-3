# Personal Data Censorship Task

## Task Overview
The objective of this task is to process a file (`cenzura.txt`) containing potentially sensitive personal data and censor specific details following strict preservation of the document's format. The goal is to replace all sensitive information with the word **CENZURA**, ensuring the original structure, punctuation, and spacing of the text remain unaffected.

## Steps to Solve

1. **Download the Input File**:
    - Before starting the task, download the most recent version of the file `cenzura.txt`.
    - The file updates every 60 seconds, so ensure you have the latest version.

2. **Process the File**:
    - The file contains personal data that must be censored.
    - Replace the following details with the word **CENZURA**:
        - Name and Surname
        - Street and House/Building Number
        - City
        - Age of the person

3. **Use AI Tools for Automation**:
    - Mistral LLM from cloudfare is used to automate the process of identifying and replacing sensitive information with **CENZURA**.

5. **Submit the Corrected text**:
   - The obfuscated text is sent to the server for validation, and a response message with the FLAG is received.

# Arxiv Task

## Task Overview
The objective of this task is to extract and analyze content from a document provided by Professor Andrzej Maj. The document contains text, images, and audio. The goal is to answer the questions provided by the central agency based on the information in the document.

## Task Details
- [Document URL](https://centrala.ag3nts.org/dane/arxiv-draft.html)
- [**Questions URL**](https://centrala.ag3nts.org/data/KLUCZ-API/arxiv.txt)

## Steps to Solve
1. **Fetch Document and Questions**:
    - Retrieve the document from the provided URL.
    - Retrieve the list of questions from the provided URL.

2. **Extract Content**:
    - Extract and describe images using the OpenAIService.
    - Extract and transcribe audio content using the OpenAIService.

3. **Replace Tags with Extracted Content**:
    - Replace the content of the `audio` tag with the transcribed audio.
    - Replace the `figure` tags with the image descriptions.

4. **Generate Answers**:
    - Use a predefined prompt to generate answers to the questions based on the extracted content.
    - Ensure the answers are concise and in Polish.

5. **Verify Results**:
    - Verify the prepared answers using the `verifyResults` utility function to obtain the flag.

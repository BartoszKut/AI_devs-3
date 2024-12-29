# Witness Interrogation Transcription Task

## Task Overview
The objective of this task is to process a ZIP archive containing audio recordings of witness interrogations related to Professor Maj. The goal is to transcribe the audio files, extract relevant information, and determine the street name where the professor's institute is located. The final answer should be submitted in the specified format.  

## Steps to Solve
1. **Download and Extract Audio Files**:
    - Download the ZIP archive containing the audio recordings from the provided link.
    - Extract the contents of the ZIP archive to access the audio files.

2. **Transcribe Audio Files**:
    - Use the `transcriptAudioFiles` function to read and transcribe the audio files into text using the OpenAIService.
    - Store the transcriptions in an array.  

3. **Combine Transcriptions**:
    - Combine the transcriptions to create a comprehensive context for the prompt.  

4. **Identify Institute Name**:
    - Use the `getInstituteName` function to extract the institute's name from the combined transcriptions.
    
5. **Determine Street Name**:
    - Use the `getStreetNameWhereProfessorTeaches` function to determine the street name where the professor's institute is located.
    - Ensure the street name is accurately identified based on the institute's location.

6. **Submit the Answer**:
    - Submit the verified street name to the central server for validation.  

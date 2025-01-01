# Robot Image Generation Task

## Task Overview
The objective of this task is to generate an image of a robot based on its description. The description will be processed to extract key phrases, which will then be used to generate the image using an AI model. The generated image will be saved locally.  


## Steps to Solve
1. **Fetch Robot Description**:  
    - Retrieve the robot description from the provided API endpoint.

2. **Extract Key Phrases**:  
    - Use the CloudflareMistralService to extract key phrases from the robot description.

3. **Generate Robot Image**:  
    - Use the OpenAIService to generate an image of the robot based on the extracted key phrases. 

4. **Save the Generated Image**:
   - Save the generated image to the robotImages directory with a unique filename.
   
5. **Verify Results**:
    - Verify the generated image using the verifyResults utility function and report the results.

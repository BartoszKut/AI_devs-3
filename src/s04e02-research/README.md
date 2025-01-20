# Research Task

## Task Overview

The objective of this task is to analyze a sample of research results and determine which results can be trusted based on reference data (correct and incorrect).

## Steps to Solve
1. **Initiate the Task**
    - Samples of research results are available in the `/researches` directory.

2. **Prepare the Data for Fine-Tuning**:
    - Generate `JSONL` file as data provider for fine-tuning.

3. **Analyze the Samples**
    - Use the fine-tuned model `ft:gpt-4o-mini-2024-07-18:personal:ai-devs3-research-v2`.

4. **Verify Results**
    - Verify the samples using the model.
    - Identify correct samples and collect their two-digit identifiers.

5. **Report Results**
    - Submit the list of correct sample identifiers via the `/report` endpoint.

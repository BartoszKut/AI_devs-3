# Weapons Tests Vector Indexing Task

## Task Overview
The objective of this task is to index the reports from the [weapons tests](../../assets/filesFromFactory/do-not-share) using embeddings in your vector database and then answer the question: `W raporcie, z którego dnia znajduje się wzmianka o kradzieży prototypu broni?` The expected answer format is YYYY-MM-DD. The task name in the central system is `wektory`.

## Steps to Solve
1. **Index the Reports Using Embeddings**:
    - Use an embedding model to index the reports in the database.

2. **Create an Embedding from the Question**:
    - Create an embedding from the question and query the database, setting the limit of returned records to 1.

3. **Verify the Date**:
    - Check the date returned by the database for the above query and submit it in the answer field to the central system (/report) in the format YYYY-MM-DD for the task `wektory`.
    - If the date is correct, you will receive a flag for the task.

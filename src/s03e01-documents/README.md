# Documents Metadata Task

## Task Overview
The objective of this task is to prepare metadata for 10 reports provided in TXT format. These reports pertain to security events that occurred in various sectors around the factory. The metadata should facilitate the central office in searching these reports using their own technologies. It is suggested that the metadata includes keywords in Polish, describing the given report. It is very important to consider all the knowledge we have (e.g., the folder with facts or references in other reports) when generating the keywords. The task name is `dokumenty`.  

## Steps to Solve
1. **Generate a List of People for Each Fact**:  
   - Identify the people mentioned in each fact.

2. **Identify the Person Related to the Report**:  
   - Determine which person the report is about.

3. **Identify the Facts Related to the Person**:  
   - Identify which facts pertain to the identified person.
   
4. **Generate Keywords Using LLM Context**:
   - Include the report, corresponding facts, and file name in the LLM context to generate keywords.
# Verification Process Task

## Task Overview

The goal is to complete a human/robot verification process to retrieve a FLAG. The task involves interacting with the robot and handling false data stored in its memory.

## Steps to Solve

1. Send `READY` to the `/verify` endpoint at the `XYZ` domain to initiate the process.
2. Receive a question and a `msgID` from the robot.
3. Answer the question while considering inaccuracies in the robot's memory:
    - Example: Respond with `'KRAKÓW'` as the capital of Poland.
4. Send the answer with the associated `msgID` back to the `/verify` endpoint.
5. Upon success, the robot returns the FLAG.

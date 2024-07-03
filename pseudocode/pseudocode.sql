Initialize:
    - A database to store tasks and a task ID counter
    - A queue to manage tasks

Define function to handle user request:
    - Generate a new task ID
    - Create a new task with given user input
    - Add task to database and queue
    - Log the new task
    - Return task ID

Define function to process tasks periodically:
    - If no tasks in the queue, simulate user interaction
    - Use multiple cores to process tasks:
        - Get a task from the queue
        - Mark the task as processing
        - Simulate task processing
        - Once completed, update task status and file path
        - Log task completion

Define function to check task status:
    - Periodically check task status:
        - If task not found, log error
        - Log current task status
        - If task completed, log completion and file URL

Define function to simulate user interaction:
    - Prompt user for input
    - If input is provided:
        - Handle user request
        - Check task status for the generated task
    - If no input, log a message

Set periodic task processing

Start initial user interaction simulation

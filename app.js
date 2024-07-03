const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Simulated in-memory database
let db = {
  tasks: [],
  taskIdCounter: 1,
  fileLock: {}, // To track file manipulation
  modificationQueues: {},
};

// Simulated Queue
const taskQueue = [];

// POST endpoint to generate music
app.post("/generate", (req, res) => {
  const { prompt, userId } = req.body;
  const taskId = db.taskIdCounter++;
  const task = {
    id: taskId,
    prompt,
    userId,
    fileStatus: 0,
    filePath: null,
    modifications: [],
  };
  db.tasks.push(task);
  taskQueue.push(taskId);
  res.json({ message: "Task queued for processing.", taskId });
});

// POST endpoint to modify music
app.post("/modify", (req, res) => {
  const { taskId, modifications, userId } = req.body;
  const task = db.tasks.find((t) => t.id === taskId);

  if (task) {
    if (task.fileStatus === 1) {
      // If task is currently being processed, queue the modification
      if (!db.modificationQueues[taskId]) {
        db.modificationQueues[taskId] = [];
      }
      db.modificationQueues[taskId].push({
        modifications,
        userId,
      });
      return res
        .status(409)
        .json({ message: "Task is being processed. Modification queued." });
    }

    // Lock the task
    task.fileStatus = 1; // Processing
    db.fileLock[task.id] = userId;
    task.modifications.push({ modifications, userId, status: 0 }); // Push new modification with status 0 (pending)

    setTimeout(() => {
      // Simulate processing completion
      task.fileStatus = 2; // Completed
      task.filePath = `/files/${taskId}.wav`; // Simulate file path

      // Release file lock
      delete db.fileLock[task.id];

      // Process modifications if any
      processModifications(task);

      res.json({ message: "Modification completed.", taskId });
    }, 3000); // Simulate processing time
  } else {
    res.status(404).json({ message: "Task not found." });
  }
});

// Function to process modifications sequentially
const processModifications = (task) => {
  task.modifications.forEach((modification) => {
    if (modification.status === 0) {
      // If modification is pending, process it
      modification.status = 1; // Processing
      console.log(`Modification for Task ${task.id} is being processed.`);
      setTimeout(() => {
        // Simulate processing completion
        modification.status = 2; // Completed
        console.log(`Modification for Task ${task.id} completed.`);

        // Handle next modification if available
        const nextModification = db.modificationQueues[task.id]?.shift();
        if (nextModification) {
          db.fileLock[task.id] = nextModification.userId;
          task.modifications.push({ ...nextModification, status: 0 }); // Push new modification with status 0 (pending)
        }
      }, 3000); // Simulate processing time
    }
  });
};

// GET endpoint to check task status
app.get("/status/:taskId", (req, res) => {
  const taskId = parseInt(req.params.taskId, 10);
  const task = db.tasks.find((t) => t.id === taskId);
  if (task) {
    res.json({ fileStatus: task.fileStatus, filePath: task.filePath });
  } else {
    res.status(404).json({ message: "Task not found." });
  }
});

// Function to process tasks from the queue
const processTasks = () => {
  if (taskQueue.length === 0) {
    console.log("No tasks in the queue.");
    return;
  }

  const cores = 8; // Increase cores for parallel processing
  for (let i = 0; i < cores && taskQueue.length > 0; i++) {
    const taskId = taskQueue[0]; // Get the first task in the queue
    const task = db.tasks.find((t) => t.id === taskId);
    if (task && task.fileStatus === 0) {
      // If task is pending and not yet processed
      if (db.fileLock[task.id]) {
        // File is locked, skip processing for now
        console.log(`Task ${taskId} skipped due to file lock.`);
        continue;
      }

      db.fileLock[task.id] = task.userId; // Lock the file
      task.fileStatus = 1; // Set status to processing
      console.log(`Task ${taskId} is being processed.`);

      setTimeout(() => {
        // Simulate processing completion
        task.fileStatus = 2; // Set status to completed
        task.filePath = `/files/${taskId}.wav`; // Simulate file path
        delete db.fileLock[task.id]; // Release file lock
        console.log(`Task ${taskId} completed. File path: ${task.filePath}`);

        // Process modifications if any
        processModifications(task);

        // Remove task from queue after completion
        taskQueue.shift();
      }, 3000); // Simulate processing time
    }
  }
};

// Simulate periodic task processing
setInterval(processTasks, 10000); // Process tasks every 10 seconds

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

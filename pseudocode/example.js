// MongoDB Database
let db = {
  tasks: [],
  taskIdCounter: 1,
};

// Queue
const taskQueue = [];

// Function to simulate POST request to backend
const postRequest = (promptText) => {
  const taskId = db.taskIdCounter++;
  const task = {
    id: taskId,
    prompt: promptText,
    fileStatus: 0, // 0: pending, 1: processing, 2: completed
    filePath: null,
  };
  db.tasks.push(task);
  taskQueue.push(taskId);
  console.log(`Task ${taskId} queued for processing.`);
  return taskId;
};

const processTasks = () => {
  if (taskQueue.length === 0) {
    console.log("No tasks in the queue.");
    simulateUserInteraction();
    return;
  }

  // Simulate multi-core processing
  const cores = 8;
  for (let i = 0; i < cores && taskQueue.length > 0; i++) {
    const taskId = taskQueue.shift();
    const task = db.tasks.find((t) => t.id === taskId);
    if (task) {
      task.fileStatus = 1; // processing
      console.log(`Task ${taskId} is being processed.`);
      setTimeout(() => {
        task.fileStatus = 2; // completed
        task.filePath = `/files/${taskId}.wav`; // Simulate file path
        console.log(`Task ${taskId} completed. File path: ${task.filePath}`);
      }, 3000); // Simulate processing time
    }
  }
};

const pollTaskStatus = (taskId) => {
  const interval = setInterval(() => {
    const task = db.tasks.find((t) => t.id === taskId);
    if (!task) {
      clearInterval(interval);
      console.log(`Task ${taskId} not found.`);
      return;
    }
    console.log(`Task ${taskId} status: ${task.fileStatus}`);
    if (task.fileStatus === 2) {
      clearInterval(interval);
      console.log(`Task ${taskId} is completed. File URL: ${task.filePath}`);
    }
  }, 1000); // Poll every second
};

const simulateUserInteraction = () => {
  const promptText = prompt("Enter your music prompt: ");
  if (promptText) {
    const taskId = postRequest(promptText);
    if (taskId) {
      pollTaskStatus(taskId);
    } else {
      console.log("Error generating music task.");
    }
  } else {
    console.log("No prompt entered.");
  }
};

setInterval(processTasks, 10000); // Process tasks every 10 seconds

simulateUserInteraction();

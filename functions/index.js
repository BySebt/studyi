const functions = require("firebase-functions");
const auth = require("./util/auth");
const express = require("express");
const cors = require("cors");

const app = express();

// Automatically allow cross-origin requests
app.use(cors({origin: true}));

const {
  createNewRevision,
  completedTask,
  getRevision,
  deleteRevision,
  getPendingRevision,
} = require("./APIs/revision");

const {
  getAllTasks,
  getOneTask,
  getDueTasks,
  createOneTask,
  deleteOneTask,
  taskSetFinishedDate,
  taskAddRevisionDueDate,
} = require("./APIs/tasks");

// Revision
app.get("/revision", auth, getPendingRevision);
app.get("/revision/:revision_id", auth, getRevision);
app.delete("/revision/:revision_id", auth, deleteRevision);
app.post("/revision/new", auth, createNewRevision, taskAddRevisionDueDate);
app.post("/revision/completed", auth, taskSetFinishedDate, completedTask);

// Todos
app.get("/todos", auth, getAllTasks);
app.get("/todos/due", auth, getDueTasks);
app.get("/todo/:todoId", auth, getOneTask);
app.post("/todo", auth, createOneTask);
app.delete("/todo/:todoId", auth, deleteOneTask);

// eslint-disable-next-line max-len
exports.api = functions
    .region("australia-southeast1")
    .runWith({timeoutSeconds: 15, memory: "128MB"})
    .https.onRequest(app);

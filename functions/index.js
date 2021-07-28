const functions = require("firebase-functions");
const auth = require("./util/auth");
const express = require("express");
// const path = require("path");
const app = express();

const {
  createNewRevision,
  completedTask,
  getRevision,
  deleteRevision,
  getPendingRevision,
} = require("./APIs/revision");

const {
  getAllTodos,
  getOneTodo,
  getTodosDue,
  postOneTodo,
  deleteTodo,
  updateTask,
} = require("./APIs/tasks");

// Revision
app.get("/revision", auth, getPendingRevision);
app.get("/revision/:revision_id", auth, getRevision);
app.delete("/revision/:revision_id", auth, deleteRevision);
app.post("/revision/new", auth, createNewRevision);
app.post("/revision/completed", auth, updateTask, completedTask);

// Todos
app.get("/todos", auth, getAllTodos);
app.get("/todos/due", auth, getTodosDue);
app.get("/todo/:todoId", auth, getOneTodo);
app.post("/todo", auth, postOneTodo);
app.delete("/todo/:todoId", auth, deleteTodo);

app.get("/token", auth);

// app.use(express.static(path.join(__dirname, "build")));
//
// app.get("/*", function(req, res) {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });

// eslint-disable-next-line max-len
exports.api = functions
    .region("us-central1")
    .runWith({timeoutSeconds: 15, memory: "128MB"})
    .https.onRequest(app);

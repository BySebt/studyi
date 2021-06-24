const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");
// const cors = require("cors");

// app.use(cors);

const {
  createNewRevision,
  completedTask,
  getPendingRevision,
} = require("./APIs/revision");

const {
  getAllTodos,
  getOneTodo,
  postOneTodo,
  deleteTodo,
  updateTask,
} = require("./APIs/todos");

const {
  loginUser,
  signUpUser,
  getUserDetail,
  updateUserDetails,
} = require("./APIs/users");

app.get("/revision", auth, getPendingRevision);
app.post("/revision/new", auth, createNewRevision);
app.post("/revision/completed", auth, updateTask, completedTask);

// Todos
app.get("/todos", auth, getAllTodos);
app.get("/todo/:todoId", auth, getOneTodo);
app.post("/todo", auth, postOneTodo);
app.delete("/todo/:todoId", auth, deleteTodo);

// Users
app.post("/login", loginUser);
app.post("/signup", signUpUser);
app.post("/user", auth, updateUserDetails);
app.get("/user", auth, getUserDetail);

app.get("/token", auth);

// eslint-disable-next-line max-len
exports.api = functions.region("australia-southeast1").runWith({timeoutSeconds: 15, memory: "128MB"}).https.onRequest(app);

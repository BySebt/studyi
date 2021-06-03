const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");
// const cors = require("cors");

// app.use(cors);

const {
  postRevisionOrGetStart,
  completedTask,
  skippedTask,
} = require("./APIs/revision")

const {
  getAllTodos,
  getOneTodo,
  postOneTodo,
  deleteTodo,
  editTodo,
} = require("./APIs/todos");

const {
  loginUser,
  signUpUser,
  getUserDetail,
  updateUserDetails,
} = require("./APIs/users");

app.post("/revision", auth, postRevisionOrGetStart);
app.post("/revision/completed", auth, completedTask);
app.post("/revision/skipped", auth, skippedTask);

// Todos
app.get("/todos", auth, getAllTodos);
app.get("/todo/:todoId", auth, getOneTodo);
app.post("/todo", auth, postOneTodo);
app.delete("/todo/:todoId", auth, deleteTodo);
app.put("/todo/:todoId", auth, editTodo);

// Users
app.post("/login", loginUser);
app.post("/signup", signUpUser);
app.post("/user", auth, updateUserDetails);
app.get("/user", auth, getUserDetail);

// eslint-disable-next-line max-len
exports.api = functions.region("australia-southeast1").runWith({timeoutSeconds: 15, memory: "128MB"}).https.onRequest(app);

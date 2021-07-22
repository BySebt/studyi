const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");
// const cors = require("cors");

// app.use(cors);

const {
  newUserWeeklyData,
  updateWeeklyData,
  getWeeklyData,
} = require("./APIs/weekly");

const {
  createNewRevision,
  completedTask,
  getPendingRevision,
} = require("./APIs/revision");

const {
  getAllTodos,
  getOneTodo,
    getTodosDue,
  postOneTodo,
  deleteTodo,
  updateTask,
} = require("./APIs/todos");

const {
  loginUser,
  signUpUser,
    deleteUser,
  getUserDetail,
  updateUserDetails,
} = require("./APIs/users");

// Dashboard
app.get("/weekly", auth, getWeeklyData);
app.post("/weekly/new", auth, newUserWeeklyData);
app.post("/weekly/update", auth, updateWeeklyData);

// Revision
app.get("/revision", auth, getPendingRevision);
app.post("/revision/new", auth, createNewRevision);
app.post("/revision/completed", auth, updateTask, completedTask);

// Todos
app.get("/todos", auth, getAllTodos);
app.get("/todos/due", auth, getTodosDue);
app.get("/todo/:todoId", auth, getOneTodo);
app.post("/todo", auth, postOneTodo, updateWeeklyData);
app.delete("/todo/:todoId", auth, deleteTodo);

// Users
app.post("/login", loginUser);
app.post("/signup", signUpUser, newUserWeeklyData);
app.post("/user", auth, updateUserDetails);
app.get("/user", auth, getUserDetail);
app.delete("/user/delete/:userID", deleteUser);

app.get("/token", auth);

// eslint-disable-next-line max-len
exports.api = functions.region("australia-southeast1").runWith({timeoutSeconds: 15, memory: "128MB"}).https.onRequest(app);

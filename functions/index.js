const functions = require("firebase-functions");
const app = require("express")();
const auth = require("./util/auth");
// const cors = require("cors");

// app.use(cors);

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
  uploadProfilePhoto,
  getUserDetail,
  updateUserDetails,
} = require("./APIs/users");

// Todos
app.get("/todos", auth, getAllTodos);
app.get("/todo/:todoId", auth, getOneTodo);
app.post("/todo", auth, postOneTodo);
app.delete("/todo/:todoId", auth, deleteTodo);
app.put("/todo/:todoId", auth, editTodo);

// Users
app.post("/login", loginUser);
app.post("/signup", signUpUser);
app.post("/user/image", auth, uploadProfilePhoto);
app.post("/user", auth, updateUserDetails);
app.get("/user", auth, getUserDetail);

// eslint-disable-next-line max-len
exports.api = functions.region("australia-southeast1").runWith({timeoutSeconds: 15, memory: "128MB"}).https.onRequest(app);

// todos.js

const {db} = require("../util/admin");

exports.getAllTodos = (request, response, functions) => {
  console.log(`/users/${request.user.userId}/tasks`);
  db
      .collection(`/users/${request.user.uid}/tasks`)
      .orderBy("date_created", "desc")
      .get()
      .then((data) => {
        const todos = [];
        data.forEach((doc) => {
          todos.push({
            todoId: doc.id,
            name: doc.data().name,
            length_seconds: doc.data().length_seconds,
            description: doc.data().description,
            date_created: doc.data().date_created,
            next_due_date: doc.data().next_due_date,
            status: doc.data().status,
          });
        });
        return response.json(todos);
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({error: err.code});
      });
};

exports.postOneTodo = (request, response, functions) => {
  const newTodoItem = {
    name: request.body.name,
    description: request.body.description,
    length_seconds: request.body.length_seconds,
    next_due_date: request.body.next_due_date,
    date_created: new Date().toISOString(),
  };
  db
      .collection(`/users/${request.user.userId}/tasks`)
      .add(newTodoItem)
      .catch((err) => {
        response.status(500).json({error: "Something went wrong."});
        console.error(err);
      });
};

exports.getOneTodo = (request, response) => {
  db
      .doc(`/users/${request.user.userId}/tasks/${request.params.todoId}`)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return response.status(404).json({error: "Task not found."});
        }
        const TodoData = doc.data();
        TodoData.todoId = doc.id;
        return response.json(TodoData);
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({error: err.code});
      });
};

exports.deleteTodo = (request, response, functions) => {
  // eslint-disable-next-line max-len
  const document = db.doc(`/users/${request.user.userId}/tasks/${request.params.todoId}`);
  document
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return response.status(404).json({error: "Task not found."});
        }
        return document.delete();
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({error: err.code});
      });
};

exports.editTodo = ( request, response, functions ) => {
  if (request.body.todoId || request.body.createdAt) {
    response.status(403).json({message: "Not allowed to edit"});
  }
  const document = db.collection("todos").doc(`${request.params.todoId}`);
  document.update(request.body)
      .then(()=> {
        response.json({message: "Updated successfully"});
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({
          error: err.code,
        });
      });
};

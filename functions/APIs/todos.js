const {db} = require("../util/admin");

exports.getAllTodos = (request, response, functions) => {
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
            time_required: doc.data().time_required,
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

exports.getTodosDue = (request, response, functions) => {
    db
        .collection(`/users/${request.user.uid}/tasks`)
        .where("next_due_date", "<", Date.now())
        .get()
        .then((data) => {
            // can be more efficient
            const todos = [];
            data.forEach((doc) => {
                todos.push({
                    todoId: doc.id,
                    name: doc.data().name,
                    time_required: doc.data().time_required,
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

exports.postOneTodo = (request, response, next) => {

    request.finished_task = false;
    request.new_task = true;

  const newTodoItem = {
    name: request.body.name,
    description: request.body.description,
    time_required: request.body.time_required,
    next_due_date: request.body.next_due_date,
    date_created: request.body.date_created,
    status: request.body.status,
  };
  db
      .collection(`/users/${request.user.uid}/tasks`)
      .add(newTodoItem)
      .then(()=>{
          return next();
        // return response.json(responseTodoItem);
      })
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
  const document = db.doc(`/users/${request.user.uid}/tasks/${request.params.todoId}`);
  document
      .delete()
      .then((doc) => {
        return response.status(200).json({general: "Done."});
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({error: err.code});
      });
};

exports.updateTask = ( request, response, next ) => {

    request.finished_task = true;
    request.new_task = false;

  // eslint-disable-next-line max-len
  const document = db.doc(`/users/${request.user.uid}/tasks/${request.body.finished_task_id}`);

  console.log("Updating tasks")

  switch (request.body.finished_task_status) {
    case "FIRST_REVISION":
      document.update({
        next_due_date: Date.now() + 1.728e+8,
        status: "SECOND_REVISION",
      }).then((r) => {
          next();
      });
      break;
    case "SECOND_REVISION":
      document.update({
        next_due_date: Date.now() + 2.592e+8,
        status: "THIRD_REVISION",
      }).then((r) => {
          next();
      });
      break;
    case "THIRD_REVISION":
      document.delete().then((r) => {
          next();
      });
  }
};

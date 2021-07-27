const {db} = require("../util/admin");

exports.getAllTodos = (request, response, functions) => {
  db
      .collection(`/users/${request.user.uid}/tasks`)
      .orderBy("date_created", "desc")
      .get()
      .then((res) => {
        return response.json(res.docs.map((document) => document.data()));
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
      .then((res) => {
        return response.json(res.docs.map((document) => document.data()));
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
      .then((r) => {
        return db.doc(`/users/${request.user.uid}/tasks/${r.id}`).set({
          id: r.id,
        }, {merge: true});
      })
      .then(() => {
        return response.status(201).json("Task created.");
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

exports.updateTask = (request, response, next) => {
  request.finished_task = true;
  request.new_task = false;

  // eslint-disable-next-line max-len
  const document = db
      .doc(`/users/${request.user.uid}/tasks/${request.body.finished_task_id}`);

  document
      .get()
      .then((doc) => {
        console.log(doc.data());
        return {
          last_due_date: doc.data().next_due_date,
          last_task_status: doc.data().status,
        };
      })
      .then((r) => {
        const update = getTaskUpdateDocument(
            r.last_task_status, r.last_due_date);
        return update;
      })
      .then((r) => {
        document.set({
          next_due_date: r.next_due_date,
          status: r.status,
          [r.last_task_status]: {
            finished_ms: Date.now(),
            due_date: r.last_due_date,
          },
        }, {merge: true})
            .then(() => {
              return response.status(201).json("Updated.");
            });
      });
};

// eslint-disable-next-line camelcase,require-jsdoc
function getTaskUpdateDocument(last_task_status, last_due_date) {
  console.log(last_task_status);
  console.log(last_due_date);

  // eslint-disable-next-line camelcase
  const task_update_doc = {
    next_due_date: -1,
    status: "",
    last_task_status: last_task_status,
    last_due_date: last_due_date,
  };

  // eslint-disable-next-line camelcase
  switch (last_task_status) {
    case "FIRST_REVISION":
      task_update_doc.next_due_date = Date.now() + 1.728e+8;
      task_update_doc.status = "SECOND_REVISION";
      break;
    case "SECOND_REVISION":
      task_update_doc.next_due_date = Date.now() + 2.592e+8;
      task_update_doc.status = "SECOND_REVISION";
      break;
    case "THIRD_REVISION":
      task_update_doc.next_due_date = -1;
      task_update_doc.status = "FINISHED";
      break;
    case "FINISHED":
      return;
  }

  // eslint-disable-next-line camelcase
  return task_update_doc;
}

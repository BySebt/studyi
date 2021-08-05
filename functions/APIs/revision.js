const {
  db,
} = require("../util/admin");

exports.getPendingRevision = (request, response) => {
  db
      .collection(`/users/${request.user.uid}/revision`)
  // Filter for revisions that are not finished
      .where("finished", "==", false)
      .get()
      .then((r) => {
        // If the response is empty, there are no pending tasks.
        if (r.empty) {
          return response.json({
            status: "NO_PENDING_REVISION",
          });
        }

        // If there is an unfinished task...
        r.forEach( async (doc) => {
          const revisionDoc = doc.data();
          let totalTasks = revisionDoc.revision_tasks.length;

          revisionDoc.id = doc.id;

          // Loop through all tasks and append the data
          for (let i = 0; i < totalTasks; i++) {
            // The use of a promise here ensures
            // the for loop only contiunes after one finishes
            await new Promise((next) => {
              db.
                  doc(`/users/${request.user.uid}/tasks/
              ${revisionDoc.revision_tasks[i].id}`)
                  .get()
                  .then((task) => {
                    // If the revision task no longer exists
                    if (!task.data()) {
                      // Delete the revision task from the array
                      revisionDoc.revision_tasks.splice(i, 1);

                      // Roll back a step with the number i and total_tasks,
                      // to not run out of index.
                      i--;
                      totalTasks--;
                    } else {
                      // Append the task data to the return array
                      Object.assign(revisionDoc.revision_tasks[i], task.data());
                    }

                    // If this is the last iteration
                    if (i === (totalTasks - 1)) {
                      // Return the reponse as it is finished
                      return response.json({revisionDoc});
                    }

                    // If it is not finished, call the next iteration
                    next();
                  });
            });
          }
        });
      });
};

exports.getRevision = (request, response) => {
  // db.doc("/users/xWiorzSCJUYhoytoSyJpi89nnft2/tasks/E7NSI9JYxkWEYSWrPQQA")
  //     .get()
  //     .then((doc) => {
  //       console.log(doc.data());
  //     });

  db.doc(`/users/${request.user.uid}/revision/${request.params.revision_id}`)
      .get()
      .then(async (doc) => {
        // If the document does not exist.
        if (!doc.exists) {
          return response.status(404).json({
            error: "REVISION_NOT_FOUND",
          });
        }

        console.log(doc.data());

        const revisionDoc = doc.data();
        let totalTasks = revisionDoc.revision_tasks.length;

        revisionDoc.id = doc.id;

        // Loop through all tasks and append the data
        for (let i = 0; i < totalTasks; i++) {
          // The use of a promise here ensures
          // the for loop only contiunes after one finishes
          await new Promise((next) => {
            // eslint-disable-next-line max-len
            console.log(`/users/${request.user.uid}/tasks/${revisionDoc.revision_tasks[i].id}`);

            // eslint-disable-next-line max-len
            db.doc(`/users/${request.user.uid}/tasks/${revisionDoc.revision_tasks[i].id}`)
                .get()
                .then((task) => {
                  console.log(task.data());

                  // If the revision task no longer exists
                  if (!task.data()) {
                    // Delete the revision task from the array
                    revisionDoc.revision_tasks.splice(i, 1);

                    // Roll back a step with the
                    // number i and total_tasks, to not run out of index.
                    i--;
                    totalTasks--;
                  } else {
                    // Append the task data to the return array
                    Object.assign(revisionDoc.revision_tasks[i], task.data());
                  }

                  console.log(JSON.stringify(revisionDoc));

                  // If this is the last iteration
                  if (i === (totalTasks - 1)) {
                    // Return the reponse as it is finished
                    return response.status(201).json({revisionDoc});
                  }

                  // If it is not finished, call the next iteration
                  next();
                });
          });
        }
      });
};


exports.createNewRevision = (request, response) => {
  const revisionTaskArray = [];

  request.body.revision_tasks.forEach((item) => {
    revisionTaskArray.push({
      id: item.id,
      finished: false,
    });
  });

  const newRevision = {
    revision_tasks: revisionTaskArray,
    start_time: request.body.start_time,
    total_tasks: request.body.revision_tasks.length,
    time_left: request.body.time_left,
    finished: false,
    tasks_completed: 0,
    tasks_left: request.body.revision_tasks.length,
  };

  db
      .collection(`/users/${request.user.uid}/revision`)
      .add(newRevision)
      .then((r) => {
        return response.json(r.id);
      }).catch((err) => {
        console.error(err);
        return response.status(500).json({
          error: err.code,
        });
      });
};

exports.deleteRevision = (request, response) => {
  // eslint-disable-next-line max-len
  const doc = db.doc(`/users/${request.user.uid}/revision/${request.params.revision_id}`);

  doc.delete()
      .then((r) => {
        return response.status(201);
      }).catch((error) => {
        console.log(error);
        return response.status(404).json({
          error: "NOT_FOUND",
        });
      });

  doc.get().then((r) => {
    const updateData = {
      finished: request.body.finished,
      revision_tasks: request.body.revision_tasks,
      tasks_completed: request.body.tasks_completed,
      tasks_left: request.body.tasks_left,
      time_left: request.body.time_left,
    };

    doc.update(updateData)
        .then((updateVariableResponse) => {
          return response.json(updateVariableResponse);
        })
        .catch((err) => {
          console.error(err);
          return response.status(500).json({
            error: err.code,
          });
        });
  });
};

exports.completedTask = (request, response) => {
  // eslint-disable-next-line max-len
  const collection = db.collection(`/users/${request.user.uid}/revision/`);
  const doc = collection.doc(`${request.body.id}`);

  doc.get().then((r) => {
    const updateData = {
      finished: request.body.finished,
      revision_tasks: request.body.revision_tasks,
      tasks_completed: request.body.tasks_completed,
      tasks_left: request.body.tasks_left,
      time_left: request.body.time_left,
    };

    doc.update(updateData)
        .then((updateVariableResponse) => {
          return response.json(updateVariableResponse);
        })
        .catch((err) => {
          console.error(err);
          return response.status(500).json({
            error: err.code,
          });
        });
  });
};

const {db} = require("../util/admin");

exports.postRevisionOrGetStart = (request, response, functions) => {
  db
      .collection(`/users/${request.user.uid}/revision`)
      .get()
      .then((data) => {
        let unfinishedTask = [];
        data.forEach((doc) => {
          if (!doc.data().finished) {
            unfinishedTask = doc;
          }
        });

        // There are no unfinished revisions - create new session
        if (unfinishedTask.length === 0) {
          const newRevision = {
            revision_tasks: request.body.revision_tasks,
            start_time: request.body.start_time,
            total_tasks: request.body.revision_tasks.length,
            time_left_seconds: request.body.time_left_seconds,
            finished: false,
            task_completed: 0,
            task_left: request.body.revision_tasks.length,
            task_skipped: 0,
          };

          db
              .collection(`/users/${request.user.uid}/revision`)
              .add(newRevision)
              .then((r)=>{
                return response.json(r.id);
              });
        }

        // There is a unfinished revision
        return response.json(unfinishedTask[0]);
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({error: err.code});
      });
};

exports.completedTask = (request, response, functions) => {
  // eslint-disable-next-line max-len
  const collection = db.collection(`/users/${request.user.uid}/revision/${request.body.revision_id}`);

  // Get the collection of the tasks and set it to completed
  collection.doc(`/revision_tasks/${request.body.task_id}`).update({
    completed: true,
  });

  // Update variables of the revision document
  collection.doc().update({
    task_completed: collection.doc().task_completed + 1,
    task_left: collection.doc().task_left - 1,
    time_left_seconds: request.body.time_left_seconds,
  })
      .then((updateVariableResponse)=>{
        // After updating the main variables, check if the task is finished.
        if (collection.doc().task_left === 0) {
          collection.doc().update({
            finished: true,
            finished_time: Date.now(),
          }).then((finishTaskResponse) => {
            return response.json(finishTaskResponse);
          });
        }
        return response.json(updateVariableResponse);
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({error: err.code});
      });
};

exports.skippedTask = (request, response, functions) => {
  // eslint-disable-next-line max-len
  const collection = db.collection(`/users/${request.user.uid}/revision/${request.body.revision_id}`);

  // Get the collection of the tasks and set it to completed
  collection.doc(`/revision_tasks/${request.body.task_id}`).update({
    skipped: true,
  });

  // Update variables of the revision document
  collection.doc().update({
    task_skipped: collection.doc().task_skipped + 1,
    task_left: collection.doc().task_left - 1,
    time_left_seconds: request.body.time_left_seconds,
  })
      .then((updateVariableResponse)=>{
        // After updating the main variables, check if the task is finished.
        if (collection.doc().task_left === 0) {
          collection.doc().update({
            finished: true,
            finished_time: Date.now(),
          }).then((finishTaskResponse) => {
            return response.json(finishTaskResponse);
          });
        }
        return response.json(updateVariableResponse);
      })
      .catch((err) => {
        console.error(err);
        return response.status(500).json({error: err.code});
      });
};

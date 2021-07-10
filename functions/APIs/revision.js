const {
    db,
} = require("../util/admin");

function l(message) {
    console.log("[REVISION API] " + message);
}


exports.getPendingRevision = (request, response) => {

    l("-------------------------------")

    db
        .collection(`/users/${request.user.uid}/revision`)
        // Filter for revisions that are not finished
        .where("finished", "==", false)
        .get()
        .then((r) =>  {

            // If the response is empty, there are no pending tasks.
            if (r.empty) {
                return response.json({
                    status: "NO_PENDING_REVISION",
                });
            }

            // If there is an unfinished task...
            r.forEach(async (doc) => {
                const revisionDoc = doc.data();
                let total_tasks = revisionDoc.revision_tasks.length;

                // Loop through all tasks and append the data
                for (let i = 0; i < total_tasks; i++) {

                    // The use of a promise here ensures the for loop only contiunes after one finishes
                    await new Promise(next => {
                        db.doc(`/users/${request.user.uid}/tasks/${revisionDoc.revision_tasks[i].id}`)
                            .get()
                            .then((task) => {
                                // Append the task data to the return array
                                Object.assign(revisionDoc.revision_tasks[i], task.data());

                                // If this is the last iteration
                                if (i + 1 === total_tasks) {
                                    // Return the reponse as it is finished
                                    return response.json({revisionDoc});
                                }

                                // If it is not finished, call the next iteration
                                next();
                            })
                    })
                }
            })
        })
};

exports.createNewRevision = (request, response) => {
    const revisionTaskArray = [];

    request.body.revision_tasks.forEach((item) => {
        revisionTaskArray.push({
            id: item.todoId,
            finished: false,
            skipped: false,
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
        tasks_skipped: 0,
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

exports.completedTask = (request, response) => {
    // eslint-disable-next-line max-len
    const collection = db.collection(`/users/${request.user.uid}/revision/`);
    const doc = collection.doc(`${request.body.revision_id}`);
    const data = doc.data();
    let i = 0;

    const updateData = [];

    const revisionTasks = data.revision_tasks;

    for (i; i < revisionTasks.length; i++) {
        if (revisionTasks[i].id === request.body.task_id) {
            revisionTasks[i].finished = true;
        }
    }

    updateData.push(revisionTasks);
    updateData.push({
        tasks_completed: data.tasks_completed++,
        tasks_left: data.task_left -= 1,
        time_left_seconds: request.body.time_left_seconds,
    });

    doc.update(updateData)
        .then((updateVariableResponse) => {
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
            return response.status(500).json({
                error: err.code,
            });
        });
};
const {
    db,
} = require("../util/admin");

function l(message) {
    console.log("[DASHBOARD API] " + message);
}

exports.newUserWeeklyData = async (request, response) => {

    let ms = request.body.monday_ms;
    l("Creating new user weekly data. Monday MS: " + ms)

    // Number represent days. 1 = Monday and 7 = Sunday
    const new_weekly_data = {
        monday: {},
        tuesday: {},
        wednesday: {},
        thursday: {},
        friday: {},
        saturday: {},
        sunday: {},
    };

    for (const day in new_weekly_data) {
        // The use of a promise here ensures the for loop only contiunes after one finishes
        await new Promise(next => {
            let obj = {
                start_ms: ms,
                end_ms: ms + 86399999,
                total_tasks: 0,
                finished_tasks: 0,
            }

            Object.assign(new_weekly_data[day], obj)
            ms += 8.64e+7;

            if (day === "sunday") {
                db
                    .doc(`/users/${request.userID}`)
                    .set(new_weekly_data, {merge: true})
                    .then(() => {
                        return response.status(201).json({
                            token: request.token,
                            userID: request.userID,
                        })
                    }).catch((err) => {
                    console.error(err);
                    return response.status(500).json({
                        error: err.code,
                    });
                });
            }

            // If it is not finished, call the next iteration
            next();
        })
    }
};

exports.updateWeeklyData = (request, response) => {

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

    const ms = request.body.next_due_date;
    const finished_task = request.finished_task;
    const new_task = request.new_task;
    let found_day = false;

    db
        .doc(`/users/${request.user.uid}`)
        .get()
        .then((r) => {
            const data = r.data();
            for (const day in data) {
                if (days.includes(day)) {
                    if (found_day)
                        return

                    l(parseInt(data[day].total_tasks))

                    if (data[day].start_ms < ms && data[day].end_ms > ms) {
                        found_day = true;

                        db.doc(`/users/${request.user.uid}/`).set({
                            [day]: {
                                total_tasks: parseInt(data[day].total_tasks) + (new_task ? 1 : 0),
                                finished_tasks: parseInt(data[day].finished_tasks)  + (finished_task ? 1 : 0),
                            }
                        }, {merge : true}).then((update_response) => {
                            return response.json(update_response);
                        }).catch((err) => {
                            console.error(err);
                            return response.status(500).json({
                                error: err.code,
                            });
                        });
                    }
                }
            }
        }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            error: err.code,
        });
    });
};

exports.getWeeklyData = (request, response) => {
    db
        .doc(`/users/${request.user.uid}`)
        .get()
        .then((r) => {
            return response.json(r.data());
        }).catch((err) => {
        console.error(err);
        return response.status(500).json({
            error: err.code,
        });
    });
};

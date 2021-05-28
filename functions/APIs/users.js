const {admin, db} = require("../util/admin");
const config = require("../util/config");

const firebase = require("firebase");

firebase.initializeApp(config);

// Login
exports.loginUser = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        return response.json({token});
      })
      .catch((error) => {
        console.error(error);
        return response.status(403).json(
            {
              error: "WRONG_CREDENTIALS",
            }
        );
      });
};

// Sign up
exports.signUpUser = (request, response) => {
  const newUser = {
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
  };

  let token; let userId;
  db.doc(`/users/${newUser.email}`).get()
      .then((doc) => {
        if (doc.exists) {
          return response.status(400).json({error: "EMAIL_TAKEN"});
        } else {
          return firebase
              .auth()
              .createUserWithEmailAndPassword(
                  newUser.email,
                  newUser.password
              );
        }
      })
      .then((data) => {
        userId = data.user.uid;
        const userData = [];
        userData.push({
          token: data.user.getIdToken(),
          id: data.user.uid,
        });
        return userData;
      })
      .then((idtoken) => {
        token = idtoken;
        const currentDate = new Date();
        const userCredentials = {
          name: newUser.name,
          email: newUser.email,
          signup_date: currentDate.getTime(),
          userId,
        };
        return db.doc(`/users/${userId}`).set(userCredentials);
      })
      .then(()=>{
        return response.status(201).json({token});
      })
      .catch((err) => {
        console.error(err);
        if (err.code === "auth/email-already-in-use") {
          return response.status(400).json({error: "EMAIL_TAKEN"});
        } else {
          return response.status(500).json({error: "UNKNOWN_ERROR"});
        }
      });
};

exports.getUserDetail = (request, response) => {
  const userData = {};
  db
      .doc(`/users/${request.user.username}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          userData.userCredentials = doc.data();
          return response.json(userData);
        }
      })
      .catch((error) => {
        console.error(error);
        return response.status(500).json({error: error.code});
      });
};

exports.updateUserDetails = (request, response) => {
  const document = db.collection("users").doc(`${request.user.username}`);
  document.update(request.body)
      .then(()=> {
        response.json({message: "Updated successfully"});
      })
      .catch((error) => {
        console.error(error);
        return response.status(500).json({
          message: "Cannot Update the value",
        });
      });
};

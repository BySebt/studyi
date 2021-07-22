const {admin, db} = require("../util/admin");
const config = require("../util/config");

const firebase = require("firebase");

firebase.initializeApp(config);

exports.deleteUser = ( request, response) => {

    db.doc(`/users/${request.params.userID}`).delete()
        .then((r) => {
            admin
                .auth()
                .deleteUser(`${request.params.userID}`)
                .then(() => {
                    // See the UserRecord reference doc for the contents of userRecord.
                    console.log(`Successfully deleted user.`);
                    return response.status(201).json("DELETED_USER");
                })
                .catch((error) => {
                    console.log('Error deleting user:', error);
                    return response.status(500).json(error);
                });
        })
        .catch((error) => {
            console.log('Error deleting user documents:', error);
            return response.status(500).json(error);
        })


}

// Login
exports.loginUser = (request, response) => {
  const user = {
    email: request.body.email,
    password: request.body.password,
  };

  let userID = "";

  firebase
      .auth()
      .signInWithEmailAndPassword(user.email, user.password)
      .then((data) => {
          userID = data.user.uid;
          return data.user.getIdToken();
      })
      .then((token) => {
          return response.status(201).json({
              token: token,
              userID: userID,
          })
      })
      .catch((error) => {
        console.error(error);
        return response.status(403).json({error: "WRONG_CREDENTIALS"});
      });
};

// Sign up
exports.signUpUser = (request, response, next) => {
  const newUser = {
    name: request.body.name,
    email: request.body.email,
    password: request.body.password,
  };

  let token; let userId;
  db.doc(`/users/${newUser.email}`)
      .get()
      .then((doc) => {
        if (doc.exists) {
          return response.status(400).json({error: "EMAIL_TAKEN"});
        } else {
          return firebase
              .auth()
              .createUserWithEmailAndPassword(
                  newUser.email,
                  newUser.password
              )
        }
      })
      .then((data) => {
        userId = data.user.uid;
        // ID Token is returns a promise, hence must wait for then chain
        return data.user.getIdToken();
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

        // Add user details (Not sure of this is useful)
        return db.doc(`/users/${userId}`).set(userCredentials);
      })
      .then(()=>{
          // Attach the user id and token to the request, then pass onto weekly data initalisation
          request.userID = userId;
          request.token = token;

          // return response.status(201).json({
          //     token: token,
          //     userID: userId,
          // })

          return next();
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

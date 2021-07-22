const {admin, db} = require("./admin");

module.exports = (request, response, next) => {
  let idToken;
  // eslint-disable-next-line max-len
  if (request.headers.authorization && request.headers.authorization.startsWith("Bearer ")) {
    idToken = request.headers.authorization.split("Bearer ")[1];
  } else {
    return response.status(403).json({
      err: "NO_TOKEN",
    });
  }

  admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        request.user = decodedToken;
        // eslint-disable-next-line max-len
        return db.collection("users").where("userId", "==", request.user.uid).limit(1).get();
      })
      .then((data) => {
        return next();
      })
      .catch((err) => {
        return response.status(403).json({
          err: "INVALID_OR_EXPIRED_TOKEN",
          full_error: err,
        });
      });
};


const {admin} = require("./admin");

// This is the middleware that handles authentication requests
module.exports = (request, response, next) => {
  let idToken;
  if (request.headers.authorization &&
      request.headers.authorization.startsWith("Bearer ")) {
    idToken = request.headers.authorization.split("Bearer ")[1];
  } else {
    return response.status(403).json({
      error: "NO_TOKEN",
    });
  }

  admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        console.log(decodedToken);
        // Attach the user object to request.user,
        // for accessing in whatever may follow.
        request.user = decodedToken;
        return next();
      })
      .catch((err) => {
        console.log(err);
        return response.status(403).json({
          error: err.code,
        });
      });
};


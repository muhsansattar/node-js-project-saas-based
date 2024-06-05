// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const keys = require("../config/keys");

const authMiddleware = (req, res, next) => {
  // Get the token from the request headers
  const token = req.header("Authorization");

  // Check if token is not provided
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token.split(" ")[1], keys.secretOrKey);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Move to the next middleware or route handler
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Unauthorized: Invalid token" });
  }
};

module.exports = authMiddleware;

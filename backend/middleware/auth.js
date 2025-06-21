//Protecting Routes

const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token = req.headers.authorization; //Get token from headers
  if (!token) return res.status(401).json({ error: "Access denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); //Verify JWT
    req.user = verified; // Store user info in request object
    next(); // Allow next middlware or route
  } catch {
    res.status(400).json({ error: "Invalid token" });
  }
};

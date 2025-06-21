const User = require("../models/user"); // Import User model
const bcrypt = require("bcryptjs"); // For Hashing password
const jwt = require("jsonwebtoken"); // For generating JWT tokens

// Register Function
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // Destructure request body
  const hashedPassword = await bcrypt.hash(password, 3); // Encrypt password

  try {
    const user = new User({ name, email, password: hashedPassword, role }); // create user obj
    await user.save(); // save user to DB
    res.status(201).json({ message: "User registered" }); //Respond success
  } catch (err) {
    res.status(400).json({ error: "Email already exists" }); //catch duplicate email
  }
};

// Login function

exports.login = async (req, res) => {
  console.log(User);
  const { email, password } = req.body; // Destructure request body
  const user = await User.findOne({ email }); // Find user by email
  if (!user) return res.status(400).json({ error: "invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password); //Compare password
  if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  ); //Create JWT token
  res.json({ token, role: user.role, name: user.name }); // Respond with token and role
};

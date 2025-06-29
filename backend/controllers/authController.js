const User = require("../models/user"); // Import User model
const bcrypt = require("bcryptjs"); // For Hashing password
const jwt = require("jsonwebtoken"); // For generating JWT tokens
const nodemailer = require("nodemailer");

// Register Function
exports.register = async (req, res) => {
  const { name, email, password, role } = req.body; // Destructure request body
  const hashedPassword = await bcrypt.hash(password, 10); // Encrypt password

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
  const { email, password } = req.body; // Destructure request body
  const user = await User.findOne({ email }); // Find user by email

  if (!user) return res.status(400).json({ error: "invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password); //Compare password
  if (!isMatch) return res.status(400).json({ error: "Invalid Credentials" });

  if (!user.isActive) return res.status(400).json({ error: "Access denied" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  ); //Create JWT token
  res.json({ token, role: user.role, name: user.name }); // Respond with token and role
};

//function forgotpassord
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `https://excel-project-frontend.onrender.com/resetpassword/${token}`;
    console.log(resetLink);
    //configure transporter
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Data Canvas" <no-reply@DataCanvas.com>',
      to: user.email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.
      Link expires in 15 mins.</p>`,
    });
    res.status(201).json({ message: "Reset link sent to email" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error sending reset email" });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.status(200).json({ message: "password reset successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

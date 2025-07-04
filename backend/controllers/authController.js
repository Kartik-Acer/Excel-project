const User = require("../models/user"); // Import User model
const bcrypt = require("bcryptjs"); // For Hashing password
const jwt = require("jsonwebtoken"); // For generating JWT tokens
const sgMail = require("@sendgrid/mail");

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

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    const resetLink = `https://excel-project-frontend.onrender.com/resetpassword/${token}`;

    //Email Content
    const message = {
      to: email,
      from: {
        name: "Data Canvas",
        email: process.env.EMAIL_FROM,
      },
      subject: "Reset Your Password",
      html: `<p>Hello,</p>
      <p>You requested a password reset. Click the link below:</p>
      <a href="${resetLink}">${resetLink}</a> <p>This link is valid for 15 minutes</p>`,
    };

    await sgMail.send(message);

    res.status(201).json({ message: "Reset link sent to email" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
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

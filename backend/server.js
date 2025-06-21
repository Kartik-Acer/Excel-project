const express = require("express"); // Import Express framework
const mongoose = require("mongoose"); //connet and work with MongoDB
const cors = require("cors"); // Enable Cross-Origin Resourse sharing (for frontend api calls)
require("dotenv").config(); // Load Environment variables from .env

const app = express(); // Initialize express application

app.use(cors()); // Allow frontend (e.g. localhost:5000) to access backend
app.use(express.json()); // parse incoming json request bodies
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./routes/authRoutes")); // use authenticaiton routes at /api/register and /api/login
app.use("/api", require("./routes/uploadRoutes")); // files upload route
app.use("/api", require("./routes/AdminRoutes")); // admin route

mongoose
  .connect(process.env.MONGO_URI) // Connect to MongoDB atlas using .env key
  .then(() => console.log("MongoDb Connected")) //success
  .catch((err) => console.error("DB Error:", err)); //failure

const PORT = process.env.PORT || 5000; // Use PORT from .env or default to 5000
app.listen(PORT, () => console.log(`server running on port ${PORT}`)); //start server

const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const path = require("path");
const fs = require("fs");
const FileUpload = require("../models/upload");
const auth = require("../middleware/auth");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".xlsx", ".xls"];
  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error("Only Excel files (.xlsx, .xls) are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Upload Excel file
router.post("/upload", auth, upload.single("excelFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    if (jsonData.length === 0) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    // Extract headers and data
    const headers = jsonData[0];
    const dataRows = jsonData.slice(1);

    // Convert to array of objects
    const data = dataRows.map((row) => {
      const rowObject = {};
      headers.forEach((header, index) => {
        const value = row[index];
        rowObject[header || `Column ${index + 1}`] =
          value !== undefined ? value : null;
      });
      return rowObject;
    });

    // Create columns array
    const columns = headers.map((header, index) => ({
      name: header || `Column ${index + 1}`,
    }));

    // Save file info and data to database
    const fileUpload = new FileUpload({
      userId: req.user.id,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      columns,
      data, // Store the actual Excel data
    });

    await fileUpload.save();

    res.json({
      fileId: fileUpload.id,
      filename: fileUpload.originalName,
      columns,
      data: data.slice(0, 10), // Return first 10 rows for preview
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing file", error: error.message });
  }
});

// Get file data for chart generation - NOW FETCHES FROM DATABASE
router.get("/:fileId/data", auth, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findOne({
      _id: req.params.fileId,
      userId: req.user.id,
    }).select("columns data originalName");

    if (!fileUpload) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({
      columns: fileUpload.columns,
      data: fileUpload.data,
      filename: fileUpload.originalName,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching file data", error: error.message });
  }
});

// Get file data preview (first 10 rows) - OPTIMIZED FOR DASHBOARD
router.get("/:fileId/preview", auth, async (req, res) => {
  try {
    const fileUpload = await FileUpload.findOne({
      _id: req.params.fileId,
      userId: req.user.id,
    }).select("columns data originalName");

    if (!fileUpload) {
      return res.status(404).json({ message: "File not found" });
    }

    res.json({
      columns: fileUpload.columns,
      data: fileUpload.data.slice(0, 10), // Only first 10 rows
      filename: fileUpload.originalName,
      totalRows: fileUpload.data.length,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching file preview", error: error.message });
  }
});

// Save chart analysis
router.post("/:fileId/analysis", auth, async (req, res) => {
  try {
    const { chartType, xAxis, yAxis, chartConfig } = req.body;

    const fileUpload = await FileUpload.findOne({
      _id: req.params.fileId,
      userId: req.user.id,
    });

    if (!fileUpload) {
      return res.status(404).json({ message: "File not found" });
    }

    fileUpload.analyses.push({
      chartType,
      xAxis,
      yAxis,
      chartConfig,
    });

    await fileUpload.save();

    res.json({ message: "Analysis saved successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving analysis", error: error.message });
  }
});

// Get user's file history - OPTIMIZED TO EXCLUDE LARGE DATA FIELD
router.get("/history", auth, async (req, res) => {
  try {
    const files = await FileUpload.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select("-data -filePath"); // Exclude large data field and file path for performance

    res.json(files);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching history", error: error.message });
  }
});

module.exports = router;

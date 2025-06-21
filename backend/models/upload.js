const mongoose = require("mongoose");

const fileUploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    columns: [
      {
        name: String,
      },
    ],
    // Store the actual Excel data as JSON
    data: {
      type: [mongoose.Schema.Types.Mixed], // Array of objects
      required: true,
    },
    analyses: [
      {
        chartType: String,
        xAxis: String,
        yAxis: String,
        chartConfig: Object,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FileUpload", fileUploadSchema);
